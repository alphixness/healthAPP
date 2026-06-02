import { Recipe } from '../types'
import { weeklyRecipes, healthTips, quickQuestions } from './mockData'

export const mockRecipes: Recipe[] = weeklyRecipes

export const mockHealthTips: string[] = healthTips

export const mockQuickQuestions: string[] = quickQuestions

export function getRecipeById(id: string): Recipe | undefined {
  return weeklyRecipes.find((r) => r.id === id)
}

export function getRecipesByCategory(category: string): Recipe[] {
  if (category === 'all') return weeklyRecipes
  return weeklyRecipes.filter((r) => r.category === category)
}

export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: string,
): number {
  if (gender === 'male') {
    return 88.36 + 13.4 * weight + 4.8 * height - 5.7 * age
  }
  return 447.6 + 9.25 * weight + 3.1 * height - 4.33 * age
}

export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  }
  return Math.round(bmr * (multipliers[activityLevel] || 1.55))
}

export function calculateCalorieTarget(tdee: number, goal: string): number {
  switch (goal) {
    case 'lose':
      return tdee - 500
    case 'gain':
      return tdee + 300
    default:
      return tdee
  }
}

export function calculateMacroTarget(
  calories: number,
  goal: string,
): { protein: number; carbs: number; fat: number } {
  let proteinRatio = 0.3
  let carbRatio = 0.4
  let fatRatio = 0.3

  if (goal === 'lose') {
    proteinRatio = 0.35
    carbRatio = 0.35
    fatRatio = 0.3
  } else if (goal === 'gain') {
    proteinRatio = 0.3
    carbRatio = 0.45
    fatRatio = 0.25
  }

  return {
    protein: Math.round((calories * proteinRatio) / 4),
    carbs: Math.round((calories * carbRatio) / 4),
    fat: Math.round((calories * fatRatio) / 9),
  }
}
