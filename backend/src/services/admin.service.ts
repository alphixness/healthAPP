import { getDb } from '../config/database';

export function getDashboardStats() {
  const db = getDb();

  const totalUsers = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
  const totalMeals = (db.prepare('SELECT COUNT(*) as c FROM meal_records').get() as any).c;
  const totalExercises = (db.prepare('SELECT COUNT(*) as c FROM exercise_logs').get() as any).c;
  const totalRecipes = (db.prepare('SELECT COUNT(*) as c FROM recipes').get() as any).c;

  const today = new Date().toISOString().split('T')[0];
  const newUsersToday = (db.prepare("SELECT COUNT(*) as c FROM users WHERE date(created_at) = ?").get(today) as any).c;
  const activeUsersToday = (db.prepare("SELECT COUNT(DISTINCT user_id) as c FROM meal_records WHERE record_date = ?").get(today) as any).c;

  const mealsByType = db.prepare(
    'SELECT meal_type, COUNT(*) as count FROM meal_records GROUP BY meal_type'
  ).all();

  const usersByGoal = db.prepare(
    'SELECT goal, COUNT(*) as count FROM user_profiles GROUP BY goal'
  ).all();

  const usersByActivity = db.prepare(
    'SELECT activity_level, COUNT(*) as count FROM user_profiles GROUP BY activity_level'
  ).all();

  return {
    totalUsers,
    totalMeals,
    totalExercises,
    totalRecipes,
    newUsersToday,
    activeUsersToday,
    mealsByType,
    usersByGoal,
    usersByActivity,
  };
}

export function getUsersList(page = 1, limit = 20, search?: string) {
  const db = getDb();
  let whereClause = '';
  const params: any[] = [];

  if (search) {
    whereClause = 'WHERE email LIKE ? OR phone LIKE ? OR nickname LIKE ?';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  const countResult = db.prepare(`SELECT COUNT(*) as total FROM users ${whereClause}`).get(...params) as { total: number };
  const offset = (page - 1) * limit;

  const users = db.prepare(
    `SELECT id, email, phone, nickname, role, created_at FROM users ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).all(...params, limit, offset);

  return { users, total: countResult.total, page, limit };
}

export function updateUserRole(userId: string, role: 'user' | 'admin'): boolean {
  const db = getDb();
  const result = db.prepare('UPDATE users SET role = ?, updated_at = datetime(\'now\') WHERE id = ?').run(role, userId);
  return result.changes > 0;
}

export function deleteUser(userId: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  return result.changes > 0;
}

export function getAllRecipes(page = 1, limit = 50) {
  const db = getDb();
  const offset = (page - 1) * limit;
  const total = (db.prepare('SELECT COUNT(*) as total FROM recipes').get() as any).total;
  const recipes = db.prepare('SELECT * FROM recipes ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);
  return { recipes, total, page, limit };
}
