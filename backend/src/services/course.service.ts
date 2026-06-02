import { getDb } from '../config/database';
import { generateId } from '../utils/uuid';

export interface Course {
  id: string;
  creator_id: string;
  title: string;
  cover_emoji: string;
  cover_image: string;
  video_url: string | null;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  calories: number;
  is_free: number;
  is_member_only: number;
  rating: number;
  tags: string;
  stats: string;
  created_at: string;
}

export interface CourseContent {
  id: string;
  course_id: string;
  title: string;
  content: string;
  video_url: string | null;
  duration: number;
  sort_order: number;
  is_preview: number;
}

function generateStats() {
  return JSON.stringify({ likes: 0, collections: 0, views: 0 });
}

export function createCourse(creatorId: string, data: {
  title: string; description?: string; category?: string;
  difficulty?: string; duration?: number; calories?: number;
  is_free?: number; is_member_only?: number;
  cover_emoji?: string; cover_image?: string; video_url?: string;
  tags?: string[];
}): Course {
  const db = getDb();
  const id = generateId();

  db.prepare(`
    INSERT INTO courses (id, creator_id, title, description, category, difficulty,
      duration, calories, is_free, is_member_only, cover_emoji, cover_image, video_url, tags, stats)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, creatorId, data.title, data.description || '', data.category || '减脂',
    data.difficulty || 'beginner', data.duration || 0, data.calories || 0,
    data.is_free ?? 1, data.is_member_only ?? 0,
    data.cover_emoji || '💪', data.cover_image || '', data.video_url || null,
    JSON.stringify(data.tags || []), generateStats(),
  );

  return db.prepare('SELECT * FROM courses WHERE id = ?').get(id) as Course;
}

export function updateCourse(courseId: string, creatorId: string, data: Partial<Course>): Course {
  const db = getDb();
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as Course | undefined;
  if (!course) throw new Error('课程不存在');
  if (course.creator_id !== creatorId) throw new Error('无权修改此课程');

  const fields: string[] = [];
  const values: any[] = [];

  const allowed = ['title', 'description', 'category', 'difficulty', 'duration', 'calories',
    'is_free', 'is_member_only', 'cover_emoji', 'cover_image', 'video_url'];
  for (const key of allowed) {
    if (data[key as keyof typeof data] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key as keyof typeof data]);
    }
  }

  if (fields.length === 0) throw new Error('没有需要更新的字段');

  fields.push("updated_at = datetime('now')");
  values.push(courseId);

  db.prepare(`UPDATE courses SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  return db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as Course;
}

export function getCourse(courseId: string): Course | null {
  const db = getDb();
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as Course | undefined;
  return course || null;
}

export function listCourses(filters: {
  category?: string; difficulty?: string; is_free?: number; creator_id?: string;
  page?: number; limit?: number;
}): { courses: Course[]; total: number; page: number; limit: number } {
  const db = getDb();
  const conditions: string[] = [];
  const params: any[] = [];
  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 20, 50);

  if (filters.category && filters.category !== 'all') {
    conditions.push('category = ?');
    params.push(filters.category);
  }
  if (filters.difficulty) {
    conditions.push('difficulty = ?');
    params.push(filters.difficulty);
  }
  if (filters.is_free !== undefined) {
    conditions.push('is_free = ?');
    params.push(filters.is_free);
  }
  if (filters.creator_id) {
    conditions.push('creator_id = ?');
    params.push(filters.creator_id);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const total = (db.prepare(`SELECT COUNT(*) as count FROM courses ${where}`).get(...params) as any).count;

  const offset = (page - 1) * limit;
  const courses = db.prepare(
    `SELECT * FROM courses ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
  ).all(...params, limit, offset) as Course[];

  return { courses, total, page, limit };
}

export function listCoursesByCreator(creatorId: string): Course[] {
  const db = getDb();
  return db.prepare('SELECT * FROM courses WHERE creator_id = ? ORDER BY created_at DESC').all(creatorId) as Course[];
}

export function deleteCourse(courseId: string, creatorId: string): void {
  const db = getDb();
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as Course | undefined;
  if (!course) throw new Error('课程不存在');
  if (course.creator_id !== creatorId) throw new Error('无权删除此课程');

  db.transaction(() => {
    db.prepare('DELETE FROM course_contents WHERE course_id = ?').run(courseId);
    db.prepare('DELETE FROM subscriptions WHERE course_id = ?').run(courseId);
    db.prepare('DELETE FROM courses WHERE id = ?').run(courseId);
  })();
}

// Course Contents
export function createCourseContent(courseId: string, data: {
  title: string; content?: string; video_url?: string; duration?: number; sort_order?: number; is_preview?: number;
}): CourseContent {
  const db = getDb();
  const id = generateId();

  db.prepare(`
    INSERT INTO course_contents (id, course_id, title, content, video_url, duration, sort_order, is_preview)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, courseId, data.title, data.content || '', data.video_url || null,
    data.duration || 0, data.sort_order || 0, data.is_preview || 0);

  return db.prepare('SELECT * FROM course_contents WHERE id = ?').get(id) as CourseContent;
}

export function getCourseContents(courseId: string): CourseContent[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM course_contents WHERE course_id = ? ORDER BY sort_order ASC',
  ).all(courseId) as CourseContent[];
}

export function updateCourseContent(contentId: string, data: Partial<CourseContent>): CourseContent {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  const allowed = ['title', 'content', 'video_url', 'duration', 'sort_order', 'is_preview'];
  for (const key of allowed) {
    if (data[key as keyof typeof data] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key as keyof typeof data]);
    }
  }

  if (fields.length === 0) throw new Error('没有需要更新的字段');

  fields.push("updated_at = datetime('now')");
  values.push(contentId);

  db.prepare(`UPDATE course_contents SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return db.prepare('SELECT * FROM course_contents WHERE id = ?').get(contentId) as CourseContent;
}

export function deleteCourseContent(contentId: string): void {
  const db = getDb();
  db.prepare('DELETE FROM course_contents WHERE id = ?').run(contentId);
}

// Subscriptions (paid courses / creator subscriptions)
export function subscribeToCourse(userId: string, courseId: string, amount: number): void {
  const db = getDb();
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as Course | undefined;
  if (!course) throw new Error('课程不存在');
  if (course.is_free) throw new Error('免费课程无需购买');

  const existing = db.prepare(
    'SELECT id FROM subscriptions WHERE user_id = ? AND course_id = ? AND status = ?',
  ).get(userId, courseId, 'active');
  if (existing) throw new Error('已购买该课程');

  db.prepare(`
    INSERT INTO subscriptions (id, user_id, course_id, creator_id, type, amount, status)
    VALUES (?, ?, ?, ?, 'course', ?, 'active')
  `).run(generateId(), userId, courseId, course.creator_id, amount);
}

export function checkCourseSubscription(userId: string, courseId: string): boolean {
  const db = getDb();
  const sub = db.prepare(
    'SELECT id FROM subscriptions WHERE user_id = ? AND course_id = ? AND status = ?',
  ).get(userId, courseId, 'active');
  return !!sub;
}

export function getSubscriptionCourses(userId: string): Subscription[] {
  const db = getDb();
  return db.prepare(`
    SELECT s.*, c.title as course_title, c.cover_emoji, c.cover_image
    FROM subscriptions s
    JOIN courses c ON c.id = s.course_id
    WHERE s.user_id = ? AND s.type = 'course' AND s.status = 'active'
    ORDER BY s.created_at DESC
  `).all(userId) as any[];
}

export function incrementCourseViews(courseId: string): void {
  const db = getDb();
  const course = db.prepare('SELECT stats FROM courses WHERE id = ?').get(courseId) as any;
  if (!course) return;
  const stats = JSON.parse(course.stats);
  stats.views = (stats.views || 0) + 1;
  db.prepare('UPDATE courses SET stats = ? WHERE id = ?').run(JSON.stringify(stats), courseId);
}

export function incrementCourseLikes(courseId: string): void {
  const db = getDb();
  const course = db.prepare('SELECT stats FROM courses WHERE id = ?').get(courseId) as any;
  if (!course) return;
  const stats = JSON.parse(course.stats);
  stats.likes = (stats.likes || 0) + 1;
  db.prepare('UPDATE courses SET stats = ? WHERE id = ?').run(JSON.stringify(stats), courseId);
}
