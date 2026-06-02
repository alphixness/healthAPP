import { getDb } from '../config/database';
import { generateId } from '../utils/uuid';
import { logger } from '../utils/logger';

export interface LlmProvider {
  id: string;
  name: string;
  provider_key: string;
  api_url: string;
  model_name: string;
  api_key: string;
  region: 'china' | 'global';
  is_active: number;
  sort_order: number;
}

/** 获取指定区域活跃的 LLM 提供商 */
export function getActiveProviders(region?: 'china' | 'global'): LlmProvider[] {
  const db = getDb();
  const conditions: string[] = ['is_active = 1'];
  const params: any[] = [];

  if (region) {
    conditions.push('region = ?');
    params.push(region);
  }

  return db.prepare(
    `SELECT * FROM llm_providers WHERE ${conditions.join(' AND ')} ORDER BY sort_order ASC`,
  ).all(...params) as LlmProvider[];
}

/** 获取所有 LLM 提供商（管理用） */
export function getAllProviders(): LlmProvider[] {
  const db = getDb();
  return db.prepare('SELECT * FROM llm_providers ORDER BY region, sort_order ASC').all() as LlmProvider[];
}

/** 获取单个提供商 */
export function getProvider(id: string): LlmProvider | null {
  const db = getDb();
  const provider = db.prepare('SELECT * FROM llm_providers WHERE id = ?').get(id) as LlmProvider | undefined;
  return provider || null;
}

/** 管理：新增提供商 */
export function createProvider(data: {
  name: string;
  providerKey: string;
  apiUrl: string;
  modelName: string;
  apiKey: string;
  region: 'china' | 'global';
  sortOrder?: number;
}): LlmProvider {
  const db = getDb();
  const id = generateId();

  db.prepare(`
    INSERT INTO llm_providers (id, name, provider_key, api_url, model_name, api_key, region, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.name, data.providerKey, data.apiUrl, data.modelName,
    data.apiKey, data.region, data.sortOrder || 0);

  return db.prepare('SELECT * FROM llm_providers WHERE id = ?').get(id) as LlmProvider;
}

/** 管理：更新提供商 */
export function updateProvider(id: string, data: Partial<{
  name: string;
  apiUrl: string;
  modelName: string;
  apiKey: string;
  isActive: number;
  sortOrder: number;
}>): LlmProvider | null {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM llm_providers WHERE id = ?').get(id) as LlmProvider | undefined;
  if (!existing) return null;

  const fields: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.apiUrl !== undefined) { fields.push('api_url = ?'); values.push(data.apiUrl); }
  if (data.modelName !== undefined) { fields.push('model_name = ?'); values.push(data.modelName); }
  if (data.apiKey !== undefined) { fields.push('api_key = ?'); values.push(data.apiKey); }
  if (data.isActive !== undefined) { fields.push('is_active = ?'); values.push(data.isActive); }
  if (data.sortOrder !== undefined) { fields.push('sort_order = ?'); values.push(data.sortOrder); }

  if (fields.length === 0) return existing;

  fields.push("updated_at = datetime('now')");
  values.push(id);

  db.prepare(`UPDATE llm_providers SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return db.prepare('SELECT * FROM llm_providers WHERE id = ?').get(id) as LlmProvider;
}

/** 管理：切换启用/禁用 */
export function toggleProvider(id: string): LlmProvider | null {
  const db = getDb();
  const provider = db.prepare('SELECT * FROM llm_providers WHERE id = ?').get(id) as LlmProvider | undefined;
  if (!provider) return null;

  db.prepare('UPDATE llm_providers SET is_active = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run(provider.is_active ? 0 : 1, id);

  return db.prepare('SELECT * FROM llm_providers WHERE id = ?').get(id) as LlmProvider;
}

/** 管理：删除提供商 */
export function deleteProvider(id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM llm_providers WHERE id = ?').run(id);
  return result.changes > 0;
}

// ===== AI 代理调用 =====

/** 通过后端代理调用 LLM Chat Completion */
export async function proxyChatCompletion(
  providerKey: string,
  body: { messages: { role: string; content: string }[]; stream?: boolean },
): Promise<any> {
  const db = getDb();
  const provider = db.prepare(
    'SELECT * FROM llm_providers WHERE provider_key = ? AND is_active = 1',
  ).get(providerKey) as LlmProvider | undefined;

  if (!provider) {
    throw new Error(`LLM 提供商 ${providerKey} 未找到或未启用`);
  }

  const { messages, stream } = body;

  if (providerKey === 'deepseek-chat') {
    const resp = await fetch(`${provider.api_url}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.api_key}`,
      },
      body: JSON.stringify({
        model: provider.model_name,
        messages,
        stream: stream ?? false,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      logger.error({ status: resp.status, response: text }, 'DeepSeek API error');
      throw new Error(`AI 服务调用失败: ${resp.status}`);
    }

    return resp.json();
  }

  if (providerKey === 'gpt-4o-mini' || providerKey === 'gpt-4o') {
    const resp = await fetch(`${provider.api_url}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.api_key}`,
      },
      body: JSON.stringify({
        model: provider.model_name,
        messages,
        stream: stream ?? false,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      logger.error({ status: resp.status, response: text }, 'OpenAI API error');
      throw new Error(`AI 服务调用失败: ${resp.status}`);
    }

    return resp.json();
  }

  if (providerKey === 'claude-sonnet') {
    // Convert OpenAI-style messages to Anthropic format
    const systemMsg = messages.find(m => m.role === 'system');
    const userMsgs = messages.filter(m => m.role !== 'system');

    const resp = await fetch(`${provider.api_url}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': provider.api_key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: provider.model_name,
        system: systemMsg?.content || undefined,
        messages: userMsgs.map(m => ({ role: m.role, content: m.content })),
        max_tokens: 4096,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      logger.error({ status: resp.status, response: text }, 'Claude API error');
      throw new Error(`AI 服务调用失败: ${resp.status}`);
    }

    return resp.json();
  }

  throw new Error(`不支持的 LLM 提供商: ${providerKey}`);
}

/** 通过后端代理调用图片识别 */
export async function proxyVisionRecognition(
  providerKey: string,
  imageBase64: string,
): Promise<any> {
  const db = getDb();
  const provider = db.prepare(
    'SELECT * FROM llm_providers WHERE provider_key = ? AND is_active = 1',
  ).get(providerKey) as LlmProvider | undefined;

  if (!provider) {
    throw new Error(`视觉识别提供商 ${providerKey} 未找到或未启用`);
  }

  if (providerKey === 'qwen-vl') {
    const resp = await fetch(`${provider.api_url}/compatible-mode/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.api_key}`,
      },
      body: JSON.stringify({
        model: provider.model_name,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: '请识别图片中的食物，返回食物名称、预估热量（千卡）和营养成分（蛋白质/碳水/脂肪克数），以 JSON 格式返回。' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            ],
          },
        ],
        max_tokens: 1024,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      logger.error({ status: resp.status, response: text }, 'Qwen Vision API error');
      throw new Error(`图片识别失败: ${resp.status}`);
    }

    const result = await resp.json();
    return result;
  }

  if (providerKey === 'baidu-vision') {
    // Baidu requires access token first
    const tokenResp = await fetch(
      `${provider.api_url}/oauth/2.0/token?grant_type=client_credentials&client_id=${provider.api_key}&client_secret=${provider.model_name}`,
      { method: 'POST' },
    );
    const tokenData = await tokenResp.json() as any;
    if (!tokenData.access_token) {
      throw new Error('百度 access_token 获取失败');
    }

    const resp = await fetch(
      `${provider.api_url}/rest/2.0/image-classify/v2/dish?access_token=${tokenData.access_token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ image: imageBase64, top_num: '3' }),
      },
    );

    if (!resp.ok) {
      const text = await resp.text();
      logger.error({ status: resp.status, response: text }, 'Baidu API error');
      throw new Error(`百度识别失败: ${resp.status}`);
    }

    const result = await resp.json();
    // Transform baidu result to standard format
    return {
      choices: [{
        message: {
          content: JSON.stringify({
            foodName: result.result?.[0]?.name || '未知食物',
            calories: 0,
            probability: result.result?.[0]?.probability || 0,
            baiduRaw: result,
          }),
        },
      }],
    };
  }

  // For OpenAI-compatible vision (GPT-4o, etc.)
  const resp = await fetch(`${provider.api_url}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.api_key}`,
    },
    body: JSON.stringify({
      model: provider.model_name,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: '请识别图片中的食物，返回食物名称、预估热量（千卡）和营养成分（蛋白质/碳水/脂肪克数），以 JSON 格式返回。' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          ],
        },
      ],
      max_tokens: 1024,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    logger.error({ status: resp.status, response: text }, 'Vision API error');
    throw new Error(`图片识别失败: ${resp.status}`);
  }

  return resp.json();
}
