import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

export interface ExerciseLog {
  id: string;
  exerciseName: string;
  exerciseIcon: string;
  duration: number;
  calories: number;
  heartRate?: number;
  distance?: number;
  createdAt: string;
  recordDate: string;
}

export interface DailyExerciseStats {
  date: string;
  totalDuration: number;
  totalCalories: number;
  exerciseCount: number;
  exercises: ExerciseLog[];
}

interface ExerciseStore {
  exerciseLogs: ExerciseLog[];
  weeklyExerciseStats: DailyExerciseStats[];
  
  addExerciseLog: (log: ExerciseLog) => void;
  removeExerciseLog: (logId: string) => void;
  getTodayExercises: () => ExerciseLog[];
  getTodayCalories: () => number;
  getTodayDuration: () => number;
  getWeeklyStats: () => DailyExerciseStats[];
  getStreak: () => number;
  
  loadExerciseData: () => Promise<void>;
  saveExerciseData: () => Promise<void>;
}

export const useExerciseStore = create<ExerciseStore>((set, get) => ({
  exerciseLogs: [],
  weeklyExerciseStats: [],

  addExerciseLog: (log) => {
    set((state) => ({
      exerciseLogs: [...state.exerciseLogs, log],
    }));
    get().saveExerciseData();
  },

  removeExerciseLog: (logId) => {
    set((state) => ({
      exerciseLogs: state.exerciseLogs.filter((log) => log.id !== logId),
    }));
    get().saveExerciseData();
  },

  getTodayExercises: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().exerciseLogs.filter((log) => log.recordDate === today);
  },

  getTodayCalories: () => {
    const todayExercises = get().getTodayExercises();
    return todayExercises.reduce((sum, log) => sum + log.calories, 0);
  },

  getTodayDuration: () => {
    const todayExercises = get().getTodayExercises();
    return todayExercises.reduce((sum, log) => sum + log.duration, 0);
  },

  getWeeklyStats: () => {
    const stats: DailyExerciseStats[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayExercises = get().exerciseLogs.filter((log) => log.recordDate === dateStr);
      
      stats.push({
        date: dateStr,
        totalDuration: dayExercises.reduce((sum, log) => sum + log.duration, 0),
        totalCalories: dayExercises.reduce((sum, log) => sum + log.calories, 0),
        exerciseCount: dayExercises.length,
        exercises: dayExercises,
      });
    }
    
    return stats;
  },

  getStreak: () => {
    const weeklyStats = get().getWeeklyStats();
    let streak = 0;
    
    for (let i = weeklyStats.length - 1; i >= 0; i--) {
      if (weeklyStats[i].exerciseCount > 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  },

  loadExerciseData: async () => {
    try {
      const data = await AsyncStorage.getItem('exerciseLogs');
      if (data) {
        set({ exerciseLogs: JSON.parse(data) });
      }
    } catch (error) {
      logger.error('Failed to load exercise data:', error);
    }
  },

  saveExerciseData: async () => {
    try {
      await AsyncStorage.setItem('exerciseLogs', JSON.stringify(get().exerciseLogs));
    } catch (error) {
      logger.error('Failed to save exercise data:', error);
    }
  },
}));
