import { getDb } from '../config/database';
import { generateId } from '../utils/uuid';
import { logger } from '../utils/logger';

export interface Order {
  id: string;
  user_id: string;
  order_no: string;
  amount: number;
  currency: string;
  provider: string;
  provider_order_id: string;
  status: 'pending' | 'paid' | 'failed' | 'expired';
  membership_id: string | null;
  created_at: string;
  paid_at: string | null;
}

/** 生成唯一订单号 */
function generateOrderNo(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD${ts}${rand}`;
}

/** 获取区域定价 */
export function getPricingByRegion(region: 'china' | 'global'): {
  amount: number;
  currency: string;
  durationDays: number;
} | null {
  const db = getDb();
  const pricing = db.prepare(`
    SELECT amount, currency, duration_days
    FROM pricing_tiers WHERE region = ? AND tier = 'premium' AND is_active = 1
    LIMIT 1
  `).get(region) as { amount: number; currency: string; duration_days: number } | undefined;

  if (!pricing) return null;
  return { amount: pricing.amount, currency: pricing.currency, durationDays: pricing.duration_days };
}

/** 创建支付订单 */
export function createOrder(userId: string, provider: string, region: 'china' | 'global'): Order {
  const pricing = getPricingByRegion(region);
  if (!pricing) throw new Error('该区域暂未开放会员购买');

  const db = getDb();
  const id = generateId();
  const orderNo = generateOrderNo();

  db.prepare(`
    INSERT INTO orders (id, user_id, order_no, amount, currency, provider, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `).run(id, userId, orderNo, pricing.amount, pricing.currency, provider);

  return db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as Order;
}

/** 获取订单详情 */
export function getOrder(orderId: string): Order | null {
  const db = getDb();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as Order | undefined;
  return order || null;
}

/** 获取用户的订单列表 */
export function getUserOrders(userId: string, page = 1, limit = 20): { orders: Order[]; total: number } {
  const db = getDb();
  const total = (db.prepare('SELECT COUNT(*) as count FROM orders WHERE user_id = ?').get(userId) as any).count;
  const offset = (page - 1) * limit;
  const orders = db.prepare(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
  ).all(userId, limit, offset) as Order[];
  return { orders, total };
}

/** 标记订单为已支付（支付回调） */
export function confirmOrder(
  orderId: string,
  providerOrderId: string,
  membershipId?: string,
): Order | null {
  const db = getDb();
  const order = getOrder(orderId);
  if (!order) return null;
  if (order.status !== 'pending') throw new Error('订单状态异常');

  db.prepare(`
    UPDATE orders SET status = 'paid', provider_order_id = ?,
      membership_id = ?, paid_at = datetime('now')
    WHERE id = ?
  `).run(providerOrderId, membershipId || null, orderId);

  return db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as Order;
}

/** 取消订单 */
export function cancelOrder(orderId: string, userId: string): boolean {
  const db = getDb();
  const result = db.prepare(
    'UPDATE orders SET status = ? WHERE id = ? AND user_id = ? AND status = ?',
  ).run('expired', orderId, userId, 'pending');
  return result.changes > 0;
}

/** 过期未支付订单（定时任务用） */
export function expirePendingOrders(): number {
  const db = getDb();
  // 过期超过 30 分钟的未支付订单
  const result = db.prepare(`
    UPDATE orders SET status = 'expired'
    WHERE status = 'pending' AND created_at < datetime('now', '-30 minutes')
  `).run();
  return result.changes;
}
