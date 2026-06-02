import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { success, error } from '../utils/response';
import * as usageService from '../services/usage.service';
import * as membershipService from '../services/membership.service';

const router = Router();

// ===== 客户端接口 =====

// GET /api/v1/usage/limits — 获取用户的功能限制信息
router.get('/limits', authMiddleware, (req: Request, res: Response) => {
  try {
    const region = (req.query.region as 'china' | 'global') || 'china';
    const isPremium = membershipService.checkMembership(req.user!.userId);
    const tier = isPremium ? 'premium' : 'free';
    const limits = usageService.getUserLimits(tier, region);
    success(res, { tier, limits });
  } catch (err: any) {
    error(res, err.message);
  }
});

// GET /api/v1/usage/today — 获取用户今日用量
router.get('/today', authMiddleware, (req: Request, res: Response) => {
  try {
    const usage = usageService.getTodayUsageDetail(req.user!.userId);
    success(res, usage);
  } catch (err: any) {
    error(res, err.message);
  }
});

// POST /api/v1/usage/increment — 增加使用计数并检查限制
router.post('/increment', authMiddleware, (req: Request, res: Response) => {
  try {
    const { featureKey, region } = req.body;
    if (!featureKey) { error(res, 'featureKey 为必填'); return; }

    const userRegion: 'china' | 'global' = region || 'china';
    const isPremium = membershipService.checkMembership(req.user!.userId);

    const exceeded = usageService.isLimitExceeded(
      req.user!.userId, featureKey,
      isPremium ? 'premium' : 'free', userRegion,
    );

    if (exceeded) {
      error(res, '今日使用次数已达上限', 429);
      return;
    }

    const count = usageService.incrementUsage(req.user!.userId, featureKey);
    success(res, { count, remaining: undefined });
  } catch (err: any) {
    error(res, err.message);
  }
});

// ===== 管理接口 =====
router.use(authMiddleware, adminMiddleware);

// POST /api/v1/usage/limits — 设置功能限制
router.post('/limits', (req: Request, res: Response) => {
  try {
    const { tier, featureKey, hardLimit, region } = req.body;
    if (!tier || !featureKey || hardLimit === undefined) {
      error(res, 'tier, featureKey, hardLimit 为必填');
      return;
    }
    const limit = usageService.setFeatureLimit({ tier, featureKey, hardLimit, region });
    success(res, limit, 201);
  } catch (err: any) {
    error(res, err.message);
  }
});

// PUT /api/v1/usage/limits/:id — 更新限制
router.put('/limits/:id', (req: Request, res: Response) => {
  try {
    const { hardLimit } = req.body;
    if (hardLimit === undefined) { error(res, 'hardLimit 为必填'); return; }
    const limit = usageService.updateFeatureLimit(req.params.id, hardLimit);
    if (!limit) { error(res, '限制不存在', 404); return; }
    success(res, limit);
  } catch (err: any) {
    error(res, err.message);
  }
});

export { router as usageRoutes };
