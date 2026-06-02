import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { success, error } from '../utils/response';
import * as bloggerService from '../services/blogger.service';

const router = Router();

const applySchema = z.object({
  blogger_type: z.enum(['fitness', 'food']),
  display_name: z.string().min(1, '请输入显示名称').max(50),
  bio: z.string().max(500).optional().default(''),
  avatar_url: z.string().optional().default(''),
  cover_url: z.string().optional().default(''),
});

// POST /api/v1/bloggers/apply — 申请成为博主
router.post('/apply', authMiddleware, validate(applySchema), (req: Request, res: Response) => {
  try {
    const result = bloggerService.applyToBeBlogger(
      req.user!.userId, req.body.blogger_type, req.body.display_name,
      req.body.bio, req.body.avatar_url, req.body.cover_url,
    );
    success(res, result, 201);
  } catch (err: any) {
    error(res, err.message, 400);
  }
});

// GET /api/v1/bloggers — 获取博主列表
router.get('/', (req: Request, res: Response) => {
  try {
    const type = req.query.type as string | undefined;
    const bloggers = bloggerService.listBloggers(
      type && (type === 'fitness' || type === 'food') ? type : undefined,
    );
    success(res, { bloggers });
  } catch (err: any) {
    error(res, err.message);
  }
});

// GET /api/v1/bloggers/:userId — 获取博主个人信息
router.get('/:userId', (req: Request, res: Response) => {
  try {
    const profile = bloggerService.getBloggerProfile(req.params.userId);
    if (!profile) {
      error(res, '博主不存在', 404);
      return;
    }
    success(res, { profile });
  } catch (err: any) {
    error(res, err.message);
  }
});

// Admin routes
// GET /api/v1/bloggers/admin/applications — 获取待审核申请
router.get('/admin/applications', authMiddleware, (req: Request, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      error(res, '无权操作', 403);
      return;
    }
    const apps = bloggerService.getPendingApplications();
    success(res, { applications: apps });
  } catch (err: any) {
    error(res, err.message);
  }
});

// POST /api/v1/bloggers/admin/approve/:id — 批准申请
router.post('/admin/approve/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      error(res, '无权操作', 403);
      return;
    }
    const result = bloggerService.approveBlogger(req.params.id);
    success(res, result);
  } catch (err: any) {
    error(res, err.message);
  }
});

// POST /api/v1/bloggers/admin/reject/:id — 拒绝申请
router.post('/admin/reject/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      error(res, '无权操作', 403);
      return;
    }
    const result = bloggerService.rejectBlogger(req.params.id);
    success(res, result);
  } catch (err: any) {
    error(res, err.message);
  }
});

export { router as bloggerRoutes };
