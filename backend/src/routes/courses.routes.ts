import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { success, error, paginated } from '../utils/response';
import * as courseService from '../services/course.service';
import { checkMembership } from '../services/membership.service';

const router = Router();

const courseSchema = z.object({
  title: z.string().min(1, '请输入课程标题').max(100),
  description: z.string().max(2000).optional().default(''),
  category: z.string().optional().default('减脂'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('beginner'),
  duration: z.number().min(0).optional().default(0),
  calories: z.number().min(0).optional().default(0),
  is_free: z.number().int().min(0).max(1).optional().default(1),
  is_member_only: z.number().int().min(0).max(1).optional().default(0),
  cover_emoji: z.string().optional().default('💪'),
  cover_image: z.string().optional().default(''),
  video_url: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
});

const courseContentSchema = z.object({
  title: z.string().min(1, '请输入课时标题'),
  content: z.string().optional().default(''),
  video_url: z.string().optional().default(''),
  duration: z.number().min(0).optional().default(0),
  sort_order: z.number().int().min(0).optional().default(0),
  is_preview: z.number().int().min(0).max(1).optional().default(0),
});

// GET /api/v1/courses — 获取课程列表
router.get('/', (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = courseService.listCourses({
      category: req.query.category as string,
      difficulty: req.query.difficulty as string,
      is_free: req.query.is_free !== undefined ? parseInt(req.query.is_free as string) : undefined,
      creator_id: req.query.creator_id as string,
      page, limit,
    });
    paginated(res, result.courses, result.total, result.page, result.limit);
  } catch (err: any) {
    error(res, err.message);
  }
});

// GET /api/v1/courses/my — 我发布的课程 (需认证)
router.get('/my', authMiddleware, (req: Request, res: Response) => {
  try {
    const courses = courseService.listCoursesByCreator(req.user!.userId);
    success(res, { courses });
  } catch (err: any) {
    error(res, err.message);
  }
});

// GET /api/v1/courses/:id — 课程详情
router.get('/:id', (req: Request, res: Response) => {
  try {
    const course = courseService.getCourse(req.params.id);
    if (!course) {
      error(res, '课程不存在', 404);
      return;
    }
    courseService.incrementCourseViews(req.params.id);

    const contents = courseService.getCourseContents(req.params.id);
    success(res, { course, contents });
  } catch (err: any) {
    error(res, err.message);
  }
});

// POST /api/v1/courses — 创建课程 (博主/管理员)
router.post('/', authMiddleware, validate(courseSchema), (req: Request, res: Response) => {
  try {
    const role = req.user!.role;
    if (!['fitness_blogger', 'food_blogger', 'admin'].includes(role)) {
      error(res, '仅博主可发布课程', 403);
      return;
    }
    const course = courseService.createCourse(req.user!.userId, req.body);
    success(res, { course }, 201);
  } catch (err: any) {
    error(res, err.message, 400);
  }
});

// PUT /api/v1/courses/:id — 更新课程
router.put('/:id', authMiddleware, validate(courseSchema.partial()), (req: Request, res: Response) => {
  try {
    const course = courseService.updateCourse(req.params.id, req.user!.userId, req.body);
    success(res, { course });
  } catch (err: any) {
    error(res, err.message, 400);
  }
});

// DELETE /api/v1/courses/:id — 删除课程
router.delete('/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    courseService.deleteCourse(req.params.id, req.user!.userId);
    success(res, { message: '课程已删除' });
  } catch (err: any) {
    error(res, err.message, 400);
  }
});

// --- Course Contents ---

// POST /api/v1/courses/:id/contents — 添加课时
router.post('/:id/contents', authMiddleware, validate(courseContentSchema), (req: Request, res: Response) => {
  try {
    const course = courseService.getCourse(req.params.id);
    if (!course) { error(res, '课程不存在', 404); return; }
    if (course.creator_id !== req.user!.userId && req.user!.role !== 'admin') {
      error(res, '无权操作', 403); return;
    }
    const content = courseService.createCourseContent(req.params.id, req.body);
    success(res, { content }, 201);
  } catch (err: any) {
    error(res, err.message, 400);
  }
});

// GET /api/v1/courses/:id/contents — 获取课时列表
router.get('/:id/contents', (req: Request, res: Response) => {
  try {
    const contents = courseService.getCourseContents(req.params.id);
    success(res, { contents });
  } catch (err: any) {
    error(res, err.message);
  }
});

// PUT /api/v1/courses/:id/contents/:contentId — 更新课时
router.put('/:id/contents/:contentId', authMiddleware, validate(courseContentSchema.partial()), (req: Request, res: Response) => {
  try {
    const content = courseService.updateCourseContent(req.params.contentId, req.body);
    success(res, { content });
  } catch (err: any) {
    error(res, err.message, 400);
  }
});

// DELETE /api/v1/courses/:id/contents/:contentId — 删除课时
router.delete('/:id/contents/:contentId', authMiddleware, (req: Request, res: Response) => {
  try {
    courseService.deleteCourseContent(req.params.contentId);
    success(res, { message: '课时已删除' });
  } catch (err: any) {
    error(res, err.message, 400);
  }
});

// --- Subscriptions ---

// POST /api/v1/courses/:id/subscribe — 购买课程
router.post('/:id/subscribe', authMiddleware, (req: Request, res: Response) => {
  try {
    const course = courseService.getCourse(req.params.id);
    if (!course) { error(res, '课程不存在', 404); return; }

    // 如果是会员专享，先检查会员身份
    if (course.is_member_only) {
      const isMember = checkMembership(req.user!.userId);
      if (!isMember) {
        error(res, '会员专享课程，请先开通会员', 403);
        return;
      }
    }

    const amount = course.is_free ? 0 : (req.body.amount || 0);
    courseService.subscribeToCourse(req.user!.userId, req.params.id, amount);
    success(res, { message: '订阅成功' }, 201);
  } catch (err: any) {
    error(res, err.message, 400);
  }
});

// GET /api/v1/courses/:id/subscription — 检查订阅状态
router.get('/:id/subscription', authMiddleware, (req: Request, res: Response) => {
  try {
    const subscribed = courseService.checkCourseSubscription(req.user!.userId, req.params.id);
    success(res, { subscribed });
  } catch (err: any) {
    error(res, err.message);
  }
});

export { router as coursesRoutes };
