import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { success, error } from '../utils/response';
import * as membershipService from '../services/membership.service';

const router = Router();

// GET /api/v1/membership/price — 获取会员价格（支持 region 参数）
router.get('/price', (req: Request, res: Response) => {
  try {
    const region = (req.query.region as 'china' | 'global') || 'china';
    const price = membershipService.getMembershipPrice(region);
    success(res, price);
  } catch (err: any) {
    error(res, err.message);
  }
});

// POST /api/v1/membership/purchase — 开通会员
router.post('/purchase', authMiddleware, (req: Request, res: Response) => {
  try {
    const membership = membershipService.createMembership(req.user!.userId);
    success(res, { membership }, 201);
  } catch (err: any) {
    error(res, err.message, 400);
  }
});

// GET /api/v1/membership/status — 查看会员状态
router.get('/status', authMiddleware, (req: Request, res: Response) => {
  try {
    const membership = membershipService.getMembership(req.user!.userId);
    success(res, {
      isMember: !!membership,
      membership,
    });
  } catch (err: any) {
    error(res, err.message);
  }
});

// POST /api/v1/membership/cancel — 取消自动续费
router.post('/cancel', authMiddleware, (req: Request, res: Response) => {
  try {
    const membership = membershipService.cancelMembership(req.user!.userId);
    success(res, { membership });
  } catch (err: any) {
    error(res, err.message, 400);
  }
});

export { router as membershipRoutes };
