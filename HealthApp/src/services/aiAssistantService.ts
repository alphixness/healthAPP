import { api } from './api';
import { detectRegion } from '../config/env';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface UserContext {
  goal: string;
  activityLevel: string;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

export interface UsageInfo {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface SendMessageResult {
  content: string;
  usage: UsageInfo | null;
}

/** 获取当前区域的 AI 提供商 */
async function getProviderKey(): Promise<string> {
  try {
    const region = detectRegion();
    const res = await api.llm.getProviders(region);
    if (res.success && res.data && res.data.length > 0) {
      return res.data[0].provider_key;
    }
  } catch {}
  return 'deepseek-chat';
}

function buildSystemPrompt(ctx: UserContext | null): string {
  const base = `你是一个专业的AI健康助手，名叫"健康小助手"。用中文回答，语气友好专业。

回答原则：
- 给出具体可行的建议，不要泛泛而谈
- 涉及饮食建议时，结合常见的中国食物
- 涉及运动建议时，考虑不同运动水平的用户
- 回答简洁清晰，适当使用分段
- 如果不确定，如实告知，不要编造信息
- 回答控制在200字以内

常见食物营养参考（每100g）：
- 主食：米饭116千卡/3g蛋白，馒头223千卡/7g蛋白，全麦面包247千卡/13g蛋白，燕麦389千卡/17g蛋白
- 蔬菜：西兰花34千卡/3g蛋白，菠菜23千卡/3g蛋白，白菜17千卡/2g蛋白，胡萝卜41千卡/1g蛋白，番茄18千卡/1g蛋白
- 肉类：鸡胸肉167千卡/31g蛋白，瘦牛肉250千卡/26g蛋白，猪瘦肉335千卡/27g蛋白，鱼肉约150千卡/25g蛋白
- 蛋奶：鸡蛋(个) ~76千卡/7g蛋白，牛奶(杯) ~120千卡/8g蛋白，豆腐 ~81千卡/8g蛋白
- 水果：苹果 ~53千卡，香蕉 ~89千卡，橙子 ~47千卡，葡萄 ~69千卡
- 坚果：核桃 ~673千卡，杏仁 ~579千卡，花生 ~567千卡（高热量，每次一小把）
- 运动消耗（30分钟）：跑步~300千卡，游泳~250千卡，快走~150千卡，骑车~200千卡，瑜伽~120千卡
- 减脂推荐：优先鸡胸肉、鱼虾、绿叶蔬菜；避免油炸食品和含糖饮料
- 增肌推荐：高蛋白食物+力量训练，蛋白质摄入每kg体重1.6-2.2g`;

  if (!ctx) {
    return `${base}

注意：用户尚未设置个人信息，建议在适当的时候邀请用户完成个人设置以获得个性化建议。`;
  }

  const remainingCalories = ctx.targetCalories - ctx.dailyCalories;
  const remainingProtein = ctx.targetProtein - ctx.dailyProtein;
  const remainingCarbs = ctx.targetCarbs - ctx.dailyCarbs;
  const remainingFat = ctx.targetFat - ctx.dailyFat;

  const goalLabels: Record<string, string> = {
    lose: '减脂',
    maintain: '维持体重',
    gain: '增肌',
  };

  return `${base}

## 用户当前信息
- 健康目标：${goalLabels[ctx.goal] || ctx.goal}
- 活动水平：${ctx.activityLevel}
- 今日已摄入：${Math.round(ctx.dailyCalories)}千卡（目标${ctx.targetCalories}千卡）
- 剩余预算：热量${Math.round(remainingCalories)}千卡 / 蛋白质${Math.round(remainingProtein)}g / 碳水${Math.round(remainingCarbs)}g / 脂肪${Math.round(remainingFat)}g

根据以上信息提供个性化建议。例如如果剩余预算少，推荐清淡饮食；如果蛋白质不足，推荐高蛋白食物。`;
}

export async function sendMessage(
  text: string,
  history: Message[],
  userContext: UserContext | null,
): Promise<SendMessageResult> {
  const systemPrompt = buildSystemPrompt(userContext);

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-20),
    { role: 'user', content: text },
  ];

  const providerKey = await getProviderKey();

  try {
    const res = await api.llm.chat({ providerKey, messages });

    if (!res.success) {
      return { content: `😅 ${res.error || 'AI服务暂时不可用'}`, usage: null };
    }

    const result = res.data?.result;
    const content = result?.choices?.[0]?.message?.content;
    if (!content) {
      return { content: '😅 我没有理解你的问题，能换一种说法吗？', usage: null };
    }

    const usage = result?.usage
      ? {
          promptTokens: result.usage.prompt_tokens ?? 0,
          completionTokens: result.usage.completion_tokens ?? 0,
          totalTokens: result.usage.total_tokens ?? 0,
        }
      : null;

    return { content: content.trim(), usage };
  } catch (error: unknown) {
    if (error instanceof TypeError && error.message.includes('Network')) {
      return { content: '😅 网络开小差了，请检查网络连接后重试。', usage: null };
    }
    return { content: '😅 抱歉，我暂时无法回答，请稍后再试。', usage: null };
  }
}
