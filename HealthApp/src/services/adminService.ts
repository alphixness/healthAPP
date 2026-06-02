import { api } from './api';

export interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  activeUsersToday: number;
  totalMeals: number;
  totalExercises: number;
  totalRecipes: number;
  usersByGoal: { goal: string; count: number }[];
  mealsByType: { meal_type: string; count: number }[];
}

export interface AdminUser {
  id: string;
  email: string | null;
  phone: string | null;
  nickname: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface AdminRecipe {
  id: string;
  name: string;
  category: string;
  cover_emoji: string;
  calories: number;
  difficulty: string;
  cook_time: number;
  created_at: string;
}

export const adminService = {
  async getStats(): Promise<DashboardStats | null> {
    const result = await api.admin.getStats();
    return result.success && result.data ? result.data : null;
  },

  async getUsers(
    page = 1,
    limit = 20,
    search = ''
  ): Promise<{ users: AdminUser[]; total: number } | null> {
    const result = await api.admin.getUsers(page, limit, search);
    if (!result.success) return null;
    return {
      users: result.data || [],
      total: result.meta?.total || 0,
    };
  },

  async updateUserRole(userId: string, role: string): Promise<boolean> {
    const result = await api.admin.updateUserRole(userId, role);
    return result.success;
  },

  async deleteUser(userId: string): Promise<boolean> {
    const result = await api.admin.deleteUser(userId);
    return result.success;
  },

  async getRecipes(limit = 50): Promise<AdminRecipe[] | null> {
    const result = await api.admin.getRecipes(limit);
    return result.success ? result.data || [] : null;
  },
};
