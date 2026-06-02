import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { success, error, paginated } from '../utils/response';
import * as updateService from '../services/update.service';

const router = Router();

// GET /api/v1/updates/check — 客户端检查更新
router.get('/check', (_req: Request, res: Response) => {
  try {
    const latest = updateService.getLatestRelease();
    if (!latest) {
      success(res, { hasUpdate: false });
      return;
    }
    success(res, {
      hasUpdate: true,
      versionCode: latest.version_code,
      versionName: latest.version_name,
      apkUrl: latest.apk_url,
      fileSize: latest.file_size,
      releaseNotes: latest.release_notes,
      forceUpdate: !!latest.force_update,
    });
  } catch (err: any) {
    error(res, err.message);
  }
});

// Admin routes
router.use(authMiddleware, adminMiddleware);

// POST /api/v1/updates — 管理员上传新版本
router.post('/', (req: Request, res: Response) => {
  try {
    const { versionCode, versionName, apkUrl, fileSize, releaseNotes, forceUpdate } = req.body;
    if (!versionCode || !versionName || !apkUrl) {
      error(res, 'versionCode, versionName, apkUrl 为必填');
      return;
    }
    const release = updateService.createRelease({
      versionCode, versionName, apkUrl, fileSize, releaseNotes, forceUpdate,
    });
    success(res, release, 201);
  } catch (err: any) {
    error(res, err.message);
  }
});

// GET /api/v1/updates — 管理员获取版本列表
router.get('/', (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const result = updateService.getAllReleases(page, limit);
    paginated(res, result.releases, result.total, page, limit);
  } catch (err: any) {
    error(res, err.message);
  }
});

// DELETE /api/v1/updates/:id — 管理员删除版本
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = updateService.deleteRelease(req.params.id);
    if (!deleted) { error(res, '版本不存在', 404); return; }
    success(res, { message: '已删除' });
  } catch (err: any) {
    error(res, err.message);
  }
});

export { router as updateRoutes };
