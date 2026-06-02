import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { success, error } from '../utils/response';
import * as llmService from '../services/llm.service';

const router = Router();

// ===== 客户端接口 =====

// GET /api/v1/llm/providers — 前端拉取可用模型
router.get('/providers', authMiddleware, (req: Request, res: Response) => {
  try {
    const region = (req.query.region as 'china' | 'global') || undefined;
    const providers = llmService.getActiveProviders(region);
    // 不返回 api_key
    const safe = providers.map(p => ({
      id: p.id,
      name: p.name,
      provider_key: p.provider_key,
      region: p.region,
      sort_order: p.sort_order,
    }));
    success(res, safe);
  } catch (err: any) {
    error(res, err.message);
  }
});

// POST /api/v1/llm/chat/completions — AI 对话代理
router.post('/chat/completions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { providerKey, messages, stream } = req.body;
    if (!providerKey || !messages) {
      error(res, 'providerKey 和 messages 为必填');
      return;
    }
    const result = await llmService.proxyChatCompletion(providerKey, { messages, stream });
    success(res, { result });
  } catch (err: any) {
    error(res, err.message, 502);
  }
});

// POST /api/v1/llm/vision/recognize — 图片识别代理
router.post('/vision/recognize', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { providerKey, imageBase64 } = req.body;
    if (!providerKey || !imageBase64) {
      error(res, 'providerKey 和 imageBase64 为必填');
      return;
    }
    const result = await llmService.proxyVisionRecognition(providerKey, imageBase64);
    success(res, { result });
  } catch (err: any) {
    error(res, err.message, 502);
  }
});

// ===== 管理后台接口 =====
router.use(authMiddleware, adminMiddleware);

// GET /api/v1/llm/admin/providers — 获取所有提供商（含 API Key）
router.get('/admin/providers', (req: Request, res: Response) => {
  try {
    const providers = llmService.getAllProviders();
    success(res, providers);
  } catch (err: any) {
    error(res, err.message);
  }
});

// POST /api/v1/llm/admin/providers — 新增提供商
router.post('/admin/providers', (req: Request, res: Response) => {
  try {
    const { name, providerKey, apiUrl, modelName, apiKey, region, sortOrder } = req.body;
    if (!name || !providerKey || !apiUrl || !modelName) {
      error(res, 'name, providerKey, apiUrl, modelName 为必填');
      return;
    }
    const provider = llmService.createProvider({
      name, providerKey, apiUrl, modelName, apiKey: apiKey || '',
      region: region || 'china', sortOrder,
    });
    success(res, provider, 201);
  } catch (err: any) {
    error(res, err.message);
  }
});

// PUT /api/v1/llm/admin/providers/:id — 更新提供商
router.put('/admin/providers/:id', (req: Request, res: Response) => {
  try {
    const { name, apiUrl, modelName, apiKey, isActive, sortOrder } = req.body;
    const provider = llmService.updateProvider(req.params.id, {
      name, apiUrl, modelName, apiKey, isActive, sortOrder,
    });
    if (!provider) { error(res, '提供商不存在', 404); return; }
    success(res, provider);
  } catch (err: any) {
    error(res, err.message);
  }
});

// PUT /api/v1/llm/admin/providers/:id/toggle — 切换启用/禁用
router.put('/admin/providers/:id/toggle', (req: Request, res: Response) => {
  try {
    const provider = llmService.toggleProvider(req.params.id);
    if (!provider) { error(res, '提供商不存在', 404); return; }
    success(res, provider);
  } catch (err: any) {
    error(res, err.message);
  }
});

// DELETE /api/v1/llm/admin/providers/:id — 删除提供商
router.delete('/admin/providers/:id', (req: Request, res: Response) => {
  try {
    const deleted = llmService.deleteProvider(req.params.id);
    if (!deleted) { error(res, '提供商不存在', 404); return; }
    success(res, { message: '已删除' });
  } catch (err: any) {
    error(res, err.message);
  }
});

export { router as llmRoutes };
