import { ENV } from '../config/env';
import { logger } from '../utils/logger';

export interface WeeklyReportParams {
  weekStart: string;
  weekEnd: string;
  totalCalories: number;
  goalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  exerciseDays: number;
  totalExerciseCalories: number;
  totalExerciseDuration: number;
  streak: number;
  goal: string;
  activityLevel: string;
}

export interface WeeklyReport {
  score: number;
  summary: string;
  highlights: string[];
  recommendations: string[];
  generatedAt: string;
}

function buildPrompt(params: WeeklyReportParams): string {
  return `你是一个专业的健康营养助手。根据以下用户本周的健康数据，生成一份简洁的中文周报。

## 用户信息
- 健康目标：${params.goal === 'lose' ? '减脂' : params.goal === 'gain' ? '增肌' : '维持体重'}
- 活动水平：${params.activityLevel === 'sedentary' ? '久坐' : params.activityLevel === 'light' ? '轻度活动' : params.activityLevel === 'moderate' ? '中度活动' : params.activityLevel === 'active' ? '积极活动' : '高强度活动'}

## 本周数据 (${params.weekStart} - ${params.weekEnd})
- 摄入热量：${Math.round(params.totalCalories)} 千卡（目标：${Math.round(params.goalCalories)} 千卡）
- 蛋白质摄入：${Math.round(params.totalProtein)}g
- 碳水摄入：${Math.round(params.totalCarbs)}g
- 脂肪摄入：${Math.round(params.totalFat)}g
- 运动天数：${params.exerciseDays} 天
- 运动消耗：${Math.round(params.totalExerciseCalories)} 千卡
- 运动时长：${Math.round(params.totalExerciseDuration)} 分钟
- 连续达标天数：${params.streak} 天

## 输出格式（严格按以下 JSON 格式返回，不要包含其他文字）
{
  "score": 0-100的整数,
  "summary": "一段 100 字左右的总结",
  "highlights": ["亮点1", "亮点2", "亮点3"],
  "recommendations": ["建议1", "建议2", "建议3"]
}

评分标准：热量达标±10%内为满分基础，蛋白质充足加分，运动4天以上加分，连续达标加分。`;
}

function parseResponse(text: string): WeeklyReport | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const data = JSON.parse(jsonMatch[0]);
    if (typeof data.score !== 'number' || !data.summary || !Array.isArray(data.highlights) || !Array.isArray(data.recommendations)) {
      return null;
    }
    return {
      score: Math.max(0, Math.min(100, data.score)),
      summary: data.summary,
      highlights: data.highlights.slice(0, 3),
      recommendations: data.recommendations.slice(0, 3),
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function fallbackReport(params: WeeklyReportParams): WeeklyReport {
  const calorieRatio = params.totalCalories / params.goalCalories;
  const score = Math.round(
    60
    + (calorieRatio > 0.8 && calorieRatio < 1.2 ? 15 : 5)
    + Math.min(params.exerciseDays * 5, 15)
    + Math.min(params.streak * 2, 10)
  );

  const highlights: string[] = [];
  if (calorieRatio > 0.8 && calorieRatio < 1.2) {
    highlights.push('热量控制得当，接近目标值');
  }
  if (params.exerciseDays >= 4) {
    highlights.push(`本周运动 ${params.exerciseDays} 天，保持了良好的运动习惯`);
  }
  if (params.streak >= 3) {
    highlights.push(`连续 ${params.streak} 天保持健康记录`);
  }
  if (highlights.length === 0) {
    highlights.push('开始记录是变好的第一步，继续加油！');
  }

  const recommendations: string[] = [];
  if (calorieRatio > 1.2) {
    recommendations.push('本周热量摄入偏高，建议适当减少高热量食物');
  } else if (calorieRatio < 0.8) {
    recommendations.push('本周热量摄入偏低，注意保证基础营养需求');
  }
  if (params.exerciseDays < 3) {
    recommendations.push('建议增加运动频率，每周至少运动 3-4 次');
  }
  if (!params.totalProtein || params.totalProtein < params.goalCalories * 0.15 / 4) {
    recommendations.push('注意增加蛋白质摄入，帮助维持肌肉量');
  }
  if (recommendations.length === 0) {
    recommendations.push('本周各项指标良好，继续保持！');
  }

  let summary: string;
  if (score >= 80) {
    summary = `本周表现优秀！健康评分 ${score} 分。热量控制理想，运动习惯良好，希望下周继续保持这样的状态。`;
  } else if (score >= 60) {
    summary = `本周表现中等，健康评分 ${score} 分。部分指标还有提升空间，继续努力！`;
  } else {
    summary = `本周健康评分 ${score} 分，需要更多关注自己的健康状况。建议从饮食记录和适量运动开始逐步改善。`;
  }

  return { score, summary, highlights, recommendations, generatedAt: new Date().toISOString() };
}

export async function generateWeeklyReport(params: WeeklyReportParams): Promise<WeeklyReport> {
  const apiUrl = ENV.API_WORKER_URL;

  if (apiUrl) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${apiUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: '你是一个专业的健康营养助手，根据用户数据生成周报。' },
            { role: 'user', content: buildPrompt(params) },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      const parsed = parseResponse(text);
      if (parsed) return parsed;
    } catch (error) {
      logger.warn('AI report generation failed, using fallback:', error);
    }
  }

  return fallbackReport(params);
}
