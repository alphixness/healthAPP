export interface User {
  id: string
  height: number
  weight: number
  age: number
  gender: 'male' | 'female'
  goal: 'lose' | 'maintain' | 'gain'
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  dailyCalorieTarget: number
  createdAt: string
  updatedAt: string
}

export interface MealRecord {
  id: string
  userId: string
  recordDate: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  createdAt: string
  foods: FoodLog[]
}

export interface FoodLog {
  id: string
  mealRecordId: string
  foodName: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  imageUrl?: string
  createdAt: string
}

export interface NutritionSummary {
  calories: { current: number; target: number }
  protein: { current: number; target: number }
  carbs: { current: number; target: number }
  fat: { current: number; target: number }
}

export interface Recipe {
  id: string
  name: string
  category: 'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack'
  imageUrl: string
  calories: number
  protein: number
  carbs: number
  fat: number
  prepTime: number
  ingredients: string[]
  steps: string[]
  isPremium: boolean
  isSaved?: boolean
}

export interface ExerciseLog {
  id: string
  userId: string
  exerciseDate: string
  exerciseType: string
  duration: number
  caloriesBurned: number
  createdAt: string
}

export interface ExercisePlan {
  dayOfWeek: number
  exercises: ExerciseSuggestion[]
}

export interface ExerciseSuggestion {
  type: string
  name: string
  duration: number
  intensity: 'low' | 'medium' | 'high'
  caloriesBurned: number
  description: string
}

export interface Conversation {
  id: string
  userId: string
  title: string
  createdAt: string
  lastMessage?: string
}

export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export type RootStackParamList = {
  Onboarding: undefined
  MainTabs: undefined
  Camera: undefined
  Assistant: { conversationId?: string }
  RecipeDetail: { recipeId: string }
}

export type MainTabParamList = {
  Home: undefined
  Meals: undefined
  Recipes: undefined
  Exercise: undefined
  Profile: undefined
}
