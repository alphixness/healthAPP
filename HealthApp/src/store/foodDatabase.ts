import { FOOD_DATA } from './foodData/foodData';

export type FoodCategory =
  | 'grains'           // 米面主食
  | 'bread'            // 面包糕点
  | 'noodles'          // 面食
  | 'vegetables'        // 蔬菜
  | 'fruits'           // 水果
  | 'meat'             // 猪肉牛肉
  | 'poultry'          // 禽肉
  | 'seafood'          // 海鲜
  | 'eggs'             // 蛋类
  | 'dairy'            // 奶制品
  | 'beverages'        // 饮料
  | 'juice'            // 果汁
  | 'milkTea'          // 奶茶
  | 'chineseDishes'    // 中式菜肴
  | 'hotpot'           // 火锅
  | 'barbecue'         // 烧烤
  | 'westernFood'      // 西餐
  | 'fastFood'         // 快餐
  | 'snacks'           // 零食
  | 'desserts'         // 甜点
  | 'condiments'       // 调味品
  | 'other';           // 其他

export interface NutritionInfo {
  calories: number;    // 热量 (kcal/100g)
  protein: number;     // 蛋白质 (g)
  fat: number;         // 脂肪 (g)
  carbs: number;      // 碳水化合物 (g)
  fiber: number;       // 膳食纤维 (g)
  sugar: number;      // 糖分 (g)
  sodium: number;     // 钠 (mg)
  cholesterol?: number; // 胆固醇 (mg)
}

export interface ServingSize {
  default: number;     // 默认份量 (g)
  description: string; // 份量描述
}

export interface FoodItem {
  id: string;
  name: string;                      // 中文名称
  nameEn: string;                     // 英文名称
  category: FoodCategory;             // 食物分类
  icon: string;                      // 图标emoji
  
  nutrition: NutritionInfo;
  
  servingSize: ServingSize;
  
  ai: {
    keywords: string[];               
    confidence: number;               
  };
}

export interface FoodCategoryInfo {
  key: FoodCategory;
  name: string;
  icon: string;
  color: string;
}

export const FOOD_CATEGORIES: FoodCategoryInfo[] = [
  { key: 'grains', name: '米面主食', icon: '🍚', color: '#FFD700' },
  { key: 'bread', name: '面包糕点', icon: '🍞', color: '#DEB887' },
  { key: 'noodles', name: '面食', icon: '🍜', color: '#F4A460' },
  { key: 'vegetables', name: '蔬菜', icon: '🥬', color: '#228B22' },
  { key: 'fruits', name: '水果', icon: '🍎', color: '#FF6347' },
  { key: 'meat', name: '猪牛羊肉', icon: '🥩', color: '#8B4513' },
  { key: 'poultry', name: '禽肉', icon: '🍗', color: '#D2691E' },
  { key: 'seafood', name: '海鲜', icon: '🦐', color: '#4682B4' },
  { key: 'eggs', name: '蛋类', icon: '🥚', color: '#FFFACD' },
  { key: 'dairy', name: '奶制品', icon: '🥛', color: '#F5F5F5' },
  { key: 'beverages', name: '饮料', icon: '🥤', color: '#87CEEB' },
  { key: 'juice', name: '果汁', icon: '🧃', color: '#FFA500' },
  { key: 'milkTea', name: '奶茶', icon: '🧋', color: '#D2B48C' },
  { key: 'chineseDishes', name: '中式菜肴', icon: '🥡', color: '#FF6B6B' },
  { key: 'hotpot', name: '火锅', icon: '🍲', color: '#FF4500' },
  { key: 'barbecue', name: '烧烤', icon: '🍖', color: '#CD5C5C' },
  { key: 'westernFood', name: '西餐', icon: '🍽️', color: '#DEB887' },
  { key: 'fastFood', name: '快餐', icon: '🍔', color: '#FF8C00' },
  { key: 'snacks', name: '零食', icon: '🍿', color: '#FFA07A' },
  { key: 'desserts', name: '甜点', icon: '🍰', color: '#FFB6C1' },
  { key: 'condiments', name: '调味品', icon: '🧂', color: '#D3D3D3' },
  { key: 'other', name: '其他', icon: '🍽️', color: '#A9A9A9' },
];

const LEGACY_FOODS: FoodItem[] = [
  // 米面主食
  { id: 'food_001', name: '白米饭', nameEn: 'Steamed Rice', category: 'grains', icon: '🍚', nutrition: { calories: 116, protein: 2.6, fat: 0.3, carbs: 25.9, fiber: 0.3, sugar: 0, sodium: 1, cholesterol: 0 }, servingSize: { default: 150, description: '一碗（约150g）' }, ai: { keywords: ['米饭', '白米饭', '大米', 'steamed rice', 'rice'], confidence: 0.95 } },
  { id: 'food_002', name: '糙米饭', nameEn: 'Brown Rice', category: 'grains', icon: '🍚', nutrition: { calories: 111, protein: 2.6, fat: 0.9, carbs: 23, fiber: 1.8, sugar: 0.4, sodium: 5, cholesterol: 0 }, servingSize: { default: 150, description: '一碗（约150g）' }, ai: { keywords: ['糙米饭', '糙米', 'brown rice'], confidence: 0.92 } },
  { id: 'food_003', name: '小米粥', nameEn: 'Millet Porridge', category: 'grains', icon: '🍲', nutrition: { calories: 46, protein: 1.4, fat: 0.4, carbs: 9.3, fiber: 0.1, sugar: 0.3, sodium: 3, cholesterol: 0 }, servingSize: { default: 250, description: '一碗（约250g）' }, ai: { keywords: ['小米粥', '小米', 'millet'], confidence: 0.94 } },
  { id: 'food_004', name: '燕麦片', nameEn: 'Oatmeal', category: 'grains', icon: '🥣', nutrition: { calories: 389, protein: 16.9, fat: 6.9, carbs: 66.3, fiber: 10.6, sugar: 0, sodium: 2, cholesterol: 0 }, servingSize: { default: 40, description: '一小碗（约40g干重）' }, ai: { keywords: ['燕麦片', '燕麦', 'oatmeal', 'oats', '麦片'], confidence: 0.93 } },
  { id: 'food_005', name: '馒头', nameEn: 'Steamed Bun', category: 'grains', icon: '🥖', nutrition: { calories: 223, protein: 7, fat: 1.1, carbs: 47, fiber: 1.3, sugar: 1.5, sodium: 232, cholesterol: 0 }, servingSize: { default: 100, description: '一个中等馒头（约100g）' }, ai: { keywords: ['馒头', '蒸馒头', '白馒头', 'steamed bun'], confidence: 0.95 } },
  { id: 'food_006', name: '花卷', nameEn: 'Flour Twist', category: 'grains', icon: '🥐', nutrition: { calories: 217, protein: 6.4, fat: 2.3, carbs: 43.2, fiber: 1.2, sugar: 1.2, sodium: 280, cholesterol: 0 }, servingSize: { default: 80, description: '一个花卷（约80g）' }, ai: { keywords: ['花卷', 'flour twist'], confidence: 0.90 } },
  { id: 'food_007', name: '包子', nameEn: 'Baozi', category: 'grains', icon: '🥟', nutrition: { calories: 227, protein: 9.3, fat: 6.2, carbs: 34.1, fiber: 1.3, sugar: 2.1, sodium: 380, cholesterol: 15 }, servingSize: { default: 80, description: '一个包子（约80g）' }, ai: { keywords: ['包子', '肉包', '菜包', 'baozi', 'dumpling'], confidence: 0.94 } },
  { id: 'food_008', name: '饺子', nameEn: 'Jiaozi', category: 'grains', icon: '🥟', nutrition: { calories: 242, protein: 12.3, fat: 8.9, carbs: 30.2, fiber: 1.2, sugar: 2.3, sodium: 420, cholesterol: 25 }, servingSize: { default: 120, description: '6-8个（约120g）' }, ai: { keywords: ['饺子', '水饺', 'dumpling', 'jiaozi'], confidence: 0.93 } },
  { id: 'food_009', name: '煎饼', nameEn: 'Chinese Crepe', category: 'grains', icon: '🫓', nutrition: { calories: 198, protein: 5.4, fat: 5.8, carbs: 32.5, fiber: 1.6, sugar: 1.8, sodium: 350, cholesterol: 8 }, servingSize: { default: 100, description: '一个煎饼（约100g）' }, ai: { keywords: ['煎饼', '杂粮煎饼', 'Chinese crepe', 'jianbing'], confidence: 0.91 } },
  { id: 'food_010', name: '烧饼', nameEn: 'Shaobing', category: 'grains', icon: '🥮', nutrition: { calories: 245, protein: 7.8, fat: 8.5, carbs: 36.2, fiber: 1.8, sugar: 2.4, sodium: 320, cholesterol: 10 }, servingSize: { default: 80, description: '一个烧饼（约80g）' }, ai: { keywords: ['烧饼', '芝麻烧饼', 'shaobing'], confidence: 0.89 } },
  
  // 面包糕点
  { id: 'food_011', name: '白面包', nameEn: 'White Bread', category: 'bread', icon: '🍞', nutrition: { calories: 265, protein: 9, fat: 3.2, carbs: 49, fiber: 2.7, sugar: 5, sodium: 491, cholesterol: 0 }, servingSize: { default: 60, description: '两片（约60g）' }, ai: { keywords: ['白面包', '吐司', '面包', 'white bread', 'toast'], confidence: 0.95 } },
  { id: 'food_012', name: '全麦面包', nameEn: 'Whole Wheat Bread', category: 'bread', icon: '🍞', nutrition: { calories: 247, protein: 13.4, fat: 3.4, carbs: 41, fiber: 7, sugar: 6, sodium: 400, cholesterol: 0 }, servingSize: { default: 60, description: '两片（约60g）' }, ai: { keywords: ['全麦面包', '全麦吐司', 'whole wheat bread'], confidence: 0.94 } },
  { id: 'food_013', name: '法棍', nameEn: 'Baguette', category: 'bread', icon: '🥖', nutrition: { calories: 274, protein: 10.3, fat: 1.6, carbs: 54, fiber: 2.5, sugar: 4.2, sodium: 488, cholesterol: 0 }, servingSize: { default: 80, description: '一段法棍（约80g）' }, ai: { keywords: ['法棍', '法国面包', 'baguette', 'french bread'], confidence: 0.92 } },
  { id: 'food_014', name: '蛋糕', nameEn: 'Cake', category: 'desserts', icon: '🎂', nutrition: { calories: 348, protein: 5.2, fat: 17, carbs: 44.5, fiber: 0.6, sugar: 28, sodium: 220, cholesterol: 85 }, servingSize: { default: 100, description: '一块（约100g）' }, ai: { keywords: ['蛋糕', '奶油蛋糕', 'cake'], confidence: 0.95 } },
  { id: 'food_015', name: '月饼', nameEn: 'Mooncake', category: 'desserts', icon: '🥮', nutrition: { calories: 437, protein: 7.3, fat: 22, carbs: 54, fiber: 2.1, sugar: 32, sodium: 180, cholesterol: 35 }, servingSize: { default: 75, description: '一个月饼（约75g）' }, ai: { keywords: ['月饼', '蛋黄月饼', 'mooncake'], confidence: 0.96 } },
  
  // 蔬菜
  { id: 'food_016', name: '西兰花', nameEn: 'Broccoli', category: 'vegetables', icon: '🥦', nutrition: { calories: 34, protein: 2.8, fat: 0.4, carbs: 6.6, fiber: 2.6, sugar: 1.7, sodium: 33, cholesterol: 0 }, servingSize: { default: 100, description: '一小棵（约100g）' }, ai: { keywords: ['西兰花', '绿花菜', 'broccoli'], confidence: 0.97 } },
  { id: 'food_017', name: '菠菜', nameEn: 'Spinach', category: 'vegetables', icon: '🥬', nutrition: { calories: 23, protein: 2.9, fat: 0.4, carbs: 3.6, fiber: 2.2, sugar: 0.4, sodium: 79, cholesterol: 0 }, servingSize: { default: 100, description: '一把（约100g）' }, ai: { keywords: ['菠菜', 'spinach'], confidence: 0.97 } },
  { id: 'food_018', name: '白菜', nameEn: 'Chinese Cabbage', category: 'vegetables', icon: '🥬', nutrition: { calories: 17, protein: 1.5, fat: 0.1, carbs: 3.2, fiber: 0.8, sugar: 1.6, sodium: 65, cholesterol: 0 }, servingSize: { default: 150, description: '半棵（约150g）' }, ai: { keywords: ['白菜', '大白菜', '小白菜', 'cabbage'], confidence: 0.96 } },
  { id: 'food_019', name: '胡萝卜', nameEn: 'Carrot', category: 'vegetables', icon: '🥕', nutrition: { calories: 41, protein: 0.9, fat: 0.2, carbs: 9.6, fiber: 2.8, sugar: 4.7, sodium: 69, cholesterol: 0 }, servingSize: { default: 100, description: '一根中等胡萝卜（约100g）' }, ai: { keywords: ['胡萝卜', '红萝卜', 'carrot'], confidence: 0.97 } },
  { id: 'food_020', name: '番茄', nameEn: 'Tomato', category: 'vegetables', icon: '🍅', nutrition: { calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9, fiber: 1.2, sugar: 2.6, sodium: 5, cholesterol: 0 }, servingSize: { default: 150, description: '一个中等番茄（约150g）' }, ai: { keywords: ['番茄', '西红柿', 'tomato'], confidence: 0.97 } },
  { id: 'food_021', name: '黄瓜', nameEn: 'Cucumber', category: 'vegetables', icon: '🥒', nutrition: { calories: 15, protein: 0.7, fat: 0.1, carbs: 3.6, fiber: 0.5, sugar: 1.7, sodium: 2, cholesterol: 0 }, servingSize: { default: 150, description: '半根黄瓜（约150g）' }, ai: { keywords: ['黄瓜', '青瓜', 'cucumber'], confidence: 0.96 } },
  { id: 'food_022', name: '青椒', nameEn: 'Green Pepper', category: 'vegetables', icon: '🫑', nutrition: { calories: 20, protein: 0.9, fat: 0.2, carbs: 4.6, fiber: 1.3, sugar: 2.4, sodium: 3, cholesterol: 0 }, servingSize: { default: 100, description: '一个青椒（约100g）' }, ai: { keywords: ['青椒', '甜椒', 'bell pepper', 'green pepper'], confidence: 0.95 } },
  { id: 'food_023', name: '土豆', nameEn: 'Potato', category: 'vegetables', icon: '🥔', nutrition: { calories: 76, protein: 2, fat: 0.1, carbs: 17, fiber: 2.2, sugar: 0.8, sodium: 6, cholesterol: 0 }, servingSize: { default: 150, description: '一个中等土豆（约150g）' }, ai: { keywords: ['土豆', '马铃薯', 'potato'], confidence: 0.97 } },
  { id: 'food_024', name: '红薯', nameEn: 'Sweet Potato', category: 'vegetables', icon: '🍠', nutrition: { calories: 99, protein: 1.6, fat: 0.1, carbs: 23.6, fiber: 2.3, sugar: 4.2, sodium: 28, cholesterol: 0 }, servingSize: { default: 150, description: '一个中等红薯（约150g）' }, ai: { keywords: ['红薯', '地瓜', '番薯', 'sweet potato'], confidence: 0.96 } },
  { id: 'food_025', name: '南瓜', nameEn: 'Pumpkin', category: 'vegetables', icon: '🎃', nutrition: { calories: 26, protein: 1, fat: 0.1, carbs: 6.5, fiber: 0.5, sugar: 2.8, sodium: 1, cholesterol: 0 }, servingSize: { default: 200, description: '一块（约200g）' }, ai: { keywords: ['南瓜', '倭瓜', 'pumpkin'], confidence: 0.95 } },
  
  // 水果
  { id: 'food_026', name: '苹果', nameEn: 'Apple', category: 'fruits', icon: '🍎', nutrition: { calories: 52, protein: 0.3, fat: 0.2, carbs: 14, fiber: 2.4, sugar: 10.4, sodium: 1, cholesterol: 0 }, servingSize: { default: 180, description: '一个中等苹果（约180g）' }, ai: { keywords: ['苹果', 'apple'], confidence: 0.97 } },
  { id: 'food_027', name: '香蕉', nameEn: 'Banana', category: 'fruits', icon: '🍌', nutrition: { calories: 89, protein: 1.1, fat: 0.3, carbs: 23, fiber: 2.6, sugar: 12.2, sodium: 1, cholesterol: 0 }, servingSize: { default: 120, description: '一根中等香蕉（约120g）' }, ai: { keywords: ['香蕉', 'banana'], confidence: 0.97 } },
  { id: 'food_028', name: '橙子', nameEn: 'Orange', category: 'fruits', icon: '🍊', nutrition: { calories: 47, protein: 0.9, fat: 0.1, carbs: 12, fiber: 2.4, sugar: 9.4, sodium: 0, cholesterol: 0 }, servingSize: { default: 150, description: '一个中等橙子（约150g）' }, ai: { keywords: ['橙子', 'orange'], confidence: 0.97 } },
  { id: 'food_029', name: '葡萄', nameEn: 'Grape', category: 'fruits', icon: '🍇', nutrition: { calories: 67, protein: 0.6, fat: 0.4, carbs: 17, fiber: 0.9, sugar: 16, sodium: 2, cholesterol: 0 }, servingSize: { default: 100, description: '一小串（约100g）' }, ai: { keywords: ['葡萄', 'grape'], confidence: 0.97 } },
  { id: 'food_030', name: '西瓜', nameEn: 'Watermelon', category: 'fruits', icon: '🍉', nutrition: { calories: 30, protein: 0.6, fat: 0.1, carbs: 7.6, fiber: 0.4, sugar: 6.2, sodium: 1, cholesterol: 0 }, servingSize: { default: 300, description: '一块（约300g）' }, ai: { keywords: ['西瓜', 'watermelon'], confidence: 0.97 } },
  { id: 'food_031', name: '草莓', nameEn: 'Strawberry', category: 'fruits', icon: '🍓', nutrition: { calories: 32, protein: 0.7, fat: 0.3, carbs: 7.7, fiber: 2, sugar: 4.9, sodium: 1, cholesterol: 0 }, servingSize: { default: 100, description: '5-6颗（约100g）' }, ai: { keywords: ['草莓', 'strawberry'], confidence: 0.97 } },
  { id: 'food_032', name: '猕猴桃', nameEn: 'Kiwi', category: 'fruits', icon: '🥝', nutrition: { calories: 61, protein: 1.1, fat: 0.5, carbs: 15, fiber: 3, sugar: 9, sodium: 3, cholesterol: 0 }, servingSize: { default: 75, description: '一个猕猴桃（约75g）' }, ai: { keywords: ['猕猴桃', '奇异果', 'kiwi'], confidence: 0.96 } },
  { id: 'food_033', name: '火龙果', nameEn: 'Dragon Fruit', category: 'fruits', icon: '🐉', nutrition: { calories: 50, protein: 1.1, fat: 0, carbs: 13, fiber: 2, sugar: 8, sodium: 3, cholesterol: 0 }, servingSize: { default: 200, description: '半个火龙果（约200g）' }, ai: { keywords: ['火龙果', 'dragon fruit'], confidence: 0.95 } },
  { id: 'food_034', name: '芒果', nameEn: 'Mango', category: 'fruits', icon: '🥭', nutrition: { calories: 60, protein: 0.8, fat: 0.4, carbs: 15, fiber: 1.6, sugar: 13.7, sodium: 1, cholesterol: 0 }, servingSize: { default: 150, description: '半个芒果（约150g）' }, ai: { keywords: ['芒果', 'mango'], confidence: 0.97 } },
  { id: 'food_035', name: '柚子', nameEn: 'Grapefruit', category: 'fruits', icon: '🍊', nutrition: { calories: 42, protein: 0.8, fat: 0.1, carbs: 11, fiber: 1, sugar: 7.9, sodium: 0, cholesterol: 0 }, servingSize: { default: 200, description: '两瓣（约200g）' }, ai: { keywords: ['柚子', 'grapefruit', 'pomelo'], confidence: 0.96 } },
  
  // 肉类
  { id: 'food_036', name: '猪里脊', nameEn: 'Pork Tenderloin', category: 'meat', icon: '🥩', nutrition: { calories: 143, protein: 26, fat: 3.5, carbs: 0, fiber: 0, sugar: 0, sodium: 48, cholesterol: 79 }, servingSize: { default: 100, description: '100g瘦肉' }, ai: { keywords: ['猪里脊', '里脊肉', 'pork tenderloin'], confidence: 0.95 } },
  { id: 'food_037', name: '五花肉', nameEn: 'Pork Belly', category: 'meat', icon: '🥓', nutrition: { calories: 395, protein: 14, fat: 37, carbs: 0, fiber: 0, sugar: 0, sodium: 52, cholesterol: 90 }, servingSize: { default: 80, description: '3-4片（约80g）' }, ai: { keywords: ['五花肉', 'pork belly'], confidence: 0.96 } },
  { id: 'food_038', name: '牛肉里脊', nameEn: 'Beef Tenderloin', category: 'meat', icon: '🥩', nutrition: { calories: 135, protein: 27, fat: 2.5, carbs: 0, fiber: 0, sugar: 0, sodium: 55, cholesterol: 85 }, servingSize: { default: 100, description: '100g瘦肉' }, ai: { keywords: ['牛肉里脊', '牛里脊', 'beef tenderloin'], confidence: 0.95 } },
  { id: 'food_039', name: '牛腩', nameEn: 'Beef Brisket', category: 'meat', icon: '🥩', nutrition: { calories: 246, protein: 18, fat: 18, carbs: 0, fiber: 0, sugar: 0, sodium: 65, cholesterol: 88 }, servingSize: { default: 100, description: '100g' }, ai: { keywords: ['牛腩', 'beef brisket'], confidence: 0.94 } },
  { id: 'food_040', name: '羊腿肉', nameEn: 'Lamb Leg', category: 'meat', icon: '🥩', nutrition: { calories: 143, protein: 25, fat: 4, carbs: 0, fiber: 0, sugar: 0, sodium: 58, cholesterol: 78 }, servingSize: { default: 100, description: '100g瘦肉' }, ai: { keywords: ['羊腿', '羊排', 'lamb'], confidence: 0.94 } },
  
  // 禽肉
  { id: 'food_041', name: '鸡胸肉', nameEn: 'Chicken Breast', category: 'poultry', icon: '🍗', nutrition: { calories: 133, protein: 31, fat: 1.2, carbs: 0, fiber: 0, sugar: 0, sodium: 45, cholesterol: 85 }, servingSize: { default: 120, description: '一块鸡胸（约120g）' }, ai: { keywords: ['鸡胸肉', '鸡胸', 'chicken breast'], confidence: 0.97 } },
  { id: 'food_042', name: '鸡腿肉', nameEn: 'Chicken Thigh', category: 'poultry', icon: '🍗', nutrition: { calories: 177, protein: 25, fat: 8, carbs: 0, fiber: 0, sugar: 0, sodium: 84, cholesterol: 110 }, servingSize: { default: 100, description: '一个鸡腿（约100g）' }, ai: { keywords: ['鸡腿', '鸡腿肉', 'chicken thigh'], confidence: 0.96 } },
  { id: 'food_043', name: '鸭肉', nameEn: 'Duck Meat', category: 'poultry', icon: '🦆', nutrition: { calories: 240, protein: 19, fat: 17, carbs: 0, fiber: 0, sugar: 0, sodium: 74, cholesterol: 94 }, servingSize: { default: 100, description: '100g鸭肉' }, ai: { keywords: ['鸭肉', 'duck'], confidence: 0.95 } },
  
  // 海鲜
  { id: 'food_044', name: '三文鱼', nameEn: 'Salmon', category: 'seafood', icon: '🐟', nutrition: { calories: 183, protein: 22, fat: 10, carbs: 0, fiber: 0, sugar: 0, sodium: 50, cholesterol: 65 }, servingSize: { default: 120, description: '一块鱼排（约120g）' }, ai: { keywords: ['三文鱼', '鲑鱼', 'salmon'], confidence: 0.97 } },
  { id: 'food_045', name: '虾', nameEn: 'Shrimp', category: 'seafood', icon: '🦐', nutrition: { calories: 93, protein: 20, fat: 0.7, carbs: 0.2, fiber: 0, sugar: 0, sodium: 119, cholesterol: 161 }, servingSize: { default: 100, description: '8-10只（约100g）' }, ai: { keywords: ['虾', '大虾', 'shrimp', 'prawn'], confidence: 0.97 } },
  { id: 'food_046', name: '螃蟹', nameEn: 'Crab', category: 'seafood', icon: '🦀', nutrition: { calories: 97, protein: 19, fat: 1.5, carbs: 0, fiber: 0, sugar: 0, sodium: 370, cholesterol: 53 }, servingSize: { default: 100, description: '一只蟹（约100g肉）' }, ai: { keywords: ['螃蟹', '蟹', 'crab'], confidence: 0.96 } },
  { id: 'food_047', name: '鲈鱼', nameEn: 'Sea Bass', category: 'seafood', icon: '🐟', nutrition: { calories: 97, protein: 18, fat: 2.5, carbs: 0, fiber: 0, sugar: 0, sodium: 58, cholesterol: 55 }, servingSize: { default: 120, description: '一块鱼排（约120g）' }, ai: { keywords: ['鲈鱼', 'sea bass'], confidence: 0.95 } },
  { id: 'food_048', name: '海参', nameEn: 'Sea Cucumber', category: 'seafood', icon: '🥒', nutrition: { calories: 78, protein: 16.5, fat: 0.2, carbs: 0, fiber: 0, sugar: 0, sodium: 500, cholesterol: 0 }, servingSize: { default: 50, description: '一只中等海参（约50g）' }, ai: { keywords: ['海参', 'sea cucumber'], confidence: 0.93 } },
  { id: 'food_049', name: '扇贝', nameEn: 'Scallop', category: 'seafood', icon: '🐚', nutrition: { calories: 88, protein: 14, fat: 1, carbs: 2.4, fiber: 0, sugar: 0, sodium: 392, cholesterol: 53 }, servingSize: { default: 60, description: '3-4个（约60g）' }, ai: { keywords: ['扇贝', '贝柱', 'scallop'], confidence: 0.94 } },
  
  // 蛋类
  { id: 'food_050', name: '鸡蛋', nameEn: 'Egg', category: 'eggs', icon: '🥚', nutrition: { calories: 144, protein: 13, fat: 10, carbs: 1.1, fiber: 0, sugar: 1.1, sodium: 131, cholesterol: 373 }, servingSize: { default: 50, description: '一个中等鸡蛋（约50g）' }, ai: { keywords: ['鸡蛋', 'egg'], confidence: 0.98 } },
  { id: 'food_051', name: '蛋白', nameEn: 'Egg White', category: 'eggs', icon: '🥚', nutrition: { calories: 52, protein: 11, fat: 0.2, carbs: 0.7, fiber: 0, sugar: 0.7, sodium: 166, cholesterol: 0 }, servingSize: { default: 35, description: '一个蛋白（约35g）' }, ai: { keywords: ['蛋白', '蛋清', 'egg white'], confidence: 0.95 } },
  { id: 'food_052', name: '鸭蛋', nameEn: 'Duck Egg', category: 'eggs', icon: '🥚', nutrition: { calories: 180, protein: 13, fat: 14, carbs: 1.4, fiber: 0, sugar: 1.4, sodium: 148, cholesterol: 619 }, servingSize: { default: 70, description: '一个鸭蛋（约70g）' }, ai: { keywords: ['鸭蛋', 'duck egg'], confidence: 0.96 } },
  
  // 奶制品
  { id: 'food_053', name: '牛奶', nameEn: 'Milk', category: 'dairy', icon: '🥛', nutrition: { calories: 61, protein: 3.2, fat: 3.3, carbs: 4.8, fiber: 0, sugar: 5, sodium: 43, cholesterol: 10 }, servingSize: { default: 250, description: '一杯（约250ml）' }, ai: { keywords: ['牛奶', '鲜奶', 'milk'], confidence: 0.97 } },
  { id: 'food_054', name: '脱脂牛奶', nameEn: 'Skim Milk', category: 'dairy', icon: '🥛', nutrition: { calories: 34, protein: 3.4, fat: 0.1, carbs: 5, fiber: 0, sugar: 5, sodium: 41, cholesterol: 2 }, servingSize: { default: 250, description: '一杯（约250ml）' }, ai: { keywords: ['脱脂牛奶', '脱脂奶', 'skim milk'], confidence: 0.94 } },
  { id: 'food_055', name: '酸奶', nameEn: 'Yogurt', category: 'dairy', icon: '🥛', nutrition: { calories: 72, protein: 2.9, fat: 2.7, carbs: 9.3, fiber: 0, sugar: 9, sodium: 46 }, servingSize: { default: 200, description: '一杯（约200g）' }, ai: { keywords: ['酸奶', 'yogurt'], confidence: 0.97 } },
  { id: 'food_056', name: '奶酪', nameEn: 'Cheese', category: 'dairy', icon: '🧀', nutrition: { calories: 402, protein: 25, fat: 33, carbs: 1.3, fiber: 0, sugar: 0.5, sodium: 621, cholesterol: 100 }, servingSize: { default: 30, description: '一片（约30g）' }, ai: { keywords: ['奶酪', '芝士', 'cheese'], confidence: 0.97 } },
  { id: 'food_057', name: '黄油', nameEn: 'Butter', category: 'dairy', icon: '🧈', nutrition: { calories: 717, protein: 0.9, fat: 81, carbs: 0.1, fiber: 0, sugar: 0.1, sodium: 11, cholesterol: 215 }, servingSize: { default: 10, description: '一小块（约10g）' }, ai: { keywords: ['黄油', 'butter'], confidence: 0.97 } },
  
  // 饮料
  { id: 'food_058', name: '可乐', nameEn: 'Cola', category: 'beverages', icon: '🥤', nutrition: { calories: 42, protein: 0, fat: 0, carbs: 10.6, fiber: 0, sugar: 10.6, sodium: 4 }, servingSize: { default: 330, description: '一罐（约330ml）' }, ai: { keywords: ['可乐', 'coke', 'cola'], confidence: 0.96 } },
  { id: 'food_059', name: '雪碧', nameEn: 'Sprite', category: 'beverages', icon: '🥤', nutrition: { calories: 39, protein: 0, fat: 0, carbs: 9.6, fiber: 0, sugar: 9.6, sodium: 6 }, servingSize: { default: 330, description: '一罐（约330ml）' }, ai: { keywords: ['雪碧', 'sprite'], confidence: 0.96 } },
  { id: 'food_060', name: '绿茶', nameEn: 'Green Tea', category: 'beverages', icon: '🍵', nutrition: { calories: 1, protein: 0, fat: 0, carbs: 0.2, fiber: 0, sugar: 0, sodium: 1 }, servingSize: { default: 250, description: '一杯（约250ml）' }, ai: { keywords: ['绿茶', 'green tea'], confidence: 0.97 } },
  { id: 'food_061', name: '红茶', nameEn: 'Black Tea', category: 'beverages', icon: '🍵', nutrition: { calories: 2, protein: 0, fat: 0, carbs: 0.5, fiber: 0, sugar: 0, sodium: 2 }, servingSize: { default: 250, description: '一杯（约250ml）' }, ai: { keywords: ['红茶', 'black tea'], confidence: 0.97 } },
  { id: 'food_062', name: '咖啡', nameEn: 'Coffee', category: 'beverages', icon: '☕', nutrition: { calories: 2, protein: 0.3, fat: 0, carbs: 0, fiber: 0, sugar: 0, sodium: 5 }, servingSize: { default: 240, description: '一杯美式咖啡（约240ml）' }, ai: { keywords: ['咖啡', '美式咖啡', 'coffee'], confidence: 0.97 } },
  { id: 'food_063', name: '拿铁咖啡', nameEn: 'Caffè Latte', category: 'beverages', icon: '☕', nutrition: { calories: 67, protein: 3.4, fat: 3.6, carbs: 4.8, fiber: 0, sugar: 3.6, sodium: 53 }, servingSize: { default: 350, description: '一杯（约350ml）' }, ai: { keywords: ['拿铁', '拿铁咖啡', 'latte'], confidence: 0.95 } },
  
  // 奶茶
  { id: 'food_064', name: '珍珠奶茶', nameEn: 'Bubble Milk Tea', category: 'milkTea', icon: '🧋', nutrition: { calories: 260, protein: 2, fat: 4.5, carbs: 52, fiber: 1.5, sugar: 48, sodium: 120 }, servingSize: { default: 500, description: '一杯大杯（约500ml）' }, ai: { keywords: ['珍珠奶茶', '奶茶', 'bubble tea', 'milk tea'], confidence: 0.97 } },
  { id: 'food_065', name: '水果茶', nameEn: 'Fruit Tea', category: 'milkTea', icon: '🧋', nutrition: { calories: 120, protein: 0.5, fat: 0, carbs: 30, fiber: 1, sugar: 28, sodium: 10 }, servingSize: { default: 500, description: '一杯大杯（约500ml）' }, ai: { keywords: ['水果茶', 'fruit tea'], confidence: 0.95 } },
  { id: 'food_066', name: '芝芝莓莓', nameEn: 'Cheese Foam Strawberry Tea', category: 'milkTea', icon: '🧋', nutrition: { calories: 280, protein: 1.5, fat: 5, carbs: 58, fiber: 2, sugar: 52, sodium: 150 }, servingSize: { default: 500, description: '一杯大杯（约500ml）' }, ai: { keywords: ['芝芝莓莓', '芝士草莓', 'cheese foam'], confidence: 0.93 } },
  
  // 中式菜肴
  { id: 'food_067', name: '番茄炒蛋', nameEn: 'Tomato Scrambled Eggs', category: 'chineseDishes', icon: '🍳', nutrition: { calories: 138, protein: 8.5, fat: 8.2, carbs: 8.5, fiber: 0.8, sugar: 3.5, sodium: 280, cholesterol: 210 }, servingSize: { default: 200, description: '一盘（约200g）' }, ai: { keywords: ['番茄炒蛋', '西红柿炒鸡蛋', 'tomato egg'], confidence: 0.96 } },
  { id: 'food_068', name: '宫保鸡丁', nameEn: 'Kung Pao Chicken', category: 'chineseDishes', icon: '🍗', nutrition: { calories: 197, protein: 18, fat: 10, carbs: 10, fiber: 1.5, sugar: 5, sodium: 680, cholesterol: 95 }, servingSize: { default: 200, description: '一盘（约200g）' }, ai: { keywords: ['宫保鸡丁', '宫保鸡', 'kung pao chicken'], confidence: 0.95 } },
  { id: 'food_069', name: '红烧肉', nameEn: 'Braised Pork Belly', category: 'chineseDishes', icon: '🥘', nutrition: { calories: 358, protein: 12, fat: 28, carbs: 12, fiber: 0.5, sugar: 8, sodium: 520, cholesterol: 75 }, servingSize: { default: 150, description: '3-4块（约150g）' }, ai: { keywords: ['红烧肉', 'braised pork'], confidence: 0.96 } },
  { id: 'food_070', name: '鱼香肉丝', nameEn: 'Yu Xiang Shredded Pork', category: 'chineseDishes', icon: '🥢', nutrition: { calories: 182, protein: 14, fat: 9, carbs: 12, fiber: 1.2, sugar: 6, sodium: 620, cholesterol: 70 }, servingSize: { default: 200, description: '一盘（约200g）' }, ai: { keywords: ['鱼香肉丝', 'yu xiang pork'], confidence: 0.94 } },
  { id: 'food_071', name: '糖醋里脊', nameEn: 'Sweet and Sour Pork', category: 'chineseDishes', icon: '🍖', nutrition: { calories: 248, protein: 16, fat: 12, carbs: 22, fiber: 0.8, sugar: 15, sodium: 580, cholesterol: 85 }, servingSize: { default: 180, description: '一盘（约180g）' }, ai: { keywords: ['糖醋里脊', 'sweet sour pork'], confidence: 0.94 } },
  { id: 'food_072', name: '麻婆豆腐', nameEn: 'Mapo Tofu', category: 'chineseDishes', icon: '🧈', nutrition: { calories: 145, protein: 10, fat: 9, carbs: 6, fiber: 1.5, sugar: 2, sodium: 720, cholesterol: 15 }, servingSize: { default: 200, description: '一盘（约200g）' }, ai: { keywords: ['麻婆豆腐', 'mapo tofu'], confidence: 0.95 } },
  { id: 'food_073', name: '清炒油菜', nameEn: 'Stir-fried Bok Choy', category: 'chineseDishes', icon: '🥬', nutrition: { calories: 45, protein: 2.5, fat: 2.5, carbs: 3.5, fiber: 1.8, sugar: 1.2, sodium: 380, cholesterol: 0 }, servingSize: { default: 180, description: '一盘（约180g）' }, ai: { keywords: ['清炒油菜', '炒青菜', 'stir fry vegetables'], confidence: 0.92 } },
  { id: 'food_074', name: '蒸鱼', nameEn: 'Steamed Fish', category: 'chineseDishes', icon: '🐟', nutrition: { calories: 110, protein: 20, fat: 3, carbs: 0.5, fiber: 0, sugar: 0.3, sodium: 320, cholesterol: 65 }, servingSize: { default: 200, description: '一块（约200g）' }, ai: { keywords: ['蒸鱼', '清蒸鱼', 'steamed fish'], confidence: 0.95 } },
  { id: 'food_075', name: '酸辣土豆丝', nameEn: 'Hot and Sour Potato', category: 'chineseDishes', icon: '🥔', nutrition: { calories: 128, protein: 2.2, fat: 7, carbs: 15, fiber: 1.5, sugar: 1.8, sodium: 520, cholesterol: 0 }, servingSize: { default: 180, description: '一盘（约180g）' }, ai: { keywords: ['酸辣土豆丝', '土豆丝', 'hot sour potato'], confidence: 0.93 } },
  
  // 火锅
  { id: 'food_076', name: '麻辣火锅', nameEn: 'Spicy Hot Pot', category: 'hotpot', icon: '🍲', nutrition: { calories: 180, protein: 12, fat: 12, carbs: 8, fiber: 2, sugar: 3, sodium: 850, cholesterol: 85 }, servingSize: { default: 300, description: '一份蔬菜+肉（约300g）' }, ai: { keywords: ['麻辣火锅', '火锅', 'hot pot', 'spicy hot pot'], confidence: 0.96 } },
  { id: 'food_077', name: '鸳鸯锅', nameEn: 'Yinyang Hot Pot', category: 'hotpot', icon: '🍲', nutrition: { calories: 160, protein: 14, fat: 9, carbs: 10, fiber: 2.5, sugar: 3, sodium: 780, cholesterol: 90 }, servingSize: { default: 300, description: '一份（约300g）' }, ai: { keywords: ['鸳鸯锅', 'yin yang hot pot'], confidence: 0.94 } },
  { id: 'food_078', name: '涮羊肉', nameEn: 'Hot Pot Lamb', category: 'hotpot', icon: '🥩', nutrition: { calories: 210, protein: 22, fat: 13, carbs: 1, fiber: 0, sugar: 0, sodium: 620, cholesterol: 95 }, servingSize: { default: 150, description: '一份肉片（约150g）' }, ai: { keywords: ['涮羊肉', 'lamb hot pot'], confidence: 0.95 } },
  
  // 烧烤
  { id: 'food_079', name: '烤羊肉串', nameEn: 'Grilled Lamb Skewer', category: 'barbecue', icon: '🍢', nutrition: { calories: 217, protein: 18, fat: 15, carbs: 2, fiber: 0, sugar: 1, sodium: 480, cholesterol: 85 }, servingSize: { default: 80, description: '2串（约80g）' }, ai: { keywords: ['烤羊肉串', '羊肉串', 'lamb skewer', 'barbecue'], confidence: 0.96 } },
  { id: 'food_080', name: '烤牛排', nameEn: 'Grilled Steak', category: 'barbecue', icon: '🥩', nutrition: { calories: 271, protein: 26, fat: 18, carbs: 0, fiber: 0, sugar: 0, sodium: 58, cholesterol: 88 }, servingSize: { default: 200, description: '一块（约200g）' }, ai: { keywords: ['烤牛排', '牛排', 'grilled steak'], confidence: 0.96 } },
  { id: 'food_081', name: '烤鸡翅', nameEn: 'Grilled Chicken Wing', category: 'barbecue', icon: '🍗', nutrition: { calories: 229, protein: 23, fat: 14, carbs: 1.5, fiber: 0, sugar: 1, sodium: 420, cholesterol: 110 }, servingSize: { default: 100, description: '3-4个（约100g）' }, ai: { keywords: ['烤鸡翅', '鸡翅', 'grilled chicken wing'], confidence: 0.96 } },
  { id: 'food_082', name: '烤茄子', nameEn: 'Grilled Eggplant', category: 'barbecue', icon: '🍆', nutrition: { calories: 60, protein: 2, fat: 4, carbs: 5, fiber: 2.5, sugar: 2.5, sodium: 280, cholesterol: 0 }, servingSize: { default: 150, description: '一个（约150g）' }, ai: { keywords: ['烤茄子', 'grilled eggplant'], confidence: 0.94 } },
  
  // 西餐
  { id: 'food_083', name: '意大利面', nameEn: 'Spaghetti', category: 'westernFood', icon: '🍝', nutrition: { calories: 131, protein: 5, fat: 1.1, carbs: 25, fiber: 1.8, sugar: 0.6, sodium: 1, cholesterol: 0 }, servingSize: { default: 180, description: '一份（约180g熟重）' }, ai: { keywords: ['意大利面', '意面', 'spaghetti', 'pasta'], confidence: 0.96 } },
  { id: 'food_084', name: '牛排', nameEn: 'Steak', category: 'westernFood', icon: '🥩', nutrition: { calories: 271, protein: 26, fat: 18, carbs: 0, fiber: 0, sugar: 0, sodium: 58, cholesterol: 88 }, servingSize: { default: 200, description: '一块（约200g）' }, ai: { keywords: ['牛排', 'steak'], confidence: 0.96 } },
  { id: 'food_085', name: '汉堡', nameEn: 'Hamburger', category: 'westernFood', icon: '🍔', nutrition: { calories: 295, protein: 15, fat: 14, carbs: 30, fiber: 1.5, sugar: 5, sodium: 560, cholesterol: 42 }, servingSize: { default: 180, description: '一个（约180g）' }, ai: { keywords: ['汉堡', 'hamburger'], confidence: 0.97 } },
  { id: 'food_086', name: '披萨', nameEn: 'Pizza', category: 'westernFood', icon: '🍕', nutrition: { calories: 266, protein: 11, fat: 10, carbs: 33, fiber: 2.3, sugar: 4, sodium: 640, cholesterol: 18 }, servingSize: { default: 100, description: '一片（约100g）' }, ai: { keywords: ['披萨', 'pizza'], confidence: 0.97 } },
  { id: 'food_087', name: '沙拉', nameEn: 'Salad', category: 'westernFood', icon: '🥗', nutrition: { calories: 35, protein: 1.5, fat: 0.4, carbs: 6.5, fiber: 2.2, sugar: 2.5, sodium: 28, cholesterol: 0 }, servingSize: { default: 150, description: '一小碗（约150g）' }, ai: { keywords: ['沙拉', 'salad'], confidence: 0.96 } },
  
  // 快餐
  { id: 'food_088', name: '炸鸡', nameEn: 'Fried Chicken', category: 'fastFood', icon: '🍗', nutrition: { calories: 298, protein: 24, fat: 18, carbs: 9.4, fiber: 0.4, sugar: 0, sodium: 480, cholesterol: 95 }, servingSize: { default: 150, description: '一块（约150g）' }, ai: { keywords: ['炸鸡', 'fried chicken'], confidence: 0.97 } },
  { id: 'food_089', name: '薯条', nameEn: 'French Fries', category: 'fastFood', icon: '🍟', nutrition: { calories: 312, protein: 3.4, fat: 15, carbs: 41, fiber: 3.8, sugar: 0.3, sodium: 580, cholesterol: 0 }, servingSize: { default: 100, description: '中份（约100g）' }, ai: { keywords: ['薯条', 'french fries'], confidence: 0.97 } },
  { id: 'food_090', name: '热狗', nameEn: 'Hot Dog', category: 'fastFood', icon: '🌭', nutrition: { calories: 290, protein: 11, fat: 17, carbs: 24, fiber: 1.2, sugar: 4, sodium: 810, cholesterol: 45 }, servingSize: { default: 120, description: '一个（约120g）' }, ai: { keywords: ['热狗', 'hot dog'], confidence: 0.97 } },
  { id: 'food_091', name: '薯条套餐', nameEn: 'Fries Combo', category: 'fastFood', icon: '🍔', nutrition: { calories: 850, protein: 22, fat: 35, carbs: 115, fiber: 7, sugar: 15, sodium: 1600, cholesterol: 60 }, servingSize: { default: 500, description: '汉堡+薯条+可乐套餐' }, ai: { keywords: ['薯条套餐', 'combo', '套餐'], confidence: 0.94 } },
  
  // 零食
  { id: 'food_092', name: '薯片', nameEn: 'Chips', category: 'snacks', icon: '🍿', nutrition: { calories: 547, protein: 7, fat: 37, carbs: 47, fiber: 4.4, sugar: 0.5, sodium: 525, cholesterol: 0 }, servingSize: { default: 50, description: '一小袋（约50g）' }, ai: { keywords: ['薯片', 'chips'], confidence: 0.97 } },
  { id: 'food_093', name: '坚果', nameEn: 'Nuts', category: 'snacks', icon: '🥜', nutrition: { calories: 607, protein: 20, fat: 54, carbs: 12, fiber: 8.7, sugar: 2.3, sodium: 3, cholesterol: 0 }, servingSize: { default: 30, description: '一小把（约30g）' }, ai: { keywords: ['坚果', 'mixed nuts'], confidence: 0.96 } },
  { id: 'food_094', name: '饼干', nameEn: 'Biscuit', category: 'snacks', icon: '🍪', nutrition: { calories: 446, protein: 6.5, fat: 16, carbs: 69, fiber: 2.1, sugar: 20, sodium: 300, cholesterol: 5 }, servingSize: { default: 50, description: '5-6片（约50g）' }, ai: { keywords: ['饼干', 'biscuit', 'cookies'], confidence: 0.96 } },
  { id: 'food_095', name: '巧克力', nameEn: 'Chocolate', category: 'snacks', icon: '🍫', nutrition: { calories: 546, protein: 5, fat: 31, carbs: 60, fiber: 3.4, sugar: 52, sodium: 24, cholesterol: 8 }, servingSize: { default: 30, description: '一小块（约30g）' }, ai: { keywords: ['巧克力', 'chocolate'], confidence: 0.97 } },
  { id: 'food_096', name: '爆米花', nameEn: 'Popcorn', category: 'snacks', icon: '🍿', nutrition: { calories: 387, protein: 13, fat: 4.5, carbs: 78, fiber: 15, sugar: 0.9, sodium: 8, cholesterol: 0 }, servingSize: { default: 30, description: '一小桶（约30g）' }, ai: { keywords: ['爆米花', 'popcorn'], confidence: 0.95 } },
  
  // 甜点
  { id: 'food_097', name: '冰淇淋', nameEn: 'Ice Cream', category: 'desserts', icon: '🍦', nutrition: { calories: 207, protein: 3.5, fat: 11, carbs: 24, fiber: 0.5, sugar: 21, sodium: 53, cholesterol: 44 }, servingSize: { default: 100, description: '一球（约100g）' }, ai: { keywords: ['冰淇淋', 'ice cream'], confidence: 0.97 } },
  { id: 'food_098', name: '布丁', nameEn: 'Pudding', category: 'desserts', icon: '🍮', nutrition: { calories: 130, protein: 3.5, fat: 3, carbs: 22, fiber: 0, sugar: 18, sodium: 120, cholesterol: 15 }, servingSize: { default: 120, description: '一杯（约120g）' }, ai: { keywords: ['布丁', 'pudding'], confidence: 0.96 } },
  { id: 'food_099', name: '提拉米苏', nameEn: 'Tiramisu', category: 'desserts', icon: '🍰', nutrition: { calories: 324, protein: 6, fat: 17, carbs: 36, fiber: 0.7, sugar: 28, sodium: 120, cholesterol: 95 }, servingSize: { default: 100, description: '一块（约100g）' }, ai: { keywords: ['提拉米苏', 'tiramisu'], confidence: 0.96 } },
  { id: 'food_100', name: '芝士蛋糕', nameEn: 'Cheesecake', category: 'desserts', icon: '🍰', nutrition: { calories: 321, protein: 6, fat: 21, carbs: 28, fiber: 0.3, sugar: 22, sodium: 250, cholesterol: 80 }, servingSize: { default: 100, description: '一块（约100g）' }, ai: { keywords: ['芝士蛋糕', 'cheesecake'], confidence: 0.96 } },
  
  // 调味品
  { id: 'food_101', name: '食用油', nameEn: 'Cooking Oil', category: 'condiments', icon: '🛢️', nutrition: { calories: 884, protein: 0, fat: 100, carbs: 0, fiber: 0, sugar: 0, sodium: 0, cholesterol: 0 }, servingSize: { default: 10, description: '一汤匙（约10g）' }, ai: { keywords: ['食用油', '油', 'cooking oil'], confidence: 0.95 } },
  { id: 'food_102', name: '酱油', nameEn: 'Soy Sauce', category: 'condiments', icon: '🧂', nutrition: { calories: 53, protein: 8.1, fat: 0, carbs: 4.9, fiber: 0.8, sugar: 0.4, sodium: 5493, cholesterol: 0 }, servingSize: { default: 15, description: '一汤匙（约15ml）' }, ai: { keywords: ['酱油', 'soy sauce'], confidence: 0.96 } },
  { id: 'food_103', name: '盐', nameEn: 'Salt', category: 'condiments', icon: '🧂', nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sugar: 0, sodium: 38758, cholesterol: 0 }, servingSize: { default: 2, description: '一小撮（约2g）' }, ai: { keywords: ['盐', 'salt'], confidence: 0.97 } },
  { id: 'food_104', name: '糖', nameEn: 'Sugar', category: 'condiments', icon: '🍬', nutrition: { calories: 387, protein: 0, fat: 0, carbs: 100, fiber: 0, sugar: 100, sodium: 1, cholesterol: 0 }, servingSize: { default: 10, description: '一茶匙（约10g）' }, ai: { keywords: ['糖', 'sugar'], confidence: 0.97 } },
  { id: 'food_105', name: '醋', nameEn: 'Vinegar', category: 'condiments', icon: '🍶', nutrition: { calories: 21, protein: 0, fat: 0, carbs: 0.9, fiber: 0, sugar: 0.4, sodium: 2, cholesterol: 0 }, servingSize: { default: 15, description: '一汤匙（约15ml）' }, ai: { keywords: ['醋', 'vinegar'], confidence: 0.96 } },
  
  // 豆制品
  { id: 'food_106', name: '豆腐', nameEn: 'Tofu', category: 'dairy', icon: '🧈', nutrition: { calories: 76, protein: 8, fat: 4.8, carbs: 1.9, fiber: 0.3, sugar: 0.6, sodium: 7, cholesterol: 0 }, servingSize: { default: 100, description: '一块（约100g）' }, ai: { keywords: ['豆腐', 'tofu'], confidence: 0.97 } },
  { id: 'food_107', name: '豆浆', nameEn: 'Soy Milk', category: 'beverages', icon: '🥛', nutrition: { calories: 33, protein: 2.9, fat: 1.6, carbs: 1.2, fiber: 0.3, sugar: 0.6, sodium: 4, cholesterol: 0 }, servingSize: { default: 300, description: '一杯（约300ml）' }, ai: { keywords: ['豆浆', 'soy milk'], confidence: 0.96 } },
  
  // 面食类
  { id: 'food_108', name: '面条', nameEn: 'Noodles', category: 'noodles', icon: '🍜', nutrition: { calories: 284, protein: 10, fat: 0.9, carbs: 59, fiber: 2.4, sugar: 0.8, sodium: 4, cholesterol: 0 }, servingSize: { default: 200, description: '一碗（约200g熟重）' }, ai: { keywords: ['面条', '挂面', 'noodles'], confidence: 0.96 } },
  { id: 'food_109', name: '方便面', nameEn: 'Instant Noodles', category: 'fastFood', icon: '🍜', nutrition: { calories: 436, protein: 9.4, fat: 17, carbs: 61, fiber: 4.2, sugar: 2, sodium: 1630, cholesterol: 0 }, servingSize: { default: 85, description: '一包（约85g）' }, ai: { keywords: ['方便面', '泡面', 'instant noodles'], confidence: 0.97 } },
  
  // 更多常见食物
  { id: 'food_110', name: '茄子', nameEn: 'Eggplant', category: 'vegetables', icon: '🍆', nutrition: { calories: 25, protein: 1, fat: 0.2, carbs: 6, fiber: 3, sugar: 3.5, sodium: 2, cholesterol: 0 }, servingSize: { default: 150, description: '一个中等茄子（约150g）' }, ai: { keywords: ['茄子', 'eggplant'], confidence: 0.97 } },
  { id: 'food_111', name: '生菜', nameEn: 'Lettuce', category: 'vegetables', icon: '🥬', nutrition: { calories: 15, protein: 1.4, fat: 0.2, carbs: 2.9, fiber: 1.3, sugar: 0.8, sodium: 28, cholesterol: 0 }, servingSize: { default: 100, description: '几片叶子（约100g）' }, ai: { keywords: ['生菜', 'lettuce'], confidence: 0.96 } },
  { id: 'food_112', name: '桃子', nameEn: 'Peach', category: 'fruits', icon: '🍑', nutrition: { calories: 39, protein: 0.9, fat: 0.1, carbs: 10, fiber: 1.5, sugar: 8.4, sodium: 0, cholesterol: 0 }, servingSize: { default: 150, description: '一个中等桃子（约150g）' }, ai: { keywords: ['桃子', 'peach'], confidence: 0.97 } },
  { id: 'food_113', name: '梨', nameEn: 'Pear', category: 'fruits', icon: '🍐', nutrition: { calories: 42, protein: 0.4, fat: 0.2, carbs: 11, fiber: 3.6, sugar: 7.9, sodium: 1, cholesterol: 0 }, servingSize: { default: 180, description: '一个中等梨（约180g）' }, ai: { keywords: ['梨', 'pear'], confidence: 0.97 } },
  { id: 'food_114', name: '菠萝', nameEn: 'Pineapple', category: 'fruits', icon: '🍍', nutrition: { calories: 50, protein: 0.5, fat: 0.1, carbs: 13, fiber: 1.4, sugar: 9.9, sodium: 1, cholesterol: 0 }, servingSize: { default: 150, description: '一片（约150g）' }, ai: { keywords: ['菠萝', 'pineapple'], confidence: 0.97 } },
  { id: 'food_115', name: '哈密瓜', nameEn: 'Hami Melon', category: 'fruits', icon: '🍈', nutrition: { calories: 34, protein: 0.5, fat: 0.1, carbs: 8, fiber: 0.8, sugar: 7.9, sodium: 1, cholesterol: 0 }, servingSize: { default: 200, description: '一块（约200g）' }, ai: { keywords: ['哈密瓜', '蜜瓜', 'hami melon'], confidence: 0.95 } },
  
  // 更多鱼类
  { id: 'food_116', name: '金枪鱼', nameEn: 'Tuna', category: 'seafood', icon: '🐟', nutrition: { calories: 132, protein: 28, fat: 1.5, carbs: 0, fiber: 0, sugar: 0, sodium: 50, cholesterol: 45 }, servingSize: { default: 100, description: '一块（约100g）' }, ai: { keywords: ['金枪鱼', 'tuna'], confidence: 0.96 } },
  { id: 'food_117', name: '鳕鱼', nameEn: 'Cod', category: 'seafood', icon: '🐟', nutrition: { calories: 82, protein: 18, fat: 0.7, carbs: 0, fiber: 0, sugar: 0, sodium: 54, cholesterol: 40 }, servingSize: { default: 120, description: '一块（约120g）' }, ai: { keywords: ['鳕鱼', 'cod'], confidence: 0.95 } },
  { id: 'food_118', name: '生蚝', nameEn: 'Oyster', category: 'seafood', icon: '🦪', nutrition: { calories: 68, protein: 7, fat: 2.5, carbs: 3.9, fiber: 0, sugar: 0.5, sodium: 280, cholesterol: 50 }, servingSize: { default: 100, description: '3-4个（约100g）' }, ai: { keywords: ['生蚝', '牡蛎', 'oyster'], confidence: 0.95 } },
  { id: 'food_119', name: '鲍鱼', nameEn: 'Abalone', category: 'seafood', icon: '🐚', nutrition: { calories: 84, protein: 17, fat: 1.5, carbs: 0.8, fiber: 0, sugar: 0, sodium: 260, cholesterol: 45 }, servingSize: { default: 50, description: '一个（约50g）' }, ai: { keywords: ['鲍鱼', 'abalone'], confidence: 0.95 } },
  
  // 更多蛋类
  { id: 'food_120', name: '鹌鹑蛋', nameEn: 'Quail Eggs', category: 'eggs', icon: '🥚', nutrition: { calories: 158, protein: 13, fat: 11, carbs: 0.7, fiber: 0, sugar: 0.7, sodium: 106, cholesterol: 515 }, servingSize: { default: 50, description: '5-6个（约50g）' }, ai: { keywords: ['鹌鹑蛋', 'quail eggs'], confidence: 0.95 } },
  
  // 更多果汁
  { id: 'food_121', name: '橙汁', nameEn: 'Orange Juice', category: 'juice', icon: '🧃', nutrition: { calories: 45, protein: 0.7, fat: 0.2, carbs: 10.4, fiber: 0.2, sugar: 8.4, sodium: 1 }, servingSize: { default: 250, description: '一杯（约250ml）' }, ai: { keywords: ['橙汁', 'orange juice'], confidence: 0.97 } },
  { id: 'food_122', name: '苹果汁', nameEn: 'Apple Juice', category: 'juice', icon: '🧃', nutrition: { calories: 46, protein: 0.1, fat: 0.1, carbs: 11.3, fiber: 0.1, sugar: 10.2, sodium: 4 }, servingSize: { default: 250, description: '一杯（约250ml）' }, ai: { keywords: ['苹果汁', 'apple juice'], confidence: 0.96 } },
  { id: 'food_123', name: '椰子水', nameEn: 'Coconut Water', category: 'juice', icon: '🥥', nutrition: { calories: 19, protein: 0.7, fat: 0.2, carbs: 3.7, fiber: 1.1, sugar: 2.6, sodium: 105 }, servingSize: { default: 250, description: '一个椰子（约250ml）' }, ai: { keywords: ['椰子水', 'coconut water'], confidence: 0.95 } },
  { id: 'food_124', name: '柠檬水', nameEn: 'Lemonade', category: 'beverages', icon: '🍋', nutrition: { calories: 40, protein: 0.2, fat: 0, carbs: 10.6, fiber: 0.2, sugar: 8.4, sodium: 2 }, servingSize: { default: 300, description: '一杯（约300ml）' }, ai: { keywords: ['柠檬水', 'lemonade'], confidence: 0.95 } },
  
  // 更多调味品
  { id: 'food_125', name: '番茄酱', nameEn: 'Ketchup', category: 'condiments', icon: '🍅', nutrition: { calories: 112, protein: 1.7, fat: 0.1, carbs: 26, fiber: 1.5, sugar: 22, sodium: 1040 }, servingSize: { default: 15, description: '一汤匙（约15g）' }, ai: { keywords: ['番茄酱', 'ketchup'], confidence: 0.96 } },
  { id: 'food_126', name: '沙拉酱', nameEn: 'Mayonnaise', category: 'condiments', icon: '🥚', nutrition: { calories: 680, protein: 1, fat: 75, carbs: 1, fiber: 0, sugar: 0.5, sodium: 530 }, servingSize: { default: 15, description: '一汤匙（约15g）' }, ai: { keywords: ['沙拉酱', 'mayonnaise', '蛋黄酱'], confidence: 0.95 } },
  { id: 'food_127', name: '辣椒油', nameEn: 'Chili Oil', category: 'condiments', icon: '🌶️', nutrition: { calories: 884, protein: 0, fat: 100, carbs: 0, fiber: 0, sugar: 0, sodium: 2800 }, servingSize: { default: 5, description: '半汤匙（约5g）' }, ai: { keywords: ['辣椒油', 'chili oil'], confidence: 0.95 } },
  { id: 'food_128', name: '芝麻酱', nameEn: 'Sesame Paste', category: 'condiments', icon: '🥜', nutrition: { calories: 586, protein: 21, fat: 54, carbs: 11, fiber: 9, sugar: 0.5, sodium: 9 }, servingSize: { default: 15, description: '一汤匙（约15g）' }, ai: { keywords: ['芝麻酱', 'sesame paste'], confidence: 0.95 } },
  { id: 'food_129', name: '花生酱', nameEn: 'Peanut Butter', category: 'condiments', icon: '🥜', nutrition: { calories: 598, protein: 25, fat: 52, carbs: 15, fiber: 6, sugar: 9, sodium: 459 }, servingSize: { default: 15, description: '一汤匙（约15g）' }, ai: { keywords: ['花生酱', 'peanut butter'], confidence: 0.96 } },

  // 中式菜肴补充
  { id: 'food_130', name: '糖醋排骨', nameEn: 'Sweet and Sour Ribs', category: 'chineseDishes', icon: '🍖', nutrition: { calories: 260, protein: 18, fat: 14, carbs: 18, fiber: 0.5, sugar: 12, sodium: 480, cholesterol: 80 }, servingSize: { default: 200, description: '一盘（约200g）' }, ai: { keywords: ['糖醋排骨', '糖醋小排', 'sweet sour ribs'], confidence: 0.94 } },
  { id: 'food_131', name: '蛋炒饭', nameEn: 'Egg Fried Rice', category: 'chineseDishes', icon: '🍚', nutrition: { calories: 220, protein: 8, fat: 8, carbs: 30, fiber: 0.5, sugar: 1, sodium: 420, cholesterol: 55 }, servingSize: { default: 250, description: '一份蛋炒饭（约250g）' }, ai: { keywords: ['蛋炒饭', '炒饭', 'fried rice'], confidence: 0.95 } },
  { id: 'food_132', name: '米饭', nameEn: 'White Rice', category: 'noodles', icon: '🍚', nutrition: { calories: 116, protein: 2.6, fat: 0.3, carbs: 25.6, fiber: 0.3, sugar: 0.1, sodium: 1, cholesterol: 0 }, servingSize: { default: 200, description: '一碗米饭（约200g）' }, ai: { keywords: ['米饭', '白米饭', 'rice'], confidence: 0.98 } },
  { id: 'food_133', name: '饺子', nameEn: 'Dumplings', category: 'chineseDishes', icon: '🥟', nutrition: { calories: 185, protein: 8, fat: 7, carbs: 22, fiber: 1.2, sugar: 0.5, sodium: 380, cholesterol: 25 }, servingSize: { default: 150, description: '6-8个（约150g）' }, ai: { keywords: ['饺子', '水饺', 'dumplings'], confidence: 0.96 } },
  { id: 'food_134', name: '馄饨', nameEn: 'Wonton', category: 'chineseDishes', icon: '🥟', nutrition: { calories: 160, protein: 7, fat: 5, carbs: 22, fiber: 1, sugar: 0.3, sodium: 420, cholesterol: 20 }, servingSize: { default: 180, description: '一碗（约180g）' }, ai: { keywords: ['馄饨', '云吞', 'wonton'], confidence: 0.95 } },
  { id: 'food_135', name: '包子', nameEn: 'Steamed Bun', category: 'chineseDishes', icon: '🥟', nutrition: { calories: 180, protein: 7, fat: 4, carbs: 30, fiber: 1.5, sugar: 1, sodium: 320, cholesterol: 10 }, servingSize: { default: 100, description: '一个包子（约100g）' }, ai: { keywords: ['包子', 'steamed bun'], confidence: 0.96 } },
  { id: 'food_136', name: '馒头', nameEn: 'Steamed Bread', category: 'noodles', icon: '🍞', nutrition: { calories: 221, protein: 7, fat: 1, carbs: 45, fiber: 1.5, sugar: 0.5, sodium: 165, cholesterol: 0 }, servingSize: { default: 100, description: '一个馒头（约100g）' }, ai: { keywords: ['馒头', 'steamed bread'], confidence: 0.96 } },
  { id: 'food_137', name: '粥', nameEn: 'Congee', category: 'chineseDishes', icon: '🥣', nutrition: { calories: 58, protein: 1.5, fat: 0.2, carbs: 12, fiber: 0.1, sugar: 0, sodium: 3, cholesterol: 0 }, servingSize: { default: 300, description: '一碗粥（约300ml）' }, ai: { keywords: ['粥', '稀饭', 'congee', 'porridge'], confidence: 0.96 } },
  { id: 'food_138', name: '炒面', nameEn: 'Chow Mein', category: 'noodles', icon: '🍜', nutrition: { calories: 210, protein: 8, fat: 7, carbs: 30, fiber: 2, sugar: 1.5, sodium: 480, cholesterol: 15 }, servingSize: { default: 250, description: '一盘炒面（约250g）' }, ai: { keywords: ['炒面', 'chow mein', 'fried noodles'], confidence: 0.95 } },
  { id: 'food_139', name: '排骨', nameEn: 'Pork Ribs', category: 'meat', icon: '🍖', nutrition: { calories: 280, protein: 20, fat: 22, carbs: 0, fiber: 0, sugar: 0, sodium: 75, cholesterol: 95 }, servingSize: { default: 150, description: '3-4块排骨（约150g）' }, ai: { keywords: ['排骨', 'ribs', 'pork ribs'], confidence: 0.95 } },

  // 更多常见蔬菜
  { id: 'food_140', name: '西红柿', nameEn: 'Tomato', category: 'vegetables', icon: '🍅', nutrition: { calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9, fiber: 1.2, sugar: 2.6, sodium: 5, cholesterol: 0 }, servingSize: { default: 150, description: '一个中等西红柿（约150g）' }, ai: { keywords: ['西红柿', '番茄', 'tomato'], confidence: 0.98 } },
  { id: 'food_141', name: '西兰花', nameEn: 'Broccoli', category: 'vegetables', icon: '🥦', nutrition: { calories: 34, protein: 2.8, fat: 0.4, carbs: 7, fiber: 2.6, sugar: 1.7, sodium: 33, cholesterol: 0 }, servingSize: { default: 100, description: '一小颗（约100g）' }, ai: { keywords: ['西兰花', 'broccoli'], confidence: 0.97 } },
  { id: 'food_142', name: '黄瓜', nameEn: 'Cucumber', category: 'vegetables', icon: '🥒', nutrition: { calories: 15, protein: 0.7, fat: 0.1, carbs: 3.6, fiber: 0.5, sugar: 1.7, sodium: 2, cholesterol: 0 }, servingSize: { default: 100, description: '半根黄瓜（约100g）' }, ai: { keywords: ['黄瓜', 'cucumber'], confidence: 0.97 } },
  { id: 'food_143', name: '玉米', nameEn: 'Corn', category: 'vegetables', icon: '🌽', nutrition: { calories: 96, protein: 3.3, fat: 1.2, carbs: 21, fiber: 2.4, sugar: 4.5, sodium: 1, cholesterol: 0 }, servingSize: { default: 150, description: '一根玉米（约150g）' }, ai: { keywords: ['玉米', 'corn', 'sweet corn'], confidence: 0.97 } },

  // 更多常见中式菜肴
  { id: 'food_144', name: '牛肉面', nameEn: 'Beef Noodle Soup', category: 'noodles', icon: '🍜', nutrition: { calories: 120, protein: 6, fat: 2.5, carbs: 18, fiber: 0.5, sugar: 0.5, sodium: 450, cholesterol: 10 }, servingSize: { default: 400, description: '一碗（约400g）' }, ai: { keywords: ['牛肉面', '牛肉麵', 'beef noodle soup'], confidence: 0.95 } },
  { id: 'food_145', name: '拉面', nameEn: 'Lamian Noodles', category: 'noodles', icon: '🍜', nutrition: { calories: 130, protein: 5, fat: 3, carbs: 22, fiber: 0.8, sugar: 0.3, sodium: 380, cholesterol: 5 }, servingSize: { default: 350, description: '一碗（约350g）' }, ai: { keywords: ['拉面', '拉麵', 'lamian noodles'], confidence: 0.95 } },
  { id: 'food_146', name: '炸酱面', nameEn: 'Zhajiang Noodles', category: 'noodles', icon: '🍜', nutrition: { calories: 190, protein: 8, fat: 6, carbs: 28, fiber: 2, sugar: 2, sodium: 520, cholesterol: 15 }, servingSize: { default: 300, description: '一碗（约300g）' }, ai: { keywords: ['炸酱面', '炸醬麵', 'zhajiang noodles'], confidence: 0.94 } },
];

// Merge with new food data (deduplicate by name, legacy items take priority)
const legacyNames = new Set(LEGACY_FOODS.map(f => f.name));
const uniqueNewFoods = FOOD_DATA
  .filter(f => !legacyNames.has(f.name))
  .map((f, i) => ({ ...f, id: `food_${String(LEGACY_FOODS.length + i + 1).padStart(3, '0')}` }));
export const FOODS_DATABASE: FoodItem[] = [...LEGACY_FOODS, ...uniqueNewFoods];

export const getFoodsByCategory = (category: FoodCategory): FoodItem[] => {
  return FOODS_DATABASE.filter(food => food.category === category);
};

export const searchFoods = (query: string): FoodItem[] => {
  const lowerQuery = query.toLowerCase();
  return FOODS_DATABASE.filter(food => 
    food.name.toLowerCase().includes(lowerQuery) ||
    food.nameEn.toLowerCase().includes(lowerQuery) ||
    food.ai.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
  );
};

export const getFoodById = (id: string): FoodItem | undefined => {
  return FOODS_DATABASE.find(food => food.id === id);
};
