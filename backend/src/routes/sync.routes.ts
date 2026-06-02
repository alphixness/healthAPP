import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { success, error } from '../utils/response';
import * as syncService from '../services/sync.service';

const router = Router();

router.post('/upload', authMiddleware, (req: Request, res: Response) => {
  try {
    const result = syncService.uploadData(req.user!.userId, req.body);
    success(res, result);
  } catch (err: any) {
    error(res, err.message);
  }
});

router.get('/download', authMiddleware, (req: Request, res: Response) => {
  try {
    const data = syncService.downloadData(req.user!.userId);
    success(res, data);
  } catch (err: any) {
    error(res, err.message);
  }
});

export { router as syncRoutes };
