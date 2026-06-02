import { getDb } from '../config/database';
import { generateId } from '../utils/uuid';

export interface FeatureLimit {
  id: string;
  tier: 'free' | 'premium';
  feature_key: string;
  hard_limit: number;
  region: string | null;
}

export interface UsageCount {
  id: string;
  user_id: string;
  feature_key: string;
  count: number;
  record_date: string;
}

/** 获取某用户在某功能上的今日已用次数 */
export function getTodayUsage(userId: string, featureKey: string): number {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const record = db.prepare(
    'SELECT count FROM usage_counts WHERE user_id = ? AND feature_key = ? AND record_date = ?',
  ).get(userId, featureKey, today) as { count: number } | undefined;

  return record?.count || 0;
}

/** 增加功能使用计数 */
export function incrementUsage(userId: string, featureKey: string): number {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  const existing = db.prepare(
    'SELECT id, count FROM usage_counts WHERE user_id = ? AND feature_key = ? AND record_date = ?',
  ).get(userId, featureKey, today) as { id: string; count: number } | undefined;

  if (existing) {
    db.prepare('UPDATE usage_counts SET count = count + 1 WHERE id = ?').run(existing.id);
    return existing.count + 1;
  }

  const id = generateId();
  db.prepare(`
    INSERT INTO usage_counts (id, user_id, feature_key, count, record_date)
    VALUES (?, ?, ?, 1, ?)
  `).run(id, userId, featureKey, today);

  return 1;
}

/** 检查用户是否超出功能限制。超出返回 true */
export function isLimitExceeded(
  userId: string,
  featureKey: string,
  userTier: 'free' | 'premium',
  region: 'china' | 'global',
): boolean {
  if (userTier === 'premium') return false;

  const db = getDb();
  const todayUsage = getTodayUsage(userId, featureKey);

  // 查找对应 tier + region 的限制
  const limit = db.prepare(`
    SELECT hard_limit FROM feature_limits
    WHERE tier = ? AND feature_key = ? AND (region = ? OR region IS NULL)
    ORDER BY region NULLS LAST LIMIT 1
  `).get(userTier, featureKey, region) as { hard_limit: number } | undefined;

  if (!limit || limit.hard_limit === 0) return false;
  return todayUsage >= limit.hard_limit;
}

/** 获取用户的今日用量详情 */
export function getTodayUsageDetail(userId: string): Record<string, number> {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const records = db.prepare(
    'SELECT feature_key, count FROM usage_counts WHERE user_id = ? AND record_date = ?',
  ).all(userId, today) as { feature_key: string; count: number }[];

  const result: Record<string, number> = {};
  for (const r of records) {
    result[r.feature_key] = r.count;
  }
  return result;
}

/** 获取用户的功能限制信息 */
export function getUserLimits(
  userTier: 'free' | 'premium',
  region: 'china' | 'global',
): FeatureLimit[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM feature_limits
    WHERE tier = ? AND (region = ? OR region IS NULL)
    ORDER BY feature_key
  `).all(userTier, region) as FeatureLimit[];
}

/** 管理：设置功能限制 */
export function setFeatureLimit(data: {
  tier: 'free' | 'premium';
  featureKey: string;
  hardLimit: number;
  region?: 'china' | 'global';
}): FeatureLimit {
  const db = getDb();
  const id = generateId();

  db.prepare(`
    INSERT INTO feature_limits (id, tier, feature_key, hard_limit, region)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, data.tier, data.featureKey, data.hardLimit, data.region || null);

  return db.prepare('SELECT * FROM feature_limits WHERE id = ?').get(id) as FeatureLimit;
}

/** 管理：更新功能限制 */
export function updateFeatureLimit(id: string, hardLimit: number): FeatureLimit | null {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM feature_limits WHERE id = ?').get(id) as FeatureLimit | undefined;
  if (!existing) return null;

  db.prepare('UPDATE feature_limits SET hard_limit = ? WHERE id = ?').run(hardLimit, id);
  return db.prepare('SELECT * FROM feature_limits WHERE id = ?').get(id) as FeatureLimit;
}
