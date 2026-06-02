import AsyncStorage from '@react-native-async-storage/async-storage'

const KEYS = {
  USER: '@healthapp_user',
  ONBOARDING: '@healthapp_onboarding',
  MEALS: '@healthapp_meals',
  RECIPES_SAVED: '@healthapp_recipes_saved',
  EXERCISE_LOGS: '@healthapp_exercise_logs',
  CONVERSATIONS: '@healthapp_conversations',
  MESSAGES: '@healthapp_messages',
}

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch {
      return null
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value))
    } catch {
      // silently fail
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key)
    } catch {
      // silently fail
    }
  },
}

export { KEYS }
