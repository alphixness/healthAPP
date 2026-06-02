import { getDb } from '../config/database';
import { UserRow } from './auth.service';

export interface UserProfile {
  user_id: string;
  height: number;
  weight: number;
  age: number;
  gender: 'male' | 'female';
  goal: 'lose' | 'maintain' | 'gain';
  activity_level: string;
  daily_calorie_target: number;
}

export function getProfile(userId: string): UserProfile | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(userId) as UserProfile | undefined;
}

export function upsertProfile(userId: string, data: {
  height: number;
  weight: number;
  age: number;
  gender: 'male' | 'female';
  goal: 'lose' | 'maintain' | 'gain';
  activity_level: string;
}): UserProfile {
  const db = getDb();
  const dailyCalorieTarget = calculateDailyTarget(data);

  db.prepare(`
    INSERT INTO user_profiles (user_id, height, weight, age, gender, goal, activity_level, daily_calorie_target, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      height = excluded.height,
      weight = excluded.weight,
      age = excluded.age,
      gender = excluded.gender,
      goal = excluded.goal,
      activity_level = excluded.activity_level,
      daily_calorie_target = excluded.daily_calorie_target,
      updated_at = datetime('now')
  `).run(userId, data.height, data.weight, data.age, data.gender, data.goal, data.activity_level, dailyCalorieTarget);

  return getProfile(userId)!;
}

function calculateDailyTarget(data: { height: number; weight: number; age: number; gender: string; goal: string; activity_level: string }): number {
  let bmr: number;
  if (data.gender === 'male') {
    bmr = 88.362 + 13.397 * data.weight + 4.799 * data.height - 5.677 * data.age;
  } else {
    bmr = 447.593 + 9.247 * data.weight + 3.098 * data.height - 4.33 * data.age;
  }

  const multipliers: Record<string, number> = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
  };

  const tdee = bmr * (multipliers[data.activity_level] || 1.2);

  switch (data.goal) {
    case 'lose': return Math.round(tdee - 500);
    case 'gain': return Math.round(tdee + 300);
    default: return Math.round(tdee);
  }
}

export function calculateDailyGoals(profile: UserProfile): { calories: number; protein: number; carbs: number; fat: number } {
  const { weight, height, age, gender, goal, activity_level } = profile;

  let bmr: number;
  if (gender === 'male') {
    bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  }

  const multipliers: Record<string, number> = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
  };

  const tdee = bmr * (multipliers[activity_level] || 1.2);

  let calories: number;
  switch (goal) {
    case 'lose': calories = tdee - 500; break;
    case 'gain': calories = tdee + 300; break;
    default: calories = tdee;
  }

  return {
    calories: Math.round(calories),
    protein: Math.round(weight * 1.6),
    carbs: Math.round((calories * 0.5) / 4),
    fat: Math.round((calories * 0.25) / 9),
  };
}
