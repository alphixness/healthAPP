import { Request, Response, NextFunction } from 'express';
import { error } from '../utils/response';

export function adminMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    error(res, '需要管理员权限', 403);
    return;
  }
  next();
}
