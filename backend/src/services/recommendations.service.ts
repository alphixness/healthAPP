import { getDb } from '../config/database';
import { generateId } from '../utils/uuid';
import { getProfile } from './user.service';

interface DailyGoal {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealRecommendation {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  reason: string;
}

export interface ExerciseRecommendation {
  id: string;
  name: string;
  type: string;
  duration: number;
  caloriesBurned: number;
  difficulty: string;
  reason: string;
}

function calculateTdee(profile: { height: number; weight: number; age: number; gender: string; activity_level: string; goal: string }): DailyGoal {
  let bmr: number;
  if (profile.gender === 'male') {
    bmr = 88.362 + 13.397 * profile.weight + 4.799 * profile.height - 5.677 * profile.age;
  } else {
    bmr = 447.593 + 9.247 * profile.weight + 3.098 * profile.height - 4.33 * profile.age;
  }

  const multipliers: Record<string, number> = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
  };
  const tdee = bmr * (multipliers[profile.activity_level] || 1.2);

  let calories: number;
  switch (profile.goal) {
    case 'lose': calories = tdee - 500; break;
    case 'gain': calories = tdee + 300; break;
    default: calories = tdee;
  }

  return {
    calories: Math.round(calories),
    protein: Math.round(profile.weight * 1.6),
    carbs: Math.round((calories * 0.5) / 4),
    fat: Math.round((calories * 0.25) / 9),
  };
}

function generateMealRecommendations(goal: DailyGoal, profileGoal: string): MealRecommendation[] {
  const isLose = profileGoal === 'lose';
  const isGain = profileGoal === 'gain';

  return [
    {
      id: generateId(),
      name: '蛋白质燕麦碗',
      calories: Math.round(goal.calories * 0.3),
      protein: Math.round(goal.protein * 0.3),
      carbs: Math.round(goal.carbs * 0.3),
      fat: Math.round(goal.fat * 0.2),
      ingredients: ['燕麦50g', '鸡蛋2个', '牛奶200ml', '蓝莓30g'],
      reason: '高蛋白早餐，提供持久饱腹感，适合开启一天的代谢',
    },
    {
      id: generateId(),
      name: '鸡胸肉藜麦沙拉',
      calories: Math.round(goal.calories * 0.35),
      protein: Math.round(goal.protein * 0.4),
      carbs: Math.round(goal.carbs * 0.25),
      fat: Math.round(goal.fat * 0.35),
      ingredients: ['鸡胸肉150g', '藜麦80g', '混合蔬菜200g', '橄榄油10ml'],
      reason: isLose ? '低卡高蛋白，减脂期理想午餐' : '均衡营养，支持肌肉恢复',
    },
    {
      id: generateId(),
      name: '三文鱼糙米饭',
      calories: Math.round(goal.calories * 0.35),
      protein: Math.round(goal.protein * 0.3),
      carbs: Math.round(goal.carbs * 0.35),
      fat: Math.round(goal.fat * 0.35),
      ingredients: ['三文鱼150g', '糙米100g', '西兰花100g', '牛油果半个'],
      reason: '富含Omega-3脂肪酸，有益心血管健康',
    },
    {
      id: generateId(),
      name: '希腊酸奶水果杯',
      calories: Math.round(goal.calories * 0.15),
      protein: Math.round(goal.protein * 0.15),
      carbs: Math.round(goal.carbs * 0.15),
      fat: Math.round(goal.fat * 0.1),
      ingredients: ['希腊酸奶200g', '混合莓果50g', '坚果10g', '蜂蜜5g'],
      reason: isGain ? '健康加餐，补充蛋白质和益生菌' : '低卡零食，满足口腹之欲',
    },
  ];
}

function generateExerciseRecommendations(profileGoal: string, activityLevel: string): ExerciseRecommendation[] {
  const isActive = ['active', 'very_active'].includes(activityLevel);
  const isLose = profileGoal === 'lose';
  const isGain = profileGoal === 'gain';

  return [
    {
      id: generateId(),
      name: isLose ? '间歇性快走' : '慢跑有氧',
      type: 'cardio',
      duration: isActive ? 40 : 30,
      caloriesBurned: isActive ? 280 : 200,
      difficulty: 'beginner',
      reason: isLose
        ? '空腹或饭后1小时进行，燃脂效率最高的有氧运动'
        : '提高心肺功能，为更高强度训练做准备',
    },
    {
      id: generateId(),
      name: isGain ? '力量训练·推类' : '全身循环训练',
      type: 'strength',
      duration: 35,
      caloriesBurned: 220,
      difficulty: 'intermediate',
      reason: isGain
        ? '俯卧撑+哑铃推举+臂屈伸，刺激胸肩肱三头肌生长'
        : '深蹲+俯卧撑+平板支撑循环，全面激活肌肉群',
    },
    {
      id: generateId(),
      name: '瑜伽拉伸',
      type: 'flexibility',
      duration: 20,
      caloriesBurned: 80,
      difficulty: 'beginner',
      reason: '改善身体柔韧性，缓解肌肉紧张，促进恢复',
    },
    {
      id: generateId(),
      name: 'HIIT燃脂',
      type: 'hiit',
      duration: 20,
      caloriesBurned: 300,
      difficulty: 'advanced',
      reason: isLose ? 'EPOC效应持续燃脂24小时，减脂利器' : '短时高效，提升代谢水平',
    },
  ];
}

export function generateDailyRecommendations(userId: string): { meals: MealRecommendation[]; exercises: ExerciseRecommendation[] } {
  const db = getDb();
  const profile = getProfile(userId);

  if (!profile) {
    throw new Error('请先完善个人资料（身高、体重、年龄等）');
  }

  const goal = calculateTdee(profile);
  const meals = generateMealRecommendations(goal, profile.goal);
  const exercises = generateExerciseRecommendations(profile.goal, profile.activity_level);
  const today = new Date().toISOString().split('T')[0];
  const mealContent = JSON.stringify(meals);
  const exerciseContent = JSON.stringify(exercises);

  db.transaction(() => {
    db.prepare(`
      INSERT OR REPLACE INTO daily_recommendations (id, user_id, date, type, content)
      VALUES (?, ?, ?, 'meal', ?)
    `).run(generateId(), userId, today, mealContent);

    db.prepare(`
      INSERT OR REPLACE INTO daily_recommendations (id, user_id, date, type, content)
      VALUES (?, ?, ?, 'exercise', ?)
    `).run(generateId(), userId, today, exerciseContent);
  })();

  return { meals, exercises };
}

export function getDailyRecommendations(userId: string, date?: string): {
  meals: MealRecommendation[] | null; exercises: ExerciseRecommendation[] | null;
} {
  const db = getDb();
  const targetDate = date || new Date().toISOString().split('T')[0];

  const meal = db.prepare(
    'SELECT * FROM daily_recommendations WHERE user_id = ? AND date = ? AND type = ?',
  ).get(userId, targetDate, 'meal') as any;

  const exercise = db.prepare(
    'SELECT * FROM daily_recommendations WHERE user_id = ? AND date = ? AND type = ?',
  ).get(userId, targetDate, 'exercise') as any;

  return {
    meals: meal ? JSON.parse(meal.content) : null,
    exercises: exercise ? JSON.parse(exercise.content) : null,
  };
}

export function markRecommendationCompleted(recommendationId: string): void {
  const db = getDb();
  db.prepare('UPDATE daily_recommendations SET is_completed = 1 WHERE id = ?').run(recommendationId);
}
