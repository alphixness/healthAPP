import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthTokens, AuthUser } from '../types/auth';
import { logger } from '../utils/logger';

interface AuthStore {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: AuthUser, tokens: AuthTokens) => void;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
  loadAuth: () => Promise<void>;
  getAccessToken: () => string | null;
}

const AUTH_KEY = 'auth_tokens';
const USER_KEY = 'auth_user';

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, tokens) => {
    set({ user, tokens, isAuthenticated: true });
    AsyncStorage.setItem(AUTH_KEY, JSON.stringify(tokens));
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  setUser: (user) => {
    set({ user });
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearAuth: () => {
    set({ user: null, tokens: null, isAuthenticated: false });
    AsyncStorage.removeItem(AUTH_KEY);
    AsyncStorage.removeItem(USER_KEY);
  },

  loadAuth: async () => {
    try {
      const [tokensData, userData] = await Promise.all([
        AsyncStorage.getItem(AUTH_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);
      if (tokensData && userData) {
        const tokens: AuthTokens = JSON.parse(tokensData);
        const user: AuthUser = JSON.parse(userData);
        set({ user, tokens, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      logger.error('Failed to load auth:', error);
      set({ isLoading: false });
    }
  },

  getAccessToken: () => {
    return get().tokens?.accessToken || null;
  },
}));
