import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { success, error } from '../utils/response';
import * as exerciseService from '../services/exercise.service';

const router = Router();

const createSchema = z.object({
  exerciseName: z.string().min(1, '运动名称不能为空'),
  exerciseIcon: z.string().optional(),
  exerciseType: z.string().optional(),
  duration: z.number().positive('运动时长必须大于0'),
  caloriesBurned: z.number().default(0),
  heartRate: z.number().optional(),
  distance: z.number().optional(),
  recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式应为YYYY-MM-DD'),
});

router.get('/', authMiddleware, (req: Request, res: Response) => {
  try {
    const { date, from, to } = req.query;

    if (from && to) {
      const result = exerciseService.getExercisesByRange(req.user!.userId, from as string, to as string);
      success(res, result);
      return;
    }

    const targetDate = (date as string) || new Date().toISOString().split('T')[0];
    const result = exerciseService.getExercisesByDate(req.user!.userId, targetDate);
    const streak = exerciseService.getStreak(req.user!.userId);
    success(res, { ...result, streak });
  } catch (err: any) {
    error(res, err.message);
  }
});

router.post('/', authMiddleware, validate(createSchema), (req: Request, res: Response) => {
  try {
    const log = exerciseService.createExerciseLog(req.user!.userId, req.body);
    success(res, { log }, 201);
  } catch (err: any) {
    error(res, err.message);
  }
});

router.delete('/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    const deleted = exerciseService.deleteExerciseLog(req.params.id as string, req.user!.userId);
    if (!deleted) {
      error(res, '记录不存在', 404);
      return;
    }
    success(res, { message: '已删除' });
  } catch (err: any) {
    error(res, err.message);
  }
});

export { router as exerciseRoutes };
