import { getDb } from '../config/database';
import { generateId } from '../utils/uuid';

export interface BloggerApplication {
  id: string;
  user_id: string;
  blogger_type: 'fitness' | 'food';
  display_name: string;
  bio: string;
  avatar_url: string;
  cover_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface BloggerProfile {
  user_id: string;
  nickname: string;
  avatar_url: string;
  display_name: string;
  bio: string;
  cover_url: string;
  blogger_type: 'fitness' | 'food';
  recipes_count: number;
  courses_count: number;
  followers_count: number;
  total_views: number;
  total_likes: number;
}

export function applyToBeBlogger(
  userId: string, bloggerType: 'fitness' | 'food', displayName: string,
  bio: string, avatarUrl: string, coverUrl: string,
): BloggerApplication {
  const db = getDb();

  const existing = db.prepare(
    'SELECT id, status FROM blogger_applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
  ).get(userId) as { id: string; status: string } | undefined;

  if (existing && existing.status === 'pending') {
    throw new Error('已有审核中的申请，请耐心等待');
  }

  if (existing && existing.status === 'approved') {
    throw new Error('您已经是博主了');
  }

  const id = generateId();
  db.prepare(`
    INSERT INTO blogger_applications (id, user_id, blogger_type, display_name, bio, avatar_url, cover_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, bloggerType, displayName, bio, avatarUrl, coverUrl);

  return db.prepare('SELECT * FROM blogger_applications WHERE id = ?').get(id) as BloggerApplication;
}

export function approveBlogger(applicationId: string): BloggerApplication {
  const db = getDb();
  const app = db.prepare('SELECT * FROM blogger_applications WHERE id = ?').get(applicationId) as BloggerApplication | undefined;
  if (!app) throw new Error('申请不存在');
  if (app.status !== 'pending') throw new Error('申请已处理');

  const role = app.blogger_type === 'fitness' ? 'fitness_blogger' : 'food_blogger';

  db.transaction(() => {
    db.prepare('UPDATE blogger_applications SET status = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run('approved', applicationId);
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, app.user_id);
    db.prepare(`
      INSERT INTO blogger_stats (user_id, recipes_count, courses_count, followers_count, total_views, total_likes, updated_at)
      VALUES (?, 0, 0, 0, 0, 0, datetime('now'))
    `).run(app.user_id);
  })();

  return db.prepare('SELECT * FROM blogger_applications WHERE id = ?').get(applicationId) as BloggerApplication;
}

export function rejectBlogger(applicationId: string): BloggerApplication {
  const db = getDb();
  const app = db.prepare('SELECT * FROM blogger_applications WHERE id = ?').get(applicationId) as BloggerApplication | undefined;
  if (!app) throw new Error('申请不存在');
  if (app.status !== 'pending') throw new Error('申请已处理');

  db.prepare('UPDATE blogger_applications SET status = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run('rejected', applicationId);

  return db.prepare('SELECT * FROM blogger_applications WHERE id = ?').get(applicationId) as BloggerApplication;
}

export function getPendingApplications(): BloggerApplication[] {
  const db = getDb();
  return db.prepare(`
    SELECT ba.*, u.nickname, u.email
    FROM blogger_applications ba
    JOIN users u ON u.id = ba.user_id
    WHERE ba.status = 'pending'
    ORDER BY ba.created_at DESC
  `).all() as BloggerApplication[];
}

export function getBloggerProfile(userId: string): BloggerProfile | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT u.id as user_id, u.nickname, u.avatar_url, u.role,
           bs.recipes_count, bs.courses_count, bs.followers_count,
           bs.total_views, bs.total_likes
    FROM users u
    LEFT JOIN blogger_stats bs ON bs.user_id = u.id
    WHERE u.id = ? AND (u.role IN ('fitness_blogger', 'food_blogger'))
  `).get(userId) as any;
  if (!row) return null;

  return {
    user_id: row.user_id,
    nickname: row.nickname,
    avatar_url: row.avatar_url,
    display_name: row.nickname,
    bio: '',
    cover_url: '',
    blogger_type: row.role === 'fitness_blogger' ? 'fitness' : 'food',
    recipes_count: row.recipes_count || 0,
    courses_count: row.courses_count || 0,
    followers_count: row.followers_count || 0,
    total_views: row.total_views || 0,
    total_likes: row.total_likes || 0,
  };
}

export function listBloggers(bloggerType?: 'fitness' | 'food'): BloggerProfile[] {
  const db = getDb();
  let query = `
    SELECT u.id as user_id, u.nickname, u.avatar_url, u.role,
           COALESCE(ba.display_name, u.nickname) as display_name,
           COALESCE(ba.bio, '') as bio,
           COALESCE(ba.cover_url, '') as cover_url,
           bs.recipes_count, bs.courses_count, bs.followers_count,
           bs.total_views, bs.total_likes
    FROM users u
    LEFT JOIN blogger_stats bs ON bs.user_id = u.id
    LEFT JOIN blogger_applications ba ON ba.user_id = u.id AND ba.status = 'approved'
    WHERE u.role IN ('fitness_blogger', 'food_blogger')
  `;
  const params: any[] = [];

  if (bloggerType) {
    const role = bloggerType === 'fitness' ? 'fitness_blogger' : 'food_blogger';
    query += ' AND u.role = ?';
    params.push(role);
  }

  query += ' ORDER BY bs.followers_count DESC';

  return db.prepare(query).all(...params) as BloggerProfile[];
}

export function updateBloggerStats(userId: string): void {
  const db = getDb();
  const stats = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM recipes WHERE 1=1) as recipes_count,
      (SELECT COUNT(*) FROM courses WHERE creator_id = ?) as courses_count
  `).get(userId) as any;

  db.prepare(`
    INSERT INTO blogger_stats (user_id, recipes_count, courses_count, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      recipes_count = excluded.recipes_count,
      courses_count = excluded.courses_count,
      updated_at = datetime('now')
  `).run(userId, stats.recipes_count, stats.courses_count);
}
