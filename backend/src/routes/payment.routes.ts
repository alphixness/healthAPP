import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { authMiddleware } from '../middleware/auth';
import { ENV } from '../config/env';
import { success, error } from '../utils/response';
import * as paymentService from '../services/payment.service';
import * as membershipService from '../services/membership.service';

const router = Router();

/** 验证支付回调签名，防止伪造回调 */
function verifyNotifySignature(req: Request): boolean {
  const signature = req.headers['x-signature'] as string | undefined;
  if (!signature) return false;

  const payload = JSON.stringify(req.body);
  const expected = crypto
    .createHmac('sha256', ENV.PAYMENT_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  // 使用 timing-safe 比较防止时序攻击
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

// GET /api/v1/payments/price — 获取区域定价
router.get('/price', (req: Request, res: Response) => {
  try {
    const region = (req.query.region as 'china' | 'global') || 'china';
    const pricing = paymentService.getPricingByRegion(region);
    if (!pricing) { error(res, '该区域暂未开放', 404); return; }
    success(res, pricing);
  } catch (err: any) {
    error(res, err.message);
  }
});

// POST /api/v1/payments/create — 创建支付订单
router.post('/create', authMiddleware, (req: Request, res: Response) => {
  try {
    const { provider, region } = req.body;
    const validProviders = ['alipay', 'wechat', 'stripe', 'paypal', 'apple_iap'];
    if (!provider || !validProviders.includes(provider)) {
      error(res, '请指定有效的支付方式');
      return;
    }
    const order = paymentService.createOrder(req.user!.userId, provider, region || 'china');
    success(res, {
      orderId: order.id,
      orderNo: order.order_no,
      amount: order.amount,
      currency: order.currency,
      provider: order.provider,
      status: order.status,
    }, 201);
  } catch (err: any) {
    error(res, err.message, 400);
  }
});

// POST /api/v1/payments/notify — 支付回调（由支付平台调用）
router.post('/notify', (req: Request, res: Response) => {
  try {
    // 签名校验：防止伪造支付回调
    if (!verifyNotifySignature(req)) {
      error(res, '签名验证失败', 403);
      return;
    }

    const { orderId, providerOrderId, provider } = req.body;
    if (!orderId || !providerOrderId) {
      error(res, 'orderId 和 providerOrderId 为必填');
      return;
    }

    // 支付成功后自动开通会员
    const order = paymentService.getOrder(orderId);
    if (!order) { error(res, '订单不存在', 404); return; }

    const membership = membershipService.createMembership(order.user_id);
    paymentService.confirmOrder(orderId, providerOrderId, membership.id);

    success(res, { message: '支付成功', membershipId: membership.id });
  } catch (err: any) {
    error(res, err.message, 400);
  }
});

// GET /api/v1/payments/orders — 获取用户订单列表
router.get('/orders', authMiddleware, (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const result = paymentService.getUserOrders(req.user!.userId, page, limit);
    res.json({ success: true, data: result.orders, meta: { total: result.total, page, limit } });
  } catch (err: any) {
    error(res, err.message);
  }
});

// GET /api/v1/payments/orders/:id — 获取订单详情
router.get('/orders/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    const order = paymentService.getOrder(req.params.id);
    if (!order || order.user_id !== req.user!.userId) {
      error(res, '订单不存在', 404);
      return;
    }
    success(res, order);
  } catch (err: any) {
    error(res, err.message);
  }
});

// POST /api/v1/payments/orders/:id/cancel — 取消订单
router.post('/orders/:id/cancel', authMiddleware, (req: Request, res: Response) => {
  try {
    const cancelled = paymentService.cancelOrder(req.params.id, req.user!.userId);
    if (!cancelled) { error(res, '订单无法取消', 400); return; }
    success(res, { message: '已取消' });
  } catch (err: any) {
    error(res, err.message);
  }
});

export { router as paymentRoutes };
