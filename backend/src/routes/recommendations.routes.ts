import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { success, error } from '../utils/response';
import * as recommendationsService from '../services/recommendations.service';
import { checkMembership } from '../services/membership.service';

const router = Router();

// GET /api/v1/recommendations/daily — 获取每日个性化推荐（会员专享）
router.get('/daily', authMiddleware, (req: Request, res: Response) => {
  try {
    if (!checkMembership(req.user!.userId)) {
      error(res, '会员专享功能，请先开通会员', 403);
      return;
    }

    const date = req.query.date as string | undefined;
    let recommendations = recommendationsService.getDailyRecommendations(req.user!.userId, date);

    // 如果今天还没有生成推荐，自动生成
    if (!recommendations.meals && !recommendations.exercises) {
      recommendations = recommendationsService.generateDailyRecommendations(req.user!.userId);
    }

    success(res, recommendations);
  } catch (err: any) {
    error(res, err.message, 400);
  }
});

// POST /api/v1/recommendations/generate — 强制重新生成今日推荐
router.post('/generate', authMiddleware, (req: Request, res: Response) => {
  try {
    if (!checkMembership(req.user!.userId)) {
      error(res, '会员专享功能，请先开通会员', 403);
      return;
    }

    const result = recommendationsService.generateDailyRecommendations(req.user!.userId);
    success(res, result);
  } catch (err: any) {
    error(res, err.message, 400);
  }
});

export { router as recommendationsRoutes };
