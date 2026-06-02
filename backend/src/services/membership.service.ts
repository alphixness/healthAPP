import { getDb } from '../config/database';
import { generateId } from '../utils/uuid';
import { getPricingByRegion } from './payment.service';

export interface Membership {
  id: string;
  user_id: string;
  tier: 'premium';
  status: 'active' | 'cancelled' | 'expired';
  start_date: string;
  end_date: string;
  auto_renew: number;
}

export function createMembership(userId: string): Membership {
  const db = getDb();

  const existing = db.prepare(
    'SELECT * FROM memberships WHERE user_id = ? AND status = ?',
  ).get(userId, 'active') as Membership | undefined;

  if (existing) {
    throw new Error('您已经是会员了');
  }

  const id = generateId();
  const startDate = new Date().toISOString();
  const endDate = new Date(Date.now() + PREMIUM_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO memberships (id, user_id, tier, status, start_date, end_date, auto_renew)
    VALUES (?, ?, 'premium', 'active', ?, ?, 1)
  `).run(id, userId, startDate, endDate);

  return db.prepare('SELECT * FROM memberships WHERE id = ?').get(id) as Membership;
}

export function getMembership(userId: string): Membership | null {
  const db = getDb();
  const membership = db.prepare(`
    SELECT * FROM memberships
    WHERE user_id = ? AND status = 'active' AND end_date > datetime('now')
    ORDER BY created_at DESC LIMIT 1
  `).get(userId) as Membership | undefined;

  if (!membership) return null;
  return membership;
}

export function checkMembership(userId: string): boolean {
  return getMembership(userId) !== null;
}

export function cancelMembership(userId: string): Membership | null {
  const db = getDb();
  const membership = getMembership(userId);
  if (!membership) throw new Error('没有有效的会员');

  db.prepare('UPDATE memberships SET auto_renew = 0, updated_at = datetime(\'now\') WHERE id = ?')
    .run(membership.id);

  return db.prepare('SELECT * FROM memberships WHERE id = ?').get(membership.id) as Membership;
}

/** Called by a scheduled job or on-check to expire overdue memberships */
export function expireOverdueMemberships(): number {
  const db = getDb();
  const result = db.prepare(`
    UPDATE memberships SET status = 'expired', updated_at = datetime('now')
    WHERE status = 'active' AND end_date < datetime('now') AND auto_renew = 0
  `).run();
  return result.changes;
}

export function getMembershipPrice(region?: 'china' | 'global'): { amount: number; currency: string; durationDays: number } {
  if (region) {
    const pricing = getPricingByRegion(region);
    if (pricing) return pricing;
  }
  // 默认返回中国区价格
  return { amount: 19, currency: 'CNY', durationDays: 30 };
}
