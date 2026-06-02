import { getDb } from '../config/database';
import { generateId } from '../utils/uuid';

export interface CreateExerciseInput {
  exerciseName: string;
  exerciseIcon?: string;
  exerciseType?: string;
  duration: number;
  caloriesBurned: number;
  heartRate?: number;
  distance?: number;
  recordDate: string;
}

export function createExerciseLog(userId: string, input: CreateExerciseInput) {
  const db = getDb();
  const id = generateId();

  db.prepare(`
    INSERT INTO exercise_logs (id, user_id, exercise_name, exercise_icon, exercise_type, duration, calories_burned, heart_rate, distance, record_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, input.exerciseName, input.exerciseIcon || '', input.exerciseType || '', input.duration, input.caloriesBurned, input.heartRate || null, input.distance || null, input.recordDate);

  return db.prepare('SELECT * FROM exercise_logs WHERE id = ?').get(id);
}

export function getExercisesByDate(userId: string, date: string) {
  const db = getDb();
  const logs = db.prepare('SELECT * FROM exercise_logs WHERE user_id = ? AND record_date = ? ORDER BY created_at ASC')
    .all(userId, date);

  let totalDuration = 0, totalCalories = 0;
  for (const log of logs as any[]) {
    totalDuration += log.duration;
    totalCalories += log.calories_burned;
  }

  return { logs, totalDuration, totalCalories, count: (logs as any[]).length };
}

export function getExercisesByRange(userId: string, from: string, to: string) {
  const db = getDb();
  const logs = db.prepare(
    'SELECT * FROM exercise_logs WHERE user_id = ? AND record_date >= ? AND record_date <= ? ORDER BY record_date ASC'
  ).all(userId, from, to);
  return { logs };
}

export function deleteExerciseLog(logId: string, userId: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM exercise_logs WHERE id = ? AND user_id = ?').run(logId, userId);
  return result.changes > 0;
}

export function getStreak(userId: string): number {
  const db = getDb();
  const dates = db.prepare(
    'SELECT DISTINCT record_date FROM exercise_logs WHERE user_id = ? ORDER BY record_date DESC'
  ).all(userId) as { record_date: string }[];

  if (dates.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().split('T')[0];
    if (dates[i].record_date === expectedStr) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
