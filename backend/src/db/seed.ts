import { getDb, closeDb } from '../config/database';
import { hashPassword } from '../utils/hash';
import { generateId } from '../utils/uuid';
import { logger } from '../utils/logger';

export async function seedDatabase(): Promise<void> {
  const db = getDb();

  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@healthapp.com');

  if (!existingAdmin) {
    const adminId = generateId();
    const adminPasswordHash = await hashPassword('admin123');

  db.prepare(`
    INSERT INTO users (id, email, password_hash, nickname, role)
    VALUES (?, ?, ?, ?, 'admin')
  `).run(adminId, 'admin@healthapp.com', adminPasswordHash, '管理员');

  db.prepare(`
    INSERT INTO user_profiles (user_id, height, weight, age, gender, goal, activity_level, daily_calorie_target)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(adminId, 175, 70, 30, 'male', 'maintain', 'moderate', 2200);

  // Sample recipes
  const sampleRecipes = [
    { id: generateId(), name: '鸡胸肉沙拉', category: '减脂餐', cover_emoji: '🥗', calories: 280, protein: 35, carbs: 12, fat: 8, cook_time: 15, servings: 1, difficulty: 'easy', ingredients: JSON.stringify(['鸡胸肉 150g', '生菜 100g', '小番茄 50g', '黄瓜 50g', '橄榄油 10ml']), steps: JSON.stringify(['鸡胸肉煎熟切片', '蔬菜洗净切好', '摆盘淋油']), tags: JSON.stringify(['减脂', '高蛋白', '快手']) },
    { id: generateId(), name: '紫薯燕麦早餐碗', category: '健康早餐', cover_emoji: '🥣', calories: 320, protein: 12, carbs: 45, fat: 10, cook_time: 10, servings: 1, difficulty: 'easy', ingredients: JSON.stringify(['紫薯 100g', '燕麦 40g', '酸奶 150ml', '坚果 15g']), steps: JSON.stringify(['紫薯蒸熟压泥', '燕麦泡好', '摆碗淋蜂蜜']), tags: JSON.stringify(['早餐', '高纤维', '抗氧化']) },
    { id: generateId(), name: '牛排糙米饭', category: '增肌餐', cover_emoji: '🥩', calories: 520, protein: 42, carbs: 48, fat: 18, cook_time: 25, servings: 1, difficulty: 'medium', ingredients: JSON.stringify(['牛排 200g', '糙米 100g', '西兰花 80g', '橄榄油 10ml']), steps: JSON.stringify(['糙米煮熟', '牛排煎至五分熟', '西兰花焯水摆盘']), tags: JSON.stringify(['增肌', '高蛋白', '牛排']) },
    { id: generateId(), name: '番茄鸡蛋面', category: '家常菜', cover_emoji: '🍜', calories: 420, protein: 18, carbs: 52, fat: 14, cook_time: 20, servings: 1, difficulty: 'easy', ingredients: JSON.stringify(['挂面 100g', '番茄 2个', '鸡蛋 2个', '葱花 适量']), steps: JSON.stringify(['番茄切块', '炒鸡蛋盛出', '炒番茄出汁加水', '煮面调味']), tags: JSON.stringify(['家常菜', '面食', '快手']) },
    { id: generateId(), name: '香煎三文鱼碗', category: '增肌餐', cover_emoji: '🐟', calories: 580, protein: 40, carbs: 42, fat: 24, cook_time: 20, servings: 1, difficulty: 'medium', ingredients: JSON.stringify(['三文鱼 150g', '牛油果 半个', '杂粮饭 120g', '芦笋 80g']), steps: JSON.stringify(['三文鱼煎熟', '牛油果切块', '芦笋焯水', '摆盘']), tags: JSON.stringify(['增肌', '三文鱼', '健康脂肪']) },
    { id: generateId(), name: '南瓜浓汤', category: '汤品', cover_emoji: '🎃', calories: 130, protein: 4, carbs: 25, fat: 3, cook_time: 25, servings: 2, difficulty: 'easy', ingredients: JSON.stringify(['南瓜 300g', '洋葱 半个', '蔬菜高汤 200ml', '南瓜籽 适量']), steps: JSON.stringify(['南瓜切块', '炒洋葱', '加高汤煮15分钟', '打成浓汤']), tags: JSON.stringify(['低卡', '汤品', '素食']) },
    { id: generateId(), name: '酸奶水果杯', category: '甜品', cover_emoji: '🍓', calories: 220, protein: 15, carbs: 28, fat: 6, cook_time: 5, servings: 1, difficulty: 'easy', ingredients: JSON.stringify(['希腊酸奶 200g', '草莓 50g', '蓝莓 30g', '格兰诺拉 20g']), steps: JSON.stringify(['水果洗净切块', '杯中分层', '撒麦片']), tags: JSON.stringify(['甜品', '低卡', '快手']) },
    { id: generateId(), name: '葱爆牛肉', category: '家常菜', cover_emoji: '🥩', calories: 380, protein: 38, carbs: 10, fat: 18, cook_time: 15, servings: 1, difficulty: 'medium', ingredients: JSON.stringify(['牛肉片 150g', '大葱 3根', '生抽 1汤匙', '蚝油 1茶匙']), steps: JSON.stringify(['牛肉腌制10分钟', '爆炒牛肉盛出', '炒葱', '混合调味']), tags: JSON.stringify(['增肌', '高蛋白', '中式']) },
  ];

  const insertRecipe = db.prepare(`
    INSERT INTO recipes (id, name, category, cover_emoji, calories, protein, carbs, fat, cook_time, servings, difficulty, ingredients, steps, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const r of sampleRecipes) {
    insertRecipe.run(r.id, r.name, r.category, r.cover_emoji, r.calories, r.protein, r.carbs, r.fat, r.cook_time, r.servings, r.difficulty, r.ingredients, r.steps, r.tags);
  }

  logger.info(`Seed completed: admin user + ${sampleRecipes.length} sample recipes`);
  } else {
    logger.info('Admin seed data already exists, skipping');
  }

  // Seed sample blogger
  const existingBlogger = db.prepare('SELECT id FROM users WHERE email = ?').get('fitness@healthapp.com');
  if (!existingBlogger) {
    const bloggerId = generateId();
    const bloggerPassword = await hashPassword('blogger123');
    db.prepare(`
      INSERT INTO users (id, email, password_hash, nickname, role)
      VALUES (?, ?, ?, ?, 'fitness_blogger')
    `).run(bloggerId, 'fitness@healthapp.com', bloggerPassword, '健身教练阿杰');

    db.prepare(`
      INSERT INTO user_profiles (user_id, height, weight, age, gender, goal, activity_level, daily_calorie_target)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(bloggerId, 178, 75, 32, 'male', 'maintain', 'very_active', 2600);

    db.prepare(`
      INSERT INTO blogger_applications (id, user_id, blogger_type, display_name, bio, status)
      VALUES (?, ?, 'fitness', '健身教练阿杰', 'ACE认证私教，帮助10万+用户达成健身目标', 'approved')
    `).run(generateId(), bloggerId);

    db.prepare(`
      INSERT INTO blogger_stats (user_id, recipes_count, courses_count, followers_count, total_views, total_likes)
      VALUES (?, 20, 10, 45000, 450000, 56000)
    `).run(bloggerId);

    // Sample courses for the blogger
    const sampleCourses = [
      { title: '全身燃脂HIIT训练', category: '减脂', difficulty: 'beginner', duration: 20, calories: 280, cover_emoji: '🔥', is_free: 1, description: '20分钟高效燃脂，适合零基础。跟随专业教练，在家就能完成的高强度间歇训练。' },
      { title: '胸肌雕刻训练', category: '增肌', difficulty: 'intermediate', duration: 35, calories: 320, cover_emoji: '💪', is_free: 1, description: '专业增肌训练，4周打造饱满胸肌。包含上胸、中胸、下胸全方位训练方案。' },
      { title: '核心力量进阶训练', category: '增肌', difficulty: 'advanced', duration: 40, calories: 350, cover_emoji: '🎯', is_free: 1, description: '30天核心蜕变计划，从平板支撑到高阶核心动作。' },
      { title: '私人定制增肌计划', category: '增肌', difficulty: 'intermediate', duration: 45, calories: 400, cover_emoji: '📋', is_free: 0, is_member_only: 1, description: '30天定制增肌计划，含饮食方案和训练视频。' },
    ];

    const insertCourse = db.prepare(`
      INSERT INTO courses (id, creator_id, title, description, category, difficulty, duration, calories, is_free, is_member_only, cover_emoji, tags, stats)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const c of sampleCourses) {
      insertCourse.run(
        generateId(), bloggerId, c.title, c.description,
        c.category, c.difficulty, c.duration, c.calories,
        c.is_free, (c as any).is_member_only || 0,
        c.cover_emoji, '[]',
        JSON.stringify({ likes: Math.floor(Math.random() * 5000), collections: Math.floor(Math.random() * 3000), views: Math.floor(Math.random() * 50000) }),
      );
    }

    logger.info('Seed completed: sample blogger + courses');
  }
}

if (require.main === module) {
  (async () => {
    await seedDatabase();
    closeDb();
  })();
}
