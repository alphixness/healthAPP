import { RecipePost } from '../store/foodChannelStore';
import { Recipe } from '../types';

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionContext {
  remainingCalories: number;
  remainingProtein: number;
  remainingCarbs: number;
  remainingFat: number;
  goalType: 'lose' | 'maintain' | 'gain';
}

function getNutrition(item: RecipePost | Recipe): NutritionData {
  if ('nutrition' in item) return item.nutrition;
  return { calories: item.calories, protein: item.protein, carbs: item.carbs, fat: item.fat };
}

function perMacroScore(recipeValue: number, remaining: number): number {
  if (remaining <= 0) return 1;
  const diff = Math.abs(recipeValue - remaining);
  return Math.max(0, 1 - diff / remaining);
}

export function scoreRecipe(item: RecipePost | Recipe, context: NutritionContext): number {
  const n = getNutrition(item);
  const r = context;

  const calScore = perMacroScore(n.calories, r.remainingCalories);
  const proteinScore = perMacroScore(n.protein, r.remainingProtein);
  const carbsScore = perMacroScore(n.carbs, r.remainingCarbs);
  const fatScore = perMacroScore(n.fat, r.remainingFat);

  let score = calScore * 0.40 + proteinScore * 0.30 + carbsScore * 0.15 + fatScore * 0.15;

  // Goal-specific bonuses
  if (r.goalType === 'lose' && n.calories < 300) score += 0.1;
  if (r.goalType === 'gain' && n.protein > 30) score += 0.1;

  return Math.round(Math.min(score, 1) * 100);
}

export function sortRecipesByFit<T extends RecipePost | Recipe>(
  recipes: T[],
  context: NutritionContext,
): (T & { fitScore: number })[] {
  return recipes
    .map(item => ({ ...item, fitScore: scoreRecipe(item, context) }))
    .sort((a, b) => b.fitScore - a.fitScore);
}

export function buildNutritionContext(
  goals: NutritionData | null,
  consumed: NutritionData,
  goalType: 'lose' | 'maintain' | 'gain',
): NutritionContext | null {
  if (!goals) return null;
  return {
    remainingCalories: Math.max(0, goals.calories - consumed.calories),
    remainingProtein: Math.max(0, goals.protein - consumed.protein),
    remainingCarbs: Math.max(0, goals.carbs - consumed.carbs),
    remainingFat: Math.max(0, goals.fat - consumed.fat),
    goalType,
  };
}
