import { getDb } from '../config/database';
import { generateId } from '../utils/uuid';
import { getProfile, upsertProfile } from './user.service';
import { createMealRecord, getMealsByDate } from './meals.service';
import { createExerciseLog, getExercisesByDate } from './exercise.service';

export function uploadData(userId: string, data: { meals?: any[]; exercises?: any[]; profile?: any }) {
  const db = getDb();
  let mealsCount = 0, exercisesCount = 0, profileUpdated = false;

  if (data.profile) {
    upsertProfile(userId, data.profile);
    profileUpdated = true;
  }

  if (data.meals && Array.isArray(data.meals)) {
    for (const meal of data.meals) {
      try {
        createMealRecord(userId, {
          recordDate: meal.recordDate,
          mealType: meal.mealType,
          foods: meal.foods || [],
        });
        mealsCount++;
      } catch (e) {
        // skip duplicates
      }
    }
  }

  if (data.exercises && Array.isArray(data.exercises)) {
    for (const ex of data.exercises) {
      try {
        createExerciseLog(userId, {
          exerciseName: ex.exerciseName,
          exerciseIcon: ex.exerciseIcon,
          exerciseType: ex.exerciseType,
          duration: ex.duration,
          caloriesBurned: ex.caloriesBurned || ex.calories,
          heartRate: ex.heartRate,
          distance: ex.distance,
          recordDate: ex.recordDate,
        });
        exercisesCount++;
      } catch (e) {
        // skip duplicates
      }
    }
  }

  db.prepare('INSERT INTO sync_log (id, user_id, entity, direction, count) VALUES (?, ?, ?, ?, ?)')
    .run(generateId(), userId, 'all', 'upload', mealsCount + exercisesCount);

  return { mealsCount, exercisesCount, profileUpdated };
}

export function downloadData(userId: string) {
  const profile = getProfile(userId);
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const meals = getMealsByRangeForSync(userId, thirtyDaysAgo, today);
  const exercises = getExercisesByRangeForSync(userId, thirtyDaysAgo, today);

  return {
    profile: profile || null,
    meals: meals.records,
    exercises: exercises.logs,
    serverTime: new Date().toISOString(),
  };
}

function getMealsByRangeForSync(userId: string, from: string, to: string) {
  const db = getDb();
  const records = db.prepare(
    'SELECT * FROM meal_records WHERE user_id = ? AND record_date >= ? AND record_date <= ? ORDER BY record_date ASC'
  ).all(userId, from, to) as any[];

  const getFoods = db.prepare('SELECT * FROM food_logs WHERE meal_record_id = ?');
  for (const record of records) {
    record.foods = getFoods.all(record.id);
  }

  return { records };
}

function getExercisesByRangeForSync(userId: string, from: string, to: string) {
  const db = getDb();
  const logs = db.prepare(
    'SELECT * FROM exercise_logs WHERE user_id = ? AND record_date >= ? AND record_date <= ? ORDER BY record_date ASC'
  ).all(userId, from, to);
  return { logs };
}
