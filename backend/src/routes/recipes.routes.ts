import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { validate } from '../middleware/validate';
import { success, error, paginated } from '../utils/response';
import * as recipeService from '../services/recipe.service';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const { category, page: p, limit: l } = req.query;
    const page = parseInt(p as string) || 1;
    const limit = Math.min(parseInt(l as string) || 20, 100);
    const result = recipeService.getAllRecipes(category as string, page, limit);
    paginated(res, result.recipes as any[], result.total, result.page, result.limit);
  } catch (err: any) {
    error(res, err.message);
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const recipe = recipeService.getRecipeById(req.params.id as string);
    if (!recipe) {
      error(res, '食谱不存在', 404);
      return;
    }
    success(res, { recipe });
  } catch (err: any) {
    error(res, err.message);
  }
});

const recipeSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  coverEmoji: z.string().optional(),
  description: z.string().optional(),
  calories: z.number().optional(),
  protein: z.number().optional(),
  carbs: z.number().optional(),
  fat: z.number().optional(),
  cookTime: z.number().optional(),
  servings: z.number().optional(),
  difficulty: z.string().optional(),
  ingredients: z.array(z.string()).optional(),
  steps: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

router.post('/', authMiddleware, adminMiddleware, validate(recipeSchema), (req: Request, res: Response) => {
  try {
    const recipe = recipeService.createRecipe(req.body);
    success(res, { recipe }, 201);
  } catch (err: any) {
    error(res, err.message);
  }
});

router.put('/:id', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  try {
    const updated = recipeService.updateRecipe(req.params.id as string, req.body);
    if (!updated) {
      error(res, '食谱不存在', 404);
      return;
    }
    success(res, { recipe: recipeService.getRecipeById(req.params.id as string) });
  } catch (err: any) {
    error(res, err.message);
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  try {
    const deleted = recipeService.deleteRecipe(req.params.id as string);
    if (!deleted) {
      error(res, '食谱不存在', 404);
      return;
    }
    success(res, { message: '已删除' });
  } catch (err: any) {
    error(res, err.message);
  }
});

export { router as recipesRoutes };
