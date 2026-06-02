import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { success, error } from '../utils/response';
import * as userService from '../services/user.service';

const router = Router();

const profileSchema = z.object({
  height: z.number().min(50, '身高应在50-250cm之间').max(250),
  weight: z.number().min(20, '体重应在20-300kg之间').max(300),
  age: z.number().int().min(1, '年龄应在1-150之间').max(150),
  gender: z.enum(['male', 'female']),
  goal: z.enum(['lose', 'maintain', 'gain']),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
});

router.get('/', authMiddleware, (req: Request, res: Response) => {
  try {
    const profile = userService.getProfile(req.user!.userId);
    if (!profile) {
      success(res, { profile: null });
      return;
    }
    const goals = userService.calculateDailyGoals(profile);
    success(res, { profile, goals });
  } catch (err: any) {
    error(res, err.message);
  }
});

router.put('/', authMiddleware, validate(profileSchema), (req: Request, res: Response) => {
  try {
    const profile = userService.upsertProfile(req.user!.userId, req.body);
    const goals = userService.calculateDailyGoals(profile);
    success(res, { profile, goals });
  } catch (err: any) {
    error(res, err.message);
  }
});

export { router as profileRoutes };
