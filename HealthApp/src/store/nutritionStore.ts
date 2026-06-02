import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

export interface FoodLog {
  id: string;
  foodName: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string;
  createdAt: string;
}

export interface MealRecord {
  id: string;
  userId: string;
  recordDate: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodLog[];
}

export interface User {
  id: string;
  phone?: string;
  email?: string;
  height: number;
  weight: number;
  age: number;
  gender: 'male' | 'female';
  goal: 'lose' | 'maintain' | 'gain';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  questionnaireCompleted?: boolean;
  healthProfile?: {
    dietaryPreference: 'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'paleo';
    allergies: string[];
    healthConditions: string[];
    exerciseFrequency: 'never' | 'rarely' | 'sometimes' | 'often' | 'daily';
    exerciseTypes: string[];
    cookingAbility: 'beginner' | 'intermediate' | 'advanced';
    mealPrepTime: 'quick' | 'moderate' | 'any';
  };
}

export interface DailyNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionStore {
  user: User | null;
  mealRecords: MealRecord[];
  dailyNutrition: DailyNutrition;
  weeklyRecipes: any[];
  
  setUser: (user: User) => void;
  addMealRecord: (record: MealRecord) => void;
  updateDailyNutrition: () => void;
  calculateDailyGoals: () => DailyNutrition;
  
  loadUserData: () => Promise<void>;
  saveUserData: () => Promise<void>;
}

const defaultDailyNutrition: DailyNutrition = {
  calories: 2000,
  protein: 80,
  carbs: 250,
  fat: 65,
};

export const useNutritionStore = create<NutritionStore>((set, get) => ({
  user: null,
  mealRecords: [],
  dailyNutrition: defaultDailyNutrition,
  weeklyRecipes: [],

  setUser: (user) => {
    set({ user });
    get().updateDailyNutrition();
    get().saveUserData();
  },

  addMealRecord: (record) => {
    set((state) => ({
      mealRecords: [...state.mealRecords, record],
    }));
    get().updateDailyNutrition();
  },

  updateDailyNutrition: () => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = get().mealRecords.filter(
      (record) => record.recordDate === today
    );

    const totals = todayRecords.reduce(
      (acc, record) => {
        record.foods.forEach((food) => {
          acc.calories += food.calories;
          acc.protein += food.protein;
          acc.carbs += food.carbs;
          acc.fat += food.fat;
        });
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    set({ dailyNutrition: totals });
  },

  calculateDailyGoals: () => {
    const user = get().user;
    if (!user) return defaultDailyNutrition;

    let bmr: number;
    if (user.gender === 'male') {
      bmr = 88.362 + 13.397 * user.weight + 4.799 * user.height - 5.677 * user.age;
    } else {
      bmr = 447.593 + 9.247 * user.weight + 3.098 * user.height - 4.33 * user.age;
    }

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    const tdee = bmr * activityMultipliers[user.activityLevel];

    let calories: number;
    switch (user.goal) {
      case 'lose':
        calories = tdee - 500;
        break;
      case 'gain':
        calories = tdee + 300;
        break;
      default:
        calories = tdee;
    }

    return {
      calories: Math.round(calories),
      protein: Math.round(user.weight * 1.6),
      carbs: Math.round((calories * 0.5) / 4),
      fat: Math.round((calories * 0.25) / 9),
    };
  },

  loadUserData: async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        set({ user: parsed });
        get().updateDailyNutrition();
      }
    } catch (error) {
      logger.error('Failed to load user data:', error);
    }
  },

  saveUserData: async () => {
    try {
      const user = get().user;
      if (user) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }
    } catch (error) {
      logger.error('Failed to save user data:', error);
    }
  },
}));
