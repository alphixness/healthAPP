import { api } from './api';
import { useNutritionStore } from '../store/nutritionStore';
import { logger } from '../utils/logger';

export const syncService = {
  async uploadAll(): Promise<boolean> {
    try {
      const { mealRecords, user } = useNutritionStore.getState();

      const meals = mealRecords.map((r) => ({
        recordDate: r.recordDate,
        mealType: r.mealType,
        foods: r.foods.map((f) => ({
          foodName: f.foodName,
          quantity: f.quantity,
          calories: f.calories,
          protein: f.protein,
          carbs: f.carbs,
          fat: f.fat,
        })),
      }));

      const profile = user
        ? {
            height: user.height,
            weight: user.weight,
            age: user.age,
            gender: user.gender,
            goal: user.goal,
            activity_level: user.activityLevel,
          }
        : undefined;

      const result = await api.sync.upload({ meals, exercises: [], profile });
      logger.info('Sync upload:', result);
      return result.success;
    } catch (error) {
      logger.error('Sync upload failed:', error);
      return false;
    }
  },

  async downloadAll(): Promise<boolean> {
    try {
      const result = await api.sync.download();
      if (!result.success || !result.data) return false;

      const { profile } = result.data;

      if (profile && profile.user_id) {
        const { setUser } = useNutritionStore.getState();
        setUser({
          id: profile.user_id,
          height: profile.height,
          weight: profile.weight,
          age: profile.age,
          gender: profile.gender,
          goal: profile.goal,
          activityLevel: profile.activity_level,
        });
      }

      return true;
    } catch (error) {
      logger.error('Sync download failed:', error);
      return false;
    }
  },
};
