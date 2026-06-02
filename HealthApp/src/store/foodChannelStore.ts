import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

export interface RecipeAuthor {
  id: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  followers: number;
  recipes: number;
}

export interface RecipeStep {
  step: number;
  description: string;
  tip?: string;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
}

export interface RecipePost {
  id: string;
  author: RecipeAuthor;
  title: string;
  coverEmoji: string;
  coverImage: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  cookTime: number;
  servings: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  stats: {
    likes: number;
    collections: number;
    comments: number;
    views: number;
  };
  isLiked: boolean;
  isCollected: boolean;
  isMemberOnly: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'foodChannelPosts';
const STORAGE_VERSION_KEY = 'foodChannelPosts_version';
const MOCK_DATA_VERSION = 3;

interface FoodChannelStore {
  posts: RecipePost[];
  categories: string[];
  selectedCategory: string;
  
  setCategory: (category: string) => void;
  toggleLike: (postId: string) => void;
  toggleCollect: (postId: string) => void;
  addPost: (post: RecipePost) => void;
  
  loadPosts: () => Promise<void>;
  savePosts: () => Promise<void>;
}

const MOCK_AUTHORS: RecipeAuthor[] = [
  { id: 'a1', name: '营养师小王', avatar: '👩‍🍳', isVerified: true, followers: 12500, recipes: 86 },
  { id: 'a2', name: '健身厨神', avatar: '👨‍🍳', isVerified: true, followers: 8900, recipes: 52 },
  { id: 'a3', name: '素食达人', avatar: '🥗', isVerified: false, followers: 3200, recipes: 38 },
  { id: 'a4', name: '减脂小姐姐', avatar: '💃', isVerified: true, followers: 15600, recipes: 120 },
  { id: 'a5', name: '家常菜大王', avatar: '🍳', isVerified: false, followers: 5400, recipes: 67 },
];

/** 直接为每个食谱分配对应的美食图片 */
function getRecipeImage(recipeId: string): string {
  const map: Record<string, string> = {
    p1: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop',
    p2: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop',
    p3: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop',
    p4: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
    p5: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop',
    p6: 'https://images.unsplash.com/photo-1488477181946-1ecf514d5514?w=600&h=400&fit=crop',
    p7: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&h=400&fit=crop',
    p8: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop',
    p9: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop',
    p10: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop',
    p11: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop',
    p12: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
    p13: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
    p14: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=600&h=400&fit=crop',
    p15: 'https://images.unsplash.com/photo-1551218808-6e3497da5374?w=600&h=400&fit=crop',
    p16: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop',
    p17: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
    p18: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop',
    p19: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop',
    p20: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
    p21: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=600&h=400&fit=crop',
    p22: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop',
    p23: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop',
    p24: 'https://images.unsplash.com/photo-1551218808-6e3497da5374?w=600&h=400&fit=crop',
    p25: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&h=400&fit=crop',
    p26: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&h=400&fit=crop',
    p27: 'https://images.unsplash.com/photo-1488477181946-1ecf514d5514?w=600&h=400&fit=crop',
    p28: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop',
    p29: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=600&h=400&fit=crop',
  };
  return map[recipeId] || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop';
}

const MOCK_POSTS: RecipePost[] = [
  {
    id: 'p1', author: MOCK_AUTHORS[3], title: '低卡鸡胸肉沙拉', coverEmoji: '🥗',
    coverImage: getRecipeImage('p1'),
    description: '高蛋白低脂肪的完美减脂餐，15分钟搞定！鸡胸肉嫩滑多汁，搭配新鲜蔬菜，营养均衡又美味。',
    category: '减脂餐', tags: ['减脂', '高蛋白', '低卡', '快手菜'], difficulty: 'easy',
    cookTime: 15, servings: 1,
    ingredients: [{ name: '鸡胸肉', amount: '150g' }, { name: '生菜', amount: '100g' }, { name: '小番茄', amount: '50g' }, { name: '黄瓜', amount: '50g' }, { name: '橄榄油', amount: '10ml' }, { name: '柠檬汁', amount: '5ml' }],
    steps: [{ step: 1, description: '鸡胸肉用盐和黑胡椒腌制10分钟', tip: '可以加少许料酒去腥' }, { step: 2, description: '平底锅中火煎鸡胸肉，每面3-4分钟至金黄' }, { step: 3, description: '蔬菜洗净切好，摆盘' }, { step: 4, description: '鸡胸肉切片，放在蔬菜上' }, { step: 5, description: '淋上橄榄油和柠檬汁即可', tip: '也可以用低脂沙拉酱替代' }],
    nutrition: { calories: 280, protein: 35, fat: 8, carbs: 12 },
    stats: { likes: 2340, collections: 1560, comments: 89, views: 15600 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-01-15',
  },
  {
    id: 'p2', author: MOCK_AUTHORS[0], title: '紫薯燕麦早餐碗', coverEmoji: '🥣',
    coverImage: getRecipeImage('p2'),
    description: '营养师推荐的完美早餐！紫薯富含花青素，燕麦提供持久能量，搭配坚果和酸奶，开启元气满满的一天。',
    category: '健康早餐', tags: ['早餐', '高纤维', '抗氧化', '快手菜'], difficulty: 'easy',
    cookTime: 10, servings: 1,
    ingredients: [{ name: '紫薯', amount: '100g' }, { name: '燕麦片', amount: '40g' }, { name: '酸奶', amount: '150ml' }, { name: '坚果', amount: '15g' }, { name: '蜂蜜', amount: '5ml' }],
    steps: [{ step: 1, description: '紫薯蒸熟，去皮压成泥' }, { step: 2, description: '燕麦片用热水泡3分钟' }, { step: 3, description: '碗中先放燕麦，再铺紫薯泥' }, { step: 4, description: '倒入酸奶，撒上坚果', tip: '坚果可以用杏仁、核桃或腰果' }, { step: 5, description: '淋上少许蜂蜜即可' }],
    nutrition: { calories: 320, protein: 12, fat: 10, carbs: 45 },
    stats: { likes: 1890, collections: 2340, comments: 156, views: 12300 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-01-14',
  },
  {
    id: 'p3', author: MOCK_AUTHORS[1], title: '增肌牛排配糙米', coverEmoji: '🥩',
    coverImage: getRecipeImage('p3'),
    description: '健身后黄金餐！优质蛋白+复合碳水，帮助肌肉恢复和生长。牛排煎至五分熟，口感最佳。',
    category: '增肌餐', tags: ['增肌', '高蛋白', '牛排', '力量训练后'], difficulty: 'medium',
    cookTime: 25, servings: 1,
    ingredients: [{ name: '牛排', amount: '200g' }, { name: '糙米', amount: '100g' }, { name: '西兰花', amount: '80g' }, { name: '橄榄油', amount: '10ml' }, { name: '黑胡椒', amount: '适量' }, { name: '海盐', amount: '适量' }],
    steps: [{ step: 1, description: '糙米提前浸泡2小时，煮熟备用' }, { step: 2, description: '牛排回温30分钟，用厨房纸擦干', tip: '回温是煎出好牛排的关键' }, { step: 3, description: '牛排两面撒盐和黑胡椒' }, { step: 4, description: '热锅加橄榄油，大火每面煎2-3分钟', tip: '不要频繁翻面' }, { step: 5, description: '牛排静置5分钟后切片' }, { step: 6, description: '西兰花焯水，与糙米和牛排一起摆盘' }],
    nutrition: { calories: 520, protein: 42, fat: 18, carbs: 48 },
    stats: { likes: 3200, collections: 2100, comments: 234, views: 18900 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-01-13',
  },
  {
    id: 'p4', author: MOCK_AUTHORS[2], title: '地中海烤蔬菜', coverEmoji: '🫑',
    coverImage: getRecipeImage('p4'),
    description: '素食者的最爱！彩椒、茄子、西葫芦搭配橄榄油和香草，简单烤制就能释放蔬菜的天然甜味。',
    category: '素食', tags: ['素食', '低卡', '地中海饮食', '烤箱菜'], difficulty: 'easy',
    cookTime: 30, servings: 2,
    ingredients: [{ name: '彩椒', amount: '1个' }, { name: '茄子', amount: '1根' }, { name: '西葫芦', amount: '1根' }, { name: '小番茄', amount: '100g' }, { name: '橄榄油', amount: '20ml' }, { name: '迷迭香', amount: '适量' }, { name: '海盐', amount: '适量' }],
    steps: [{ step: 1, description: '所有蔬菜洗净切块' }, { step: 2, description: '蔬菜放入烤盘，淋橄榄油，撒盐和迷迭香' }, { step: 3, description: '烤箱200°C预热', tip: '切均匀大小确保同时烤熟' }, { step: 4, description: '烤25-30分钟至蔬菜微焦' }, { step: 5, description: '取出即可享用' }],
    nutrition: { calories: 180, protein: 5, fat: 12, carbs: 16 },
    stats: { likes: 980, collections: 760, comments: 45, views: 6700 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-01-12',
  },
  {
    id: 'p5', author: MOCK_AUTHORS[4], title: '番茄鸡蛋面', coverEmoji: '🍜',
    coverImage: getRecipeImage('p5'),
    description: '经典家常面食，酸甜开胃！番茄炒出汁水，鸡蛋嫩滑，一碗下肚暖胃又满足。减脂期可以少放油。',
    category: '家常菜', tags: ['家常菜', '面食', '快手菜', '暖胃'], difficulty: 'easy',
    cookTime: 20, servings: 1,
    ingredients: [{ name: '挂面', amount: '100g' }, { name: '番茄', amount: '2个' }, { name: '鸡蛋', amount: '2个' }, { name: '葱花', amount: '适量' }, { name: '食用油', amount: '10ml' }, { name: '盐', amount: '适量' }],
    steps: [{ step: 1, description: '番茄切块，鸡蛋打散' }, { step: 2, description: '锅中热油，炒鸡蛋至凝固盛出' }, { step: 3, description: '同一锅中炒番茄至出汁', tip: '可以加一点糖提鲜' }, { step: 4, description: '加水烧开，放入面条' }, { step: 5, description: '面条煮至8成熟，放入炒蛋' }, { step: 6, description: '调味，撒葱花出锅' }],
    nutrition: { calories: 420, protein: 18, fat: 14, carbs: 52 },
    stats: { likes: 4560, collections: 3200, comments: 312, views: 28900 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-01-11',
  },
  {
    id: 'p6', author: MOCK_AUTHORS[3], title: '酸奶水果杯', coverEmoji: '🍓',
    coverImage: getRecipeImage('p6'),
    description: '减脂期最佳甜品替代！用希腊酸奶代替奶油，搭配新鲜水果和格兰诺拉麦片，满足甜食欲望又不会长胖。',
    category: '减脂餐', tags: ['减脂', '甜品替代', '低卡', '酸奶'], difficulty: 'easy',
    cookTime: 5, servings: 1,
    ingredients: [{ name: '希腊酸奶', amount: '200g' }, { name: '草莓', amount: '50g' }, { name: '蓝莓', amount: '30g' }, { name: '格兰诺拉麦片', amount: '20g' }, { name: '蜂蜜', amount: '5ml' }],
    steps: [{ step: 1, description: '水果洗净切小块' }, { step: 2, description: '杯中先倒一层酸奶' }, { step: 3, description: '铺一层水果' }, { step: 4, description: '再倒酸奶，重复分层', tip: '透明杯子效果更好看' }, { step: 5, description: '顶部撒麦片，淋蜂蜜' }],
    nutrition: { calories: 220, protein: 15, fat: 6, carbs: 28 },
    stats: { likes: 1670, collections: 1230, comments: 67, views: 9800 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-01-10',
  },
  // ===== 新增减脂餐 =====
  {
    id: 'p7', author: MOCK_AUTHORS[3], title: '凉拌鸡丝荞麦面', coverEmoji: '🍝',
    coverImage: getRecipeImage('p7'),
    description: '减脂期必备凉面！荞麦面低升糖指数，鸡丝高蛋白低脂肪，配上爽脆黄瓜丝，夏日清爽一餐。',
    category: '减脂餐', tags: ['减脂', '低卡', '凉面', '高蛋白'], difficulty: 'easy',
    cookTime: 20, servings: 1,
    ingredients: [{ name: '荞麦面', amount: '100g' }, { name: '鸡胸肉', amount: '100g' }, { name: '黄瓜', amount: '1根' }, { name: '芝麻酱', amount: '1汤匙' }, { name: '生抽', amount: '1汤匙' }, { name: '醋', amount: '1汤匙' }],
    steps: [{ step: 1, description: '鸡胸肉煮熟放凉撕成丝' }, { step: 2, description: '荞麦面煮熟过凉水' }, { step: 3, description: '黄瓜切丝' }, { step: 4, description: '芝麻酱、生抽、醋调成酱汁' }, { step: 5, description: '面、鸡丝、黄瓜拌匀浇酱汁' }],
    nutrition: { calories: 350, protein: 30, fat: 10, carbs: 40 },
    stats: { likes: 2100, collections: 1800, comments: 120, views: 16500 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-02-01',
  },
  {
    id: 'p8', author: MOCK_AUTHORS[0], title: '南瓜浓汤', coverEmoji: '🎃',
    coverImage: getRecipeImage('p8'),
    description: '暖胃低卡的南瓜浓汤，无奶油版。南瓜天然甜味搭配姜和肉桂，一碗不到150千卡。',
    category: '减脂餐', tags: ['减脂', '低卡', '汤品', '素食'], difficulty: 'easy',
    cookTime: 25, servings: 2,
    ingredients: [{ name: '南瓜', amount: '300g' }, { name: '洋葱', amount: '半个' }, { name: '姜', amount: '2片' }, { name: '蔬菜高汤', amount: '200ml' }, { name: '盐', amount: '适量' }, { name: '南瓜籽', amount: '适量' }],
    steps: [{ step: 1, description: '南瓜去皮切块' }, { step: 2, description: '炒洋葱和姜至香' }, { step: 3, description: '加入南瓜和高汤煮15分钟至软' }, { step: 4, description: '用搅拌机打成浓汤' }, { step: 5, description: '加盐调味，撒南瓜籽' }],
    nutrition: { calories: 130, protein: 4, fat: 3, carbs: 25 },
    stats: { likes: 1450, collections: 980, comments: 67, views: 10200 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-02-05',
  },
  {
    id: 'p9', author: MOCK_AUTHORS[1], title: '虾仁滑蛋', coverEmoji: '🦐',
    coverImage: getRecipeImage('p9'),
    description: '5分钟快手高蛋白菜！虾仁鲜嫩，鸡蛋滑软，减脂增肌都适合，关键还特别好吃。',
    category: '减脂餐', tags: ['减脂', '高蛋白', '快手菜', '增肌'], difficulty: 'easy',
    cookTime: 8, servings: 1,
    ingredients: [{ name: '虾仁', amount: '120g' }, { name: '鸡蛋', amount: '3个' }, { name: '葱花', amount: '适量' }, { name: '盐', amount: '适量' }, { name: '料酒', amount: '少许' }],
    steps: [{ step: 1, description: '虾仁用料酒和盐腌制5分钟' }, { step: 2, description: '鸡蛋打散加少许盐' }, { step: 3, description: '虾仁焯水30秒捞出' }, { step: 4, description: '热锅少油，倒入蛋液' }, { step: 5, description: '蛋液半凝固时放入虾仁，快速翻炒' }, { step: 6, description: '撒葱花出锅' }],
    nutrition: { calories: 260, protein: 32, fat: 12, carbs: 3 },
    stats: { likes: 3400, collections: 2600, comments: 189, views: 23400 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-02-10',
  },
  // ===== 增肌餐 =====
  {
    id: 'p10', author: MOCK_AUTHORS[1], title: '香煎三文鱼牛油果碗', coverEmoji: '🐟',
    coverImage: getRecipeImage('p10'),
    description: '优质脂肪+高蛋白的完美增肌餐。三文鱼富含Omega-3，牛油果提供健康脂肪，搭配杂粮饭。',
    category: '增肌餐', tags: ['增肌', '高蛋白', '三文鱼', '健康脂肪'], difficulty: 'medium',
    cookTime: 20, servings: 1,
    ingredients: [{ name: '三文鱼', amount: '150g' }, { name: '牛油果', amount: '半个' }, { name: '杂粮饭', amount: '120g' }, { name: '芦笋', amount: '80g' }, { name: '柠檬', amount: '适量' }, { name: '盐和黑胡椒', amount: '适量' }],
    steps: [{ step: 1, description: '三文鱼擦干水分，撒盐和黑胡椒' }, { step: 2, description: '平底锅小火煎三文鱼每面4分钟' }, { step: 3, description: '芦笋焯水' }, { step: 4, description: '牛油果切块' }, { step: 5, description: '碗中放杂粮饭，摆上三文鱼、牛油果和芦笋' }, { step: 6, description: '挤上柠檬汁即可' }],
    nutrition: { calories: 580, protein: 40, fat: 24, carbs: 42 },
    stats: { likes: 2800, collections: 2100, comments: 156, views: 19800 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-02-15',
  },
  {
    id: 'p11', author: MOCK_AUTHORS[0], title: '金枪鱼牛油果拌饭', coverEmoji: '🍚',
    coverImage: getRecipeImage('p11'),
    description: '水浸金枪鱼罐头+牛油果+杂粮饭，无需开火5分钟搞定。增肌期最佳快手午餐。',
    category: '增肌餐', tags: ['增肌', '高蛋白', '快手菜', '午餐'], difficulty: 'easy',
    cookTime: 5, servings: 1,
    ingredients: [{ name: '水浸金枪鱼罐头', amount: '1罐' }, { name: '牛油果', amount: '半个' }, { name: '杂粮饭', amount: '150g' }, { name: '紫菜碎', amount: '适量' }, { name: '芝麻油', amount: '1茶匙' }],
    steps: [{ step: 1, description: '杂粮饭盛入碗中' }, { step: 2, description: '金枪鱼沥干水分捣碎' }, { step: 3, description: '牛油果切块' }, { step: 4, description: '金枪鱼和牛油果摆在饭上' }, { step: 5, description: '撒紫菜碎，淋芝麻油拌匀' }],
    nutrition: { calories: 480, protein: 35, fat: 16, carbs: 45 },
    stats: { likes: 1900, collections: 1400, comments: 89, views: 13400 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-02-20',
  },
  {
    id: 'p12', author: MOCK_AUTHORS[1], title: '葱爆牛肉', coverEmoji: '🥩',
    coverImage: getRecipeImage('p12'),
    description: '经典增肌中餐！牛肉富含肌酸和蛋白质，大葱爆炒香气四溢，配米饭绝了。',
    category: '增肌餐', tags: ['增肌', '高蛋白', '中式', '快手'], difficulty: 'medium',
    cookTime: 15, servings: 1,
    ingredients: [{ name: '牛肉片', amount: '150g' }, { name: '大葱', amount: '3根' }, { name: '生抽', amount: '1汤匙' }, { name: '蚝油', amount: '1茶匙' }, { name: '料酒', amount: '1汤匙' }, { name: '淀粉', amount: '少许' }],
    steps: [{ step: 1, description: '牛肉片用料酒、生抽、淀粉腌制10分钟' }, { step: 2, description: '大葱斜切段' }, { step: 3, description: '热锅多油，大火爆炒牛肉至变色盛出' }, { step: 4, description: '锅中炒大葱至微焦' }, { step: 5, description: '倒入牛肉和蚝油快速翻炒均匀' }],
    nutrition: { calories: 380, protein: 38, fat: 18, carbs: 10 },
    stats: { likes: 3200, collections: 2300, comments: 178, views: 22000 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-03-01',
  },
  // ===== 健康早餐 =====
  {
    id: 'p13', author: MOCK_AUTHORS[0], title: '红薯酸奶早餐碗', coverEmoji: '🍠',
    coverImage: getRecipeImage('p13'),
    description: '烤红薯的焦甜搭配酸奶的清爽，再来点格兰诺拉。健康版甜品早餐，大人小孩都爱。',
    category: '健康早餐', tags: ['早餐', '高纤维', '素食', '甜品替代'], difficulty: 'easy',
    cookTime: 25, servings: 1,
    ingredients: [{ name: '红薯', amount: '150g' }, { name: '希腊酸奶', amount: '150g' }, { name: '格兰诺拉', amount: '20g' }, { name: '蜂蜜', amount: '1茶匙' }, { name: '肉桂粉', amount: '少许' }],
    steps: [{ step: 1, description: '红薯烤熟或蒸熟' }, { step: 2, description: '红薯切块放入碗中' }, { step: 3, description: '倒入酸奶' }, { step: 4, description: '撒格兰诺拉和肉桂粉' }, { step: 5, description: '淋蜂蜜即可' }],
    nutrition: { calories: 310, protein: 14, fat: 6, carbs: 52 },
    stats: { likes: 2300, collections: 1800, comments: 95, views: 15600 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-03-05',
  },
  {
    id: 'p14', author: MOCK_AUTHORS[4], title: '葱油饼', coverEmoji: '🫓',
    coverImage: getRecipeImage('p14'),
    description: '经典中式早餐，外酥里软。少油版做法，搭配豆浆或粥，满足中国胃。',
    category: '健康早餐', tags: ['早餐', '中式', '面食', '家常'], difficulty: 'medium',
    cookTime: 30, servings: 2,
    ingredients: [{ name: '中筋面粉', amount: '200g' }, { name: '葱花', amount: '50g' }, { name: '热水', amount: '120ml' }, { name: '食用油', amount: '15ml' }, { name: '盐', amount: '适量' }],
    steps: [{ step: 1, description: '面粉加热水揉成面团，醒20分钟' }, { step: 2, description: '擀开抹油撒盐和葱花' }, { step: 3, description: '卷起后盘成圆形，再擀平' }, { step: 4, description: '平底锅少油中小火煎至两面金黄' }, { step: 5, description: '切块装盘' }],
    nutrition: { calories: 280, protein: 8, carbs: 36, fat: 12 },
    stats: { likes: 2800, collections: 1900, comments: 134, views: 18900 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-03-10',
  },
  {
    id: 'p15', author: MOCK_AUTHORS[2], title: '西葫芦鸡蛋饼', coverEmoji: '🥒',
    coverImage: getRecipeImage('p15'),
    description: '蔬菜鸡蛋饼，西葫芦擦丝拌入面糊，软嫩鲜香。小朋友也能吃，蔬菜摄入轻松达标。',
    category: '健康早餐', tags: ['早餐', '快手', '素食', '儿童'], difficulty: 'easy',
    cookTime: 10, servings: 1,
    ingredients: [{ name: '西葫芦', amount: '1根' }, { name: '鸡蛋', amount: '1个' }, { name: '面粉', amount: '3汤匙' }, { name: '盐', amount: '适量' }, { name: '食用油', amount: '适量' }],
    steps: [{ step: 1, description: '西葫芦擦丝加盐腌制5分钟挤出水' }, { step: 2, description: '加入鸡蛋和面粉搅拌成糊' }, { step: 3, description: '平底锅刷油，倒入面糊摊平' }, { step: 4, description: '中小火煎至两面金黄' }],
    nutrition: { calories: 190, protein: 10, fat: 8, carbs: 18 },
    stats: { likes: 1600, collections: 1200, comments: 78, views: 11200 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-03-15',
  },
  {
    id: 'p16', author: MOCK_AUTHORS[4], title: '鸡蛋灌饼', coverEmoji: '🌯',
    coverImage: getRecipeImage('p16'),
    description: '街头早餐之王！在家也能做。饼皮鼓包后灌入蛋液，配上生菜和甜面酱。',
    category: '健康早餐', tags: ['早餐', '中式', '面食', '街头'], difficulty: 'hard',
    cookTime: 25, servings: 2,
    ingredients: [{ name: '面粉', amount: '200g' }, { name: '鸡蛋', amount: '2个' }, { name: '生菜', amount: '适量' }, { name: '甜面酱', amount: '适量' }, { name: '食用油', amount: '适量' }],
    steps: [{ step: 1, description: '面粉加温水和成面团，醒15分钟' }, { step: 2, description: '面团擀成薄饼' }, { step: 3, description: '平底锅刷油放入饼皮' }, { step: 4, description: '饼皮鼓包时戳洞灌入蛋液' }, { step: 5, description: '烙至鸡蛋凝固两面微焦' }, { step: 6, description: '刷甜面酱卷生菜食用' }],
    nutrition: { calories: 320, protein: 12, fat: 14, carbs: 38 },
    stats: { likes: 3800, collections: 2400, comments: 210, views: 25600 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-03-20',
  },
  // ===== 家常菜 =====
  {
    id: 'p17', author: MOCK_AUTHORS[4], title: '红烧排骨', coverEmoji: '🍖',
    coverImage: getRecipeImage('p17'),
    description: '家家都有自己的红烧排骨秘方。酱红油亮，软烂脱骨，配米饭是人间美味。',
    category: '家常菜', tags: ['家常菜', '中式', '下饭', '肉类'], difficulty: 'medium',
    cookTime: 50, servings: 2,
    ingredients: [{ name: '排骨', amount: '400g' }, { name: '冰糖', amount: '20g' }, { name: '生抽', amount: '2汤匙' }, { name: '老抽', amount: '1汤匙' }, { name: '姜片', amount: '3片' }, { name: '八角', amount: '2个' }, { name: '料酒', amount: '1汤匙' }],
    steps: [{ step: 1, description: '排骨冷水下锅焯水去血沫' }, { step: 2, description: '锅中炒冰糖至焦糖色' }, { step: 3, description: '放入排骨翻炒上色' }, { step: 4, description: '加入姜、八角、生抽、老抽、料酒' }, { step: 5, description: '加水没过排骨，大火烧开转小火炖40分钟' }, { step: 6, description: '大火收汁至浓稠即可' }],
    nutrition: { calories: 450, protein: 28, fat: 32, carbs: 12 },
    stats: { likes: 5600, collections: 3800, comments: 345, views: 38000 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-03-25',
  },
  {
    id: 'p18', author: MOCK_AUTHORS[3], title: '醋溜白菜', coverEmoji: '🥬',
    coverImage: getRecipeImage('p18'),
    description: '最简单也最难做好的家常菜。醋香扑鼻，酸辣脆爽，5分钟搞定，成本不到3块钱。',
    category: '家常菜', tags: ['家常菜', '快手', '素菜', '低卡'], difficulty: 'easy',
    cookTime: 8, servings: 2,
    ingredients: [{ name: '大白菜', amount: '300g' }, { name: '干辣椒', amount: '3个' }, { name: '蒜末', amount: '适量' }, { name: '生抽', amount: '1汤匙' }, { name: '醋', amount: '2汤匙' }, { name: '糖', amount: '1茶匙' }, { name: '水淀粉', amount: '适量' }],
    steps: [{ step: 1, description: '白菜帮切片，菜叶撕块' }, { step: 2, description: '调汁：生抽、醋、糖、水淀粉混合' }, { step: 3, description: '热锅爆香干辣椒和蒜末' }, { step: 4, description: '先炒白菜帮至断生' }, { step: 5, description: '加菜叶翻炒' }, { step: 6, description: '倒入酱汁翻炒均匀即可' }],
    nutrition: { calories: 80, protein: 3, fat: 3, carbs: 10 },
    stats: { likes: 2100, collections: 1400, comments: 87, views: 14500 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-04-01',
  },
  {
    id: 'p19', author: MOCK_AUTHORS[4], title: '回锅肉', coverEmoji: '🥓',
    coverImage: getRecipeImage('p19'),
    description: '川菜之首！五花肉先煮后炒，配郫县豆瓣酱和青蒜，肥而不腻，下饭神器。',
    category: '家常菜', tags: ['家常菜', '川菜', '下饭', '五花肉'], difficulty: 'medium',
    cookTime: 35, servings: 2,
    ingredients: [{ name: '五花肉', amount: '250g' }, { name: '青蒜', amount: '3根' }, { name: '郫县豆瓣酱', amount: '1汤匙' }, { name: '豆豉', amount: '1茶匙' }, { name: '料酒', amount: '1汤匙' }, { name: '糖', amount: '1茶匙' }],
    steps: [{ step: 1, description: '五花肉冷水下锅煮20分钟至全熟' }, { step: 2, description: '捞出放凉切薄片' }, { step: 3, description: '青蒜斜切段' }, { step: 4, description: '热锅少油煸炒肉片至卷曲出油' }, { step: 5, description: '加豆瓣酱和豆豉炒出红油' }, { step: 6, description: '放入青蒜快速翻炒，加糖调味' }],
    nutrition: { calories: 420, protein: 22, fat: 34, carbs: 8 },
    stats: { likes: 4800, collections: 3200, comments: 267, views: 32000 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-04-05',
  },
  {
    id: 'p20', author: MOCK_AUTHORS[2], title: '干煸四季豆', coverEmoji: '🫘',
    coverImage: getRecipeImage('p20'),
    description: '川菜经典素菜。四季豆干煸至表皮起皱，配干辣椒花椒，咸香微辣超下饭。',
    category: '家常菜', tags: ['家常菜', '川菜', '素菜', '下饭'], difficulty: 'medium',
    cookTime: 20, servings: 2,
    ingredients: [{ name: '四季豆', amount: '300g' }, { name: '干辣椒', amount: '5个' }, { name: '花椒', amount: '1茶匙' }, { name: '蒜末', amount: '适量' }, { name: '盐', amount: '适量' }, { name: '食用油', amount: '适量' }],
    steps: [{ step: 1, description: '四季豆洗净去筋掰成段' }, { step: 2, description: '锅中多油，中火煸炒四季豆至表皮起皱' }, { step: 3, description: '盛出四季豆' }, { step: 4, description: '锅中留底油爆香干辣椒、花椒、蒜末' }, { step: 5, description: '放入四季豆翻炒，加盐调味' }],
    nutrition: { calories: 150, protein: 5, fat: 9, carbs: 14 },
    stats: { likes: 1800, collections: 1200, comments: 67, views: 12800 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-04-10',
  },
  {
    id: 'p21', author: MOCK_AUTHORS[3], title: '可乐鸡翅', coverEmoji: '🍗',
    coverImage: getRecipeImage('p21'),
    description: '入门级硬菜！可乐替代糖和水的角色，鸡翅嫩滑酱色浓郁，招待客人也拿得出手。',
    category: '家常菜', tags: ['家常菜', '快手', '肉菜', '新手'], difficulty: 'easy',
    cookTime: 30, servings: 2,
    ingredients: [{ name: '鸡中翅', amount: '8个' }, { name: '可乐', amount: '250ml' }, { name: '生抽', amount: '2汤匙' }, { name: '姜片', amount: '3片' }, { name: '料酒', amount: '1汤匙' }, { name: '白芝麻', amount: '适量' }],
    steps: [{ step: 1, description: '鸡翅正反各划两刀' }, { step: 2, description: '冷水下锅焯水去血沫' }, { step: 3, description: '锅中煎鸡翅至两面金黄' }, { step: 4, description: '加入可乐、生抽、姜片、料酒' }, { step: 5, description: '中小火煮15分钟' }, { step: 6, description: '大火收汁至浓稠，撒白芝麻' }],
    nutrition: { calories: 380, protein: 28, fat: 18, carbs: 22 },
    stats: { likes: 6700, collections: 4500, comments: 389, views: 45000 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-04-15',
  },
  // ===== 素食 =====
  {
    id: 'p22', author: MOCK_AUTHORS[2], title: '素麻婆豆腐', coverEmoji: '🫘',
    coverImage: getRecipeImage('p22'),
    description: '素食版麻婆豆腐，用香菇丁代替肉末一样鲜香麻辣。嫩豆腐入口即化，能下两碗饭。',
    category: '素食', tags: ['素食', '川菜', '高蛋白', '豆腐'], difficulty: 'easy',
    cookTime: 15, servings: 2,
    ingredients: [{ name: '嫩豆腐', amount: '300g' }, { name: '香菇', amount: '3朵' }, { name: '豆瓣酱', amount: '1汤匙' }, { name: '花椒粉', amount: '1茶匙' }, { name: '葱花', amount: '适量' }, { name: '水淀粉', amount: '适量' }],
    steps: [{ step: 1, description: '豆腐切小块焯水' }, { step: 2, description: '香菇切碎' }, { step: 3, description: '热锅炒香菇碎' }, { step: 4, description: '加豆瓣酱炒出红油' }, { step: 5, description: '加适量水烧开，放入豆腐煮5分钟' }, { step: 6, description: '勾芡撒花椒粉和葱花' }],
    nutrition: { calories: 180, protein: 14, fat: 8, carbs: 12 },
    stats: { likes: 1500, collections: 1100, comments: 56, views: 9800 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-04-20',
  },
  {
    id: 'p23', author: MOCK_AUTHORS[2], title: '番茄蔬菜咖喱', coverEmoji: '🍛',
    coverImage: getRecipeImage('p23'),
    description: '浓郁番茄底的蔬菜咖喱，加入鹰嘴豆增加蛋白质。一锅搞定营养均衡，适合备餐。',
    category: '素食', tags: ['素食', '咖喱', '高纤维', '备餐'], difficulty: 'medium',
    cookTime: 30, servings: 2,
    ingredients: [{ name: '番茄罐头', amount: '200g' }, { name: '鹰嘴豆', amount: '100g' }, { name: '土豆', amount: '1个' }, { name: '胡萝卜', amount: '1根' }, { name: '洋葱', amount: '半个' }, { name: '咖喱粉', amount: '1汤匙' }, { name: '椰奶', amount: '100ml' }],
    steps: [{ step: 1, description: '洋葱切丁炒至透明' }, { step: 2, description: '加入番茄罐头和咖喱粉炒香' }, { step: 3, description: '土豆和胡萝卜切块加入' }, { step: 4, description: '加水煮20分钟至蔬菜软烂' }, { step: 5, description: '加入鹰嘴豆和椰奶煮5分钟' }, { step: 6, description: '调味后配米饭或馕食用' }],
    nutrition: { calories: 320, protein: 12, fat: 12, carbs: 42 },
    stats: { likes: 1200, collections: 900, comments: 45, views: 8700 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-04-25',
  },
  {
    id: 'p24', author: MOCK_AUTHORS[2], title: '素菜包子', coverEmoji: '🥟',
    coverImage: getRecipeImage('p24'),
    description: '自制冷冻素菜包，菠菜粉丝香菇馅，健康早餐好选择。一次多做点，冷冻能存两周。',
    category: '素食', tags: ['素食', '面食', '早餐', '备餐'], difficulty: 'hard',
    cookTime: 60, servings: 8,
    ingredients: [{ name: '中筋面粉', amount: '400g' }, { name: '酵母', amount: '5g' }, { name: '菠菜', amount: '200g' }, { name: '粉丝', amount: '50g' }, { name: '香菇', amount: '5朵' }, { name: '香油', amount: '1汤匙' }, { name: '盐', amount: '适量' }],
    steps: [{ step: 1, description: '面粉加酵母温水和面发酵40分钟' }, { step: 2, description: '菠菜焯水挤干切碎' }, { step: 3, description: '粉丝泡软切碎，香菇泡发切碎' }, { step: 4, description: '所有馅料加香油和盐拌匀' }, { step: 5, description: '包入馅料，二次醒发15分钟' }, { step: 6, description: '冷水上锅蒸15分钟' }],
    nutrition: { calories: 180, protein: 6, fat: 3, carbs: 34 },
    stats: { likes: 980, collections: 760, comments: 34, views: 6700 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-05-01',
  },
  // ===== 甜品 =====
  {
    id: 'p25', author: MOCK_AUTHORS[3], title: '香蕉燕麦能量球', coverEmoji: '🍪',
    coverImage: getRecipeImage('p25'),
    description: '免烤能量球，香蕉燕麦打底加花生酱和黑巧克力。健身前后来两颗，天然能量补给。',
    category: '甜品', tags: ['甜品', '高蛋白', '免烤', '健身零食'], difficulty: 'easy',
    cookTime: 15, servings: 6,
    ingredients: [{ name: '香蕉', amount: '2根' }, { name: '燕麦片', amount: '100g' }, { name: '花生酱', amount: '2汤匙' }, { name: '黑巧克力豆', amount: '30g' }, { name: '奇亚籽', amount: '1汤匙' }],
    steps: [{ step: 1, description: '香蕉捣成泥' }, { step: 2, description: '加入燕麦片、花生酱、奇亚籽拌匀' }, { step: 3, description: '加入黑巧克力豆' }, { step: 4, description: '搓成小球放烤盘' }, { step: 5, description: '180度烤12分钟即可' }],
    nutrition: { calories: 150, protein: 5, fat: 6, carbs: 20 },
    stats: { likes: 2300, collections: 1900, comments: 89, views: 16700 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-05-05',
  },
  {
    id: 'p26', author: MOCK_AUTHORS[0], title: '椰汁芒果糯米饭', coverEmoji: '🥭',
    coverImage: getRecipeImage('p26'),
    description: '泰式经典甜品！糯米吸饱椰汁的香甜，搭配新鲜芒果，秒回泰国街头。',
    category: '甜品', tags: ['甜品', '东南亚', '芒果', '椰汁'], difficulty: 'medium',
    cookTime: 40, servings: 2,
    ingredients: [{ name: '糯米', amount: '150g' }, { name: '芒果', amount: '1个' }, { name: '椰奶', amount: '200ml' }, { name: '糖', amount: '2汤匙' }, { name: '盐', amount: '少许' }],
    steps: [{ step: 1, description: '糯米提前泡4小时' }, { step: 2, description: '糯米蒸熟' }, { step: 3, description: '椰奶加糖和盐小火加热至微沸' }, { step: 4, description: '糯米倒入椰奶中拌匀静置15分钟' }, { step: 5, description: '芒果切片' }, { step: 6, description: '糯米盛盘放上芒果，淋剩余椰奶' }],
    nutrition: { calories: 380, protein: 6, fat: 14, carbs: 58 },
    stats: { likes: 2900, collections: 2200, comments: 134, views: 21000 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-05-10',
  },
  {
    id: 'p27', author: MOCK_AUTHORS[3], title: '芋泥麻薯杯', coverEmoji: '🟣',
    coverImage: getRecipeImage('p27'),
    description: '芋泥控必做！自制芋泥搭配拉丝麻薯，层层叠叠的幸福感。减糖版更健康。',
    category: '甜品', tags: ['甜品', '芋泥', '麻薯', '亚洲'], difficulty: 'medium',
    cookTime: 35, servings: 2,
    ingredients: [{ name: '芋头', amount: '200g' }, { name: '糯米粉', amount: '50g' }, { name: '牛奶', amount: '100ml' }, { name: '糖', amount: '20g' }, { name: '紫薯粉', amount: '少许' }],
    steps: [{ step: 1, description: '芋头蒸熟加牛奶和糖打成泥' }, { step: 2, description: '糯米粉加水调匀蒸15分钟成麻薯' }, { step: 3, description: '麻薯取出反复拉扯增加弹性' }, { step: 4, description: '杯底铺芋泥' }, { step: 5, description: '放麻薯' }, { step: 6, description: '再铺芋泥，重复至满' }],
    nutrition: { calories: 280, protein: 6, fat: 4, carbs: 55 },
    stats: { likes: 3400, collections: 2800, comments: 167, views: 24000 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-05-15',
  },
  // ===== 汤品 =====
  {
    id: 'p28', author: MOCK_AUTHORS[0], title: '番茄牛尾汤', coverEmoji: '🥘',
    coverImage: getRecipeImage('p28'),
    description: '浓郁鲜美的番茄牛尾汤，富含胶原蛋白。小火慢炖出的风味，暖心暖胃。',
    category: '汤品', tags: ['汤品', '慢炖', '胶原蛋白', '暖胃'], difficulty: 'medium',
    cookTime: 120, servings: 3,
    ingredients: [{ name: '牛尾', amount: '500g' }, { name: '番茄', amount: '3个' }, { name: '土豆', amount: '1个' }, { name: '胡萝卜', amount: '1根' }, { name: '洋葱', amount: '半个' }, { name: '姜片', amount: '3片' }, { name: '番茄酱', amount: '1汤匙' }],
    steps: [{ step: 1, description: '牛尾焯水去血沫' }, { step: 2, description: '番茄切块，洋葱切丁' }, { step: 3, description: '炒洋葱和番茄至出汁' }, { step: 4, description: '加入牛尾、番茄酱和足量水' }, { step: 5, description: '大火烧开转小火炖1.5小时' }, { step: 6, description: '加入土豆和胡萝卜再炖20分钟' }],
    nutrition: { calories: 380, protein: 28, fat: 22, carbs: 18 },
    stats: { likes: 2100, collections: 1600, comments: 98, views: 14500 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-05-20',
  },
  {
    id: 'p29', author: MOCK_AUTHORS[2], title: '绿豆百合汤', coverEmoji: '🥣',
    coverImage: getRecipeImage('p29'),
    description: '夏日消暑神器！绿豆清热解毒，百合润肺安神。冰镇后喝一碗，暑气全消。',
    category: '汤品', tags: ['汤品', '消暑', '素食', '中式糖水'], difficulty: 'easy',
    cookTime: 40, servings: 4,
    ingredients: [{ name: '绿豆', amount: '150g' }, { name: '鲜百合', amount: '2个' }, { name: '冰糖', amount: '40g' }, { name: '陈皮', amount: '1小块' }],
    steps: [{ step: 1, description: '绿豆洗净无需泡' }, { step: 2, description: '绿豆加水大火煮开' }, { step: 3, description: '转小火煮30分钟至绿豆开花' }, { step: 4, description: '加入百合和冰糖' }, { step: 5, description: '煮5分钟即可，冰镇更佳' }],
    nutrition: { calories: 120, protein: 4, fat: 0.5, carbs: 26 },
    stats: { likes: 2600, collections: 1800, comments: 112, views: 18000 }, isLiked: false, isCollected: false, isMemberOnly: false, createdAt: '2024-05-25',
  },
];

export const useFoodChannelStore = create<FoodChannelStore>((set, get) => ({
  posts: MOCK_POSTS,
  categories: ['全部', '减脂餐', '增肌餐', '健康早餐', '家常菜', '素食', '甜品', '汤品'],
  selectedCategory: '全部',

  setCategory: (category) => {
    set({ selectedCategory: category });
  },

  toggleLike: (postId) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              stats: {
                ...post.stats,
                likes: post.isLiked ? post.stats.likes - 1 : post.stats.likes + 1,
              },
            }
          : post
      ),
    }));
    get().savePosts();
  },

  toggleCollect: (postId) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isCollected: !post.isCollected,
              stats: {
                ...post.stats,
                collections: post.isCollected ? post.stats.collections - 1 : post.stats.collections + 1,
              },
            }
          : post
      ),
    }));
    get().savePosts();
  },

  addPost: (post) => {
    set((state) => ({
      posts: [post, ...state.posts],
    }));
    get().savePosts();
  },

  loadPosts: async () => {
    try {
      const version = await AsyncStorage.getItem(STORAGE_VERSION_KEY);
      if (version !== String(MOCK_DATA_VERSION)) {
        // Data version mismatch — use fresh mock data
        await AsyncStorage.setItem(STORAGE_VERSION_KEY, String(MOCK_DATA_VERSION));
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_POSTS));
        set({ posts: MOCK_POSTS });
        return;
      }
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        set({ posts: JSON.parse(data) });
      }
    } catch (error) {
      logger.error('Failed to load food channel posts:', error);
    }
  },

  savePosts: async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(get().posts));
      await AsyncStorage.setItem(STORAGE_VERSION_KEY, String(MOCK_DATA_VERSION));
    } catch (error) {
      logger.error('Failed to save food channel posts:', error);
    }
  },
}));
