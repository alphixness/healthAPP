import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { validate } from '../middleware/validate';
import { success, error, paginated } from '../utils/response';
import * as adminService from '../services/admin.service';

const router = Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = adminService.getDashboardStats();
    success(res, stats);
  } catch (err: any) {
    error(res, err.message);
  }
});

router.get('/users', (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const search = req.query.search as string | undefined;
    const result = adminService.getUsersList(page, limit, search);
    paginated(res, result.users as any[], result.total, result.page, result.limit);
  } catch (err: any) {
    error(res, err.message);
  }
});

const roleSchema = z.object({
  role: z.enum(['user', 'admin']),
});

router.put('/users/:id/role', validate(roleSchema), (req: Request, res: Response) => {
  try {
    const updated = adminService.updateUserRole(req.params.id as string, req.body.role);
    if (!updated) {
      error(res, '用户不存在', 404);
      return;
    }
    success(res, { message: '角色已更新' });
  } catch (err: any) {
    error(res, err.message);
  }
});

router.delete('/users/:id', (req: Request, res: Response) => {
  try {
    const deleted = adminService.deleteUser(req.params.id as string);
    if (!deleted) {
      error(res, '用户不存在', 404);
      return;
    }
    success(res, { message: '用户已删除' });
  } catch (err: any) {
    error(res, err.message);
  }
});

router.get('/recipes', (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const result = adminService.getAllRecipes(page, limit);
    paginated(res, result.recipes as any[], result.total, result.page, result.limit);
  } catch (err: any) {
    error(res, err.message);
  }
});

export { router as adminRoutes };
