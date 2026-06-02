import { FOODS_DATABASE, FoodItem, NutritionInfo, searchFoods } from '../store/foodDatabase';
import { api } from './api';
import { detectRegion } from '../config/env';
import { logger } from '../utils/logger';

interface IdentifiedFood {
  name: string;
  nameEn: string;
  confidence: number;
  quantity: number;
  estimatedCalories?: number;
  estimatedProtein?: number;
  estimatedFat?: number;
  estimatedCarbs?: number;
}

export interface RecognitionResult {
  food: FoodItem;
  confidence: number;
  needsConfirmation: boolean;
  alternatives?: FoodItem[];
}

export interface RecognitionResponse {
  results: RecognitionResult[];
  timestamp: number;
  totalCalories: number;
  totalNutrition: NutritionInfo;
  source: 'qwen' | 'openai' | 'baidu' | 'text' | 'empty';
}

class FoodRecognitionEngine {
  private readonly CONFIDENCE_THRESHOLD = 0.75;
  private readonly SOURCE_WEIGHTS = { baidu: 0.45, qwen: 0.40, openai: 0.15 } as const;

  async recognizeFood(
    imageData: string,
    userInput?: string,
  ): Promise<RecognitionResponse> {
    if (userInput && userInput.trim().length > 0) {
      return this.recognizeFromText(userInput);
    }

    const base64Image = await this.resolveBase64(imageData);

    // 通过后端代理调用图片识别
    const visionResults = await this.callBackendVision(base64Image);

    if (visionResults.length === 0) {
      return this.getEmptyResponse();
    }

    return this.buildUnifiedResponse(visionResults);
  }

  /** 通过后端代理调用所有可用的视觉识别提供商 */
  private async callBackendVision(
    base64Image: string,
  ): Promise<{ food: IdentifiedFood; source: 'baidu' | 'qwen' | 'openai' }[]> {
    const region = detectRegion();
    const rawBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

    try {
      // 获取该区域活跃的视觉识别提供商
      const providersRes = await api.llm.getProviders(region);
      if (!providersRes.success || !providersRes.data) return [];

      // 筛选视觉类提供商（qwen-vl, baidu-vision, gpt-4o）
      const visionProviders = providersRes.data.filter((p: any) =>
        ['qwen-vl', 'baidu-vision', 'gpt-4o-mini', 'gpt-4o'].includes(p.provider_key),
      );

      const tasks = visionProviders.map(async (provider: any) => {
        try {
          const res = await api.llm.vision({
            providerKey: provider.provider_key,
            imageBase64: rawBase64,
          });
          if (!res.success || !res.data?.result) return null;

          return this.parseVisionResult(res.data.result, provider.provider_key);
        } catch {
          return null;
        }
      });

      const results = await Promise.all(tasks);
      const all: { food: IdentifiedFood; source: 'baidu' | 'qwen' | 'openai' }[] = [];

      for (const r of results) {
        if (r) {
          for (const food of r) {
            all.push({ food, source: r.source });
          }
        }
      }

      return all;
    } catch {
      return [];
    }
  }

  private parseVisionResult(
    result: any,
    providerKey: string,
  ): { foods: IdentifiedFood[]; source: 'baidu' | 'qwen' | 'openai' } | null {
    const sourceMap: Record<string, 'baidu' | 'qwen' | 'openai'> = {
      'baidu-vision': 'baidu',
      'qwen-vl': 'qwen',
      'gpt-4o-mini': 'openai',
      'gpt-4o': 'openai',
    };

    const source = sourceMap[providerKey] || 'openai';

    // 尝试从 choices 中提取结构化内容
    const choices = result?.choices;
    if (choices?.[0]?.message?.content) {
      const content = choices[0].message.content;
      const jsonStr = content.replace(/```json\s*|\s*```/g, '').trim();
      try {
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
          return {
            foods: parsed.map((f: any) => ({
              name: f.name || '',
              nameEn: f.nameEn || '',
              confidence: f.confidence ?? 0.5,
              quantity: f.quantity ?? 200,
              estimatedCalories: f.calories,
              estimatedProtein: f.protein,
              estimatedFat: f.fat,
              estimatedCarbs: f.carbs,
            })),
            source,
          };
        }
      } catch {}
    }

    // 处理百度格式
    if (result?.baiduRaw?.result) {
      return {
        foods: result.baiduRaw.result.map((r: any) => ({
          name: r.name,
          nameEn: '',
          confidence: r.probability ?? 0.5,
          quantity: 200,
          estimatedCalories: r.calories ? Number(r.calories) : undefined,
        })),
        source: 'baidu',
      };
    }

    return null;
  }

  private buildUnifiedResponse(
    candidates: { food: IdentifiedFood; source: 'baidu' | 'qwen' | 'openai' }[],
  ): RecognitionResponse {
    const matchScores = new Map<string, { food: FoodItem; score: number; rawConfidence: number; source: string }>();

    for (const { food: identified, source } of candidates) {
      const matches = this.matchFoodInDatabase(identified.name, identified.nameEn);
      const weight = this.SOURCE_WEIGHTS[source];
      const score = identified.confidence * weight;

      if (matches.length > 0) {
        for (const match of matches) {
          const existing = matchScores.get(match.id);
          if (!existing || score > existing.score) {
            matchScores.set(match.id, {
              food: match,
              score,
              rawConfidence: identified.confidence,
              source,
            });
          }
        }
      }
    }

    if (matchScores.size === 0) {
      const best = candidates.reduce((a, b) =>
        a.food.confidence > b.food.confidence ? a : b,
      );
      const synthetic: FoodItem = {
        id: `api-${Date.now()}`,
        name: best.food.name,
        nameEn: best.food.nameEn,
        icon: '🍽️',
        category: 'other',
        nutrition: {
          calories: best.food.estimatedCalories ?? 300,
          protein: best.food.estimatedProtein ?? 0,
          fat: best.food.estimatedFat ?? 0,
          carbs: best.food.estimatedCarbs ?? 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
        },
        servingSize: { default: best.food.quantity ?? 200, description: '一份' },
        ai: { confidence: best.food.confidence, keywords: [best.food.name] },
      };
      return {
        results: [
          {
            food: synthetic,
            confidence: Math.round(best.food.confidence * 100) / 100,
            needsConfirmation: true,
          },
        ],
        timestamp: Date.now(),
        totalCalories: Math.round((synthetic.nutrition.calories * synthetic.servingSize.default) / 100),
        totalNutrition: synthetic.nutrition,
        source: best.source,
      };
    }

    const sorted = Array.from(matchScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const bestScore = sorted[0].score;
    const dominant = sorted.length > 1 && sorted[0].score > sorted[1].score * 1.8;
    const topResults = dominant ? sorted.slice(0, 1) : sorted;

    const results: RecognitionResult[] = topResults.map(m => ({
      food: m.food,
      confidence: Math.round(m.rawConfidence * 100) / 100,
      needsConfirmation: m.rawConfidence < this.CONFIDENCE_THRESHOLD,
      alternatives:
        m.rawConfidence < this.CONFIDENCE_THRESHOLD
          ? this.getAlternatives(m.food)
          : undefined,
    }));

    const totalNutrition = this.calculateTotalNutrition(results.map(r => r.food));
    const totalCalories = results.reduce(
      (sum, r) => sum + (r.food.nutrition.calories * r.food.servingSize.default) / 100,
      0,
    );

    return {
      results,
      timestamp: Date.now(),
      totalCalories: Math.round(totalCalories),
      totalNutrition,
      source: sorted[0].source as RecognitionResponse['source'],
    };
  }

  private async resolveBase64(imageData: string): Promise<string> {
    if (imageData.startsWith('data:')) return imageData;
    if (imageData.startsWith('file://') || imageData.startsWith('http')) {
      const blob = await (await fetch(imageData)).blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
    return `data:image/jpeg;base64,${imageData}`;
  }

  // ── Database matching ──

  private matchFoodInDatabase(name: string, _nameEn: string): FoodItem[] {
    const exactMatch = FOODS_DATABASE.filter(
      f => f.name.toLowerCase() === name.toLowerCase(),
    );
    if (exactMatch.length > 0) return exactMatch;

    const keywordExact = FOODS_DATABASE.filter(f =>
      f.ai.keywords.some(k => k.toLowerCase() === name.toLowerCase()),
    );
    if (keywordExact.length > 0) return keywordExact;

    const nameContains = FOODS_DATABASE
      .filter(food => {
        const foodName = food.name.toLowerCase();
        return foodName.includes(name.toLowerCase()) && foodName.length > name.length;
      })
      .sort((a, b) => b.name.length - a.name.length);
    if (nameContains.length > 0) return nameContains.slice(0, 3);

    const fuzzyMatches = FOODS_DATABASE
      .map(food => ({
        food,
        sim: this.calculateSimilarity(name.toLowerCase(), food.name.toLowerCase()),
      }))
      .filter(m => m.sim > 0.65)
      .sort((a, b) => b.sim - a.sim);
    if (fuzzyMatches.length > 0) return fuzzyMatches.slice(0, 3).map(m => m.food);

    return [];
  }

  private recognizeFromText(userInput: string): RecognitionResponse {
    let foods = searchFoods(userInput);
    if (foods.length === 0) foods = this.fuzzyMatch(userInput);
    if (foods.length === 0) return this.getEmptyResponse();

    const results = foods.slice(0, 5).map(food => ({
      food,
      confidence: food.ai.confidence,
      needsConfirmation: food.ai.confidence < this.CONFIDENCE_THRESHOLD,
      alternatives: food.ai.confidence < this.CONFIDENCE_THRESHOLD ? this.getAlternatives(food) : undefined,
    }));

    return {
      results,
      timestamp: Date.now(),
      totalCalories: Math.round(results.reduce((s, r) => s + r.food.nutrition.calories * r.food.servingSize.default / 100, 0)),
      totalNutrition: this.calculateTotalNutrition(results.map(r => r.food)),
      source: 'text',
    };
  }

  private getEmptyResponse(): RecognitionResponse {
    return {
      results: [], timestamp: Date.now(), totalCalories: 0,
      totalNutrition: { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sugar: 0, sodium: 0 },
      source: 'empty',
    };
  }

  private fuzzyMatch(input: string): FoodItem[] {
    const normalizedInput = this.normalizeText(input);
    const inputWords = normalizedInput.split(/\s+/);
    return FOODS_DATABASE.map(food => {
      const keywords = [food.name, food.nameEn, ...food.ai.keywords].map(k => this.normalizeText(k));
      let score = 0;
      for (const word of inputWords) {
        for (const kw of keywords) {
          if (kw.includes(word) || word.includes(kw)) score += 1;
          const sim = this.calculateSimilarity(word, kw);
          if (sim > 0.6) score += sim;
        }
      }
      return { food, score };
    }).filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 10).map(s => s.food);
  }

  private normalizeText(text: string): string {
    return text.toLowerCase().replace(/[^\w一-龥]/g, '').trim();
  }

  private calculateSimilarity(a: string, b: string): number {
    const longer = a.length >= b.length ? a : b;
    const shorter = a.length >= b.length ? b : a;
    if (longer.length === 0) return 1.0;
    const costs: number[] = [];
    for (let i = 0; i <= a.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= b.length; j++) {
        if (i === 0) costs[j] = j;
        else if (j > 0) {
          let newValue = costs[j - 1] + 1;
          if (a[i - 1] !== b[j - 1]) newValue = Math.min(Math.min(newValue, lastValue + 1), costs[j] + 1);
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[b.length] = lastValue;
    }
    return (longer.length - costs[shorter.length]) / longer.length;
  }

  private getAlternatives(food: FoodItem): FoodItem[] {
    return FOODS_DATABASE.filter(f => f.category === food.category && f.id !== food.id).slice(0, 3);
  }

  private calculateTotalNutrition(foods: FoodItem[]): NutritionInfo {
    const total: NutritionInfo = { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sugar: 0, sodium: 0 };
    for (const f of foods) {
      const m = f.servingSize.default / 100;
      total.calories += f.nutrition.calories * m;
      total.protein += f.nutrition.protein * m;
      total.fat += f.nutrition.fat * m;
      total.carbs += f.nutrition.carbs * m;
      total.fiber += f.nutrition.fiber * m;
      total.sugar += f.nutrition.sugar * m;
      total.sodium += f.nutrition.sodium * m;
      if (f.nutrition.cholesterol) total.cholesterol = (total.cholesterol || 0) + f.nutrition.cholesterol * m;
    }
    return total;
  }

  calculateMealNutrition(foods: { food: FoodItem; amount: number }[]): NutritionInfo {
    const total: NutritionInfo = { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sugar: 0, sodium: 0 };
    for (const { food, amount } of foods) {
      const m = amount / 100;
      total.calories += food.nutrition.calories * m;
      total.protein += food.nutrition.protein * m;
      total.fat += food.nutrition.fat * m;
      total.carbs += food.nutrition.carbs * m;
      total.fiber += food.nutrition.fiber * m;
      total.sugar += food.nutrition.sugar * m;
      total.sodium += food.nutrition.sodium * m;
      if (food.nutrition.cholesterol) total.cholesterol = (total.cholesterol || 0) + food.nutrition.cholesterol * m;
    }
    return total;
  }

  provideFeedback(recognizedFood: FoodItem, actualFoodId: string): void {
    const actual = FOODS_DATABASE.find(f => f.id === actualFoodId);
    if (actual) console.log(`纠正反馈: ${recognizedFood.name} -> ${actual.name}`);
  }
}

export const foodRecognitionEngine = new FoodRecognitionEngine();
