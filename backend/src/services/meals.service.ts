import { getDb } from '../config/database';
import { generateId } from '../utils/uuid';

export interface CreateMealInput {
  recordDate: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: Array<{
    foodName: string;
    quantity: number;
    unit?: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  }>;
}

export function createMealRecord(userId: string, input: CreateMealInput) {
  const db = getDb();
  const mealId = generateId();

  db.prepare(`
    INSERT INTO meal_records (id, user_id, record_date, meal_type)
    VALUES (?, ?, ?, ?)
  `).run(mealId, userId, input.recordDate, input.mealType);

  const insertFood = db.prepare(`
    INSERT INTO food_logs (id, meal_record_id, food_name, quantity, unit, calories, protein, carbs, fat)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const food of input.foods) {
    insertFood.run(
      generateId(), mealId,
      food.foodName, food.quantity, food.unit || 'g',
      food.calories, food.protein || 0, food.carbs || 0, food.fat || 0,
    );
  }

  return getMealById(mealId);
}

function getMealById(mealId: string) {
  const db = getDb();
  const record = db.prepare('SELECT * FROM meal_records WHERE id = ?').get(mealId) as any;
  if (!record) return null;
  record.foods = db.prepare('SELECT * FROM food_logs WHERE meal_record_id = ?').all(mealId);
  return record;
}

export function getMealsByDate(userId: string, date: string) {
  const db = getDb();
  const records = db.prepare('SELECT * FROM meal_records WHERE user_id = ? AND record_date = ? ORDER BY created_at ASC')
    .all(userId, date) as any[];

  const getFoods = db.prepare('SELECT * FROM food_logs WHERE meal_record_id = ?');
  let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;

  for (const record of records) {
    record.foods = getFoods.all(record.id);
    for (const food of record.foods) {
      totalCalories += food.calories;
      totalProtein += food.protein;
      totalCarbs += food.carbs;
      totalFat += food.fat;
    }
  }

  return {
    records,
    summary: { calories: totalCalories, protein: totalProtein, carbs: totalCarbs, fat: totalFat },
  };
}

export function getMealsByRange(userId: string, from: string, to: string) {
  const db = getDb();
  const records = db.prepare(
    'SELECT * FROM meal_records WHERE user_id = ? AND record_date >= ? AND record_date <= ? ORDER BY record_date ASC, created_at ASC'
  ).all(userId, from, to) as any[];

  const getFoods = db.prepare('SELECT * FROM food_logs WHERE meal_record_id = ?');
  for (const record of records) {
    record.foods = getFoods.all(record.id);
  }

  return { records };
}

export function deleteMealRecord(recordId: string, userId: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM meal_records WHERE id = ? AND user_id = ?').run(recordId, userId);
  return result.changes > 0;
}
