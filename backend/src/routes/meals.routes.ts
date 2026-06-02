import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { success, error } from '../utils/response';
import * as mealsService from '../services/meals.service';

const router = Router();

const foodSchema = z.object({
  foodName: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().optional(),
  calories: z.number().default(0),
  protein: z.number().optional().default(0),
  carbs: z.number().optional().default(0),
  fat: z.number().optional().default(0),
});

const createMealSchema = z.object({
  recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式应为YYYY-MM-DD'),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  foods: z.array(foodSchema).min(1, '至少需要一个食物'),
});

router.get('/', authMiddleware, (req: Request, res: Response) => {
  try {
    const { date, from, to } = req.query;

    if (from && to) {
      const result = mealsService.getMealsByRange(req.user!.userId, from as string, to as string);
      success(res, result);
      return;
    }

    const targetDate = (date as string) || new Date().toISOString().split('T')[0];
    const result = mealsService.getMealsByDate(req.user!.userId, targetDate);
    success(res, result);
  } catch (err: any) {
    error(res, err.message);
  }
});

router.post('/', authMiddleware, validate(createMealSchema), (req: Request, res: Response) => {
  try {
    const record = mealsService.createMealRecord(req.user!.userId, req.body);
    success(res, { record }, 201);
  } catch (err: any) {
    error(res, err.message);
  }
});

router.delete('/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    const deleted = mealsService.deleteMealRecord(req.params.id as string, req.user!.userId);
    if (!deleted) {
      error(res, '记录不存在', 404);
      return;
    }
    success(res, { message: '已删除' });
  } catch (err: any) {
    error(res, err.message);
  }
});

export { router as mealsRoutes };
