import { api } from './api';
import { detectRegion } from '../config/env';
import type { User } from '../store/nutritionStore';

export interface AiRecipe {
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: number;
  reason: string;
}

export interface AiExercise {
  name: string;
  type: string;
  duration: number;
  caloriesBurned: number;
  reason: string;
}

export interface AiRecommendation {
  recipes: AiRecipe[];
  exercise: AiExercise;
  disclaimer: string;
  needsMoreInfo?: boolean;
  missingFields?: string[];
}

const activityLabels: Record<string, string> = {
  sedentary: '久坐不动',
  light: '轻度活动',
  moderate: '中等运动',
  active: '积极运动',
  very_active: '高强度运动',
};

const goalLabels: Record<string, string> = {
  lose: '减脂',
  maintain: '维持体重',
  gain: '增肌',
};

const dietaryLabels: Record<string, string> = {
  omnivore: '均衡饮食',
  vegetarian: '蛋奶素',
  vegan: '纯素',
  keto: '生酮饮食',
  paleo: '原始饮食',
};

const freqLabels: Record<string, string> = {
  never: '几乎不运动',
  rarely: '偶尔运动',
  sometimes: '每周1-2次',
  often: '每周3-4次',
  daily: '每天运动',
};

/** 构建个性化推荐的 AI prompt */
function buildPrompt(user: User, consumed: { calories: number; protein: number; carbs: number; fat: number }): string {
  const hasMinimalData = user.age && user.weight && user.height && user.gender && user.goal && user.activityLevel;
  const missing: string[] = [];
  if (!user.age) missing.push('年龄');
  if (!user.weight) missing.push('体重');
  if (!user.height) missing.push('身高');
  if (!user.gender) missing.push('性别');
  if (!user.goal) missing.push('健康目标');
  if (!user.activityLevel) missing.push('活动水平');

  return `你是一个专业的AI健康顾问。根据用户的个人信息和今日饮食情况，推荐最适合的食谱和运动方案。

## 用户信息
- 年龄：${user.age}岁
- 性别：${user.gender === 'male' ? '男' : '女'}
- 身高：${user.height}cm
- 体重：${user.weight}kg
- 健康目标：${goalLabels[user.goal] || user.goal}
- 活动水平：${activityLabels[user.activityLevel] || user.activityLevel}
${user.healthProfile ? `
## 健康问卷信息
- 饮食偏好：${dietaryLabels[user.healthProfile.dietaryPreference] || user.healthProfile.dietaryPreference}
- 过敏食物：${user.healthProfile.allergies.length ? user.healthProfile.allergies.join('、') : '无'}
- 健康状况：${user.healthProfile.healthConditions.length ? user.healthProfile.healthConditions.join('、') : '无特殊状况'}
- 运动频率：${freqLabels[user.healthProfile.exerciseFrequency] || user.healthProfile.exerciseFrequency}
- 喜欢的运动：${user.healthProfile.exerciseTypes.length ? user.healthProfile.exerciseTypes.join('、') : '未选择'}
- 烹饪水平：${user.healthProfile.cookingAbility === 'beginner' ? '厨房新手' : user.healthProfile.cookingAbility === 'intermediate' ? '一般水平' : '厨艺达人'}
- 备餐时间：${user.healthProfile.mealPrepTime === 'quick' ? '快速(15分钟内)' : user.healthProfile.mealPrepTime === 'moderate' ? '适中(15-30分钟)' : '不介意时长'}
` : ''}
## 今日已摄入
- 热量：${Math.round(consumed.calories)}千卡
- 蛋白质：${Math.round(consumed.protein)}g
- 碳水：${Math.round(consumed.carbs)}g
- 脂肪：${Math.round(consumed.fat)}g

## 安全要求（必须遵守）
1. **免责声明**：生成一段中文免责声明，提醒用户根据自身身体状况量力而行，如有慢性疾病或健康问题应咨询医生
2. **运动安全**：运动推荐必须考虑用户年龄和活动水平，避免推荐超出用户体能的高强度运动；推荐中要提示"请根据自身情况调整强度"
3. **饮食安全**：不得推荐极端节食或营养严重不均衡的食谱
4. **数据不足处理**：如果用户个人数据不足以做出安全推荐（缺少关键信息），将 needsMoreInfo 设为 true，并在 missingFields 中列出需要补充的信息

## 要求
请返回严格的 JSON 格式（不要包含 markdown 代码块标记），包含以下字段：
{
  "recipes": [
    {
      "name": "菜名",
      "category": "breakfast | lunch | dinner",
      "calories": 热量数值,
      "protein": 蛋白质克数,
      "carbs": 碳水克数,
      "fat": 脂肪克数,
      "prepTime": 制作分钟数,
      "reason": "为什么推荐这道菜（基于用户数据的个性化理由）"
    }
  ],
  "exercise": {
    "name": "运动名称",
    "type": "cardio | strength | flexibility | hiit",
    "duration": 运动分钟数,
    "caloriesBurned": 预估消耗千卡,
    "reason": "为什么推荐这个运动（包含安全提示）"
  },
  "disclaimer": "免责声明文字",
  "needsMoreInfo": false,
  "missingFields": []
}

推荐 3 道食谱（覆盖不同类别）和 1 个运动方案。
食谱要结合用户目标：减脂则低卡高蛋白，增肌则高蛋白适中热量，维持则均衡营养。
运动方案要结合用户活动水平和今日摄入情况，且必须包含安全提醒。`;
}

/** 清洗 AI 返回的原始数据，确保字段类型正确 */
function normalizeRecommendation(raw: any): AiRecommendation {
  const recipes: AiRecipe[] = (raw.recipes || []).map((r: any) => ({
    name: String(r.name || ''),
    category: ['breakfast', 'lunch', 'dinner'].includes(r.category) ? r.category : 'lunch',
    calories: parseInt(String(r.calories), 10) || 0,
    protein: parseInt(String(r.protein), 10) || 0,
    carbs: parseInt(String(r.carbs), 10) || 0,
    fat: parseInt(String(r.fat), 10) || 0,
    prepTime: parseInt(String(r.prepTime), 10) || 15,
    reason: String(r.reason || ''),
  }));

  const ex = raw.exercise || {};
  const exercise: AiExercise = {
    name: String(ex.name || ''),
    type: String(ex.type || 'cardio'),
    duration: parseInt(String(ex.duration), 10) || 20,
    caloriesBurned: parseInt(String(ex.caloriesBurned), 10) || 0,
    reason: String(ex.reason || ''),
  };

  return {
    recipes,
    exercise,
    disclaimer: String(raw.disclaimer || ''),
    needsMoreInfo: !!raw.needsMoreInfo,
    missingFields: Array.isArray(raw.missingFields) ? raw.missingFields : [],
  };
}

let cache: { data: AiRecommendation; ttl: number } | null = null;

/** 获取 AI 个性化推荐（带简单缓存，5分钟内不重复请求） */
export async function getAiRecommendations(
  user: User,
  consumed: { calories: number; protein: number; carbs: number; fat: number },
): Promise<AiRecommendation | null> {
  if (cache && Date.now() < cache.ttl) {
    return cache.data;
  }

  try {
    const region = detectRegion();
    const providersRes = await api.llm.getProviders(region);
    const providerKey =
      providersRes.success && providersRes.data?.length
        ? providersRes.data[0].provider_key
        : 'deepseek-chat';

    const prompt = buildPrompt(user, consumed);
    const res = await api.llm.chat({
      providerKey,
      messages: [
        { role: 'system', content: '你是一个专业的AI健康顾问，注重安全性和个性化。始终返回严格的JSON格式，不含markdown代码块标记。运动推荐必须包含安全提醒，饮食推荐要均衡健康。' },
        { role: 'user', content: prompt },
      ],
    });

    if (!res.success || !res.data?.result) return null;

    const content: string = res.data.result.choices?.[0]?.message?.content;
    if (!content) return null;

    // 清理可能的 markdown 代码块
    const cleaned = content.replace(/```(?:json)?\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.recipes?.length || !parsed.exercise) return null;

    const normalized = normalizeRecommendation(parsed);
    cache = { data: normalized, ttl: Date.now() + 5 * 60 * 1000 };
    return normalized;
  } catch {
    return null;
  }
}

/** 清除推荐缓存 */
export function clearRecommendationCache() {
  cache = null;
}
