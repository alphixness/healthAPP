import { create } from 'zustand';

export interface CreatorProfile {
  id: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  followers: number;
  recipes: number;
  courses: number;
  bio: string;
  tags: string[];
  hasShop: boolean;
  shopName?: string;
}

export interface VideoCourse {
  id: string;
  creator: CreatorProfile;
  title: string;
  coverEmoji: string;
  coverImage: string;
  videoUrl?: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  calories: number;
  isFree: boolean;
  isMemberOnly: boolean;
  rating: number;
  ratingCount: number;
  stats: {
    likes: number;
    collections: number;
    views: number;
  };
  isLiked: boolean;
  isCollected: boolean;
  tags: string[];
}

export interface MembershipTier {
  id: 'free' | 'premium';
  name: string;
  price: string;
  features: string[];
  icon: string;
}

const CREATORS: CreatorProfile[] = [
  { id: 'c1', name: '健身教练阿杰', avatar: '💪', isVerified: true, followers: 45000, recipes: 20, courses: 48, bio: 'ACE认证私教，帮助10万+用户达成健身目标', tags: ['健身教练', '增肌'], hasShop: false },
  { id: 'c2', name: '瑜伽老师Luna', avatar: '🧘‍♀️', isVerified: true, followers: 28000, recipes: 15, courses: 32, bio: 'RYT500认证瑜伽导师，身心平衡倡导者', tags: ['瑜伽', '冥想'], hasShop: false },
  { id: 'c3', name: '减脂小姐姐', avatar: '💃', isVerified: true, followers: 15600, recipes: 120, courses: 8, bio: '从140斤到100斤，分享我的减脂经验', tags: ['减脂', '健康饮食'], hasShop: false },
  { id: 'c4', name: '跑步达人老张', avatar: '🏃', isVerified: false, followers: 8900, recipes: 5, courses: 15, bio: '马拉松完赛者，分享跑步训练方法', tags: ['跑步', '有氧'], hasShop: false },
];

const COURSE_COVERS = [
  'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1540496905036-5937c10647cc?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1516307365426-bea591f05011?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
];
let _courseIdx = 0;
const CIMG = (_p?: string) => COURSE_COVERS[_courseIdx++ % COURSE_COVERS.length];

const FITNESS_COURSES: VideoCourse[] = [
  {
    id: 'fc1', creator: { id: 'c1', name: '健身教练阿杰', avatar: '💪', isVerified: true, followers: 45000, recipes: 20, courses: 48, bio: 'ACE认证私教，帮助10万+用户达成健身目标', tags: ['健身教练', '增肌'], hasShop: false }, title: '全身燃脂HIIT训练', coverEmoji: '🔥',
    coverImage: CIMG('person doing HIIT workout at home, fitness training, dynamic pose, bright gym background'),
    description: '20分钟高效燃脂，适合零基础。跟随专业教练，在家就能完成的高强度间歇训练。',
    category: '减脂', difficulty: 'beginner', duration: 20, calories: 280,
    isFree: true, isMemberOnly: false, rating: 4.9, ratingCount: 2340,
    stats: { likes: 5600, collections: 3200, views: 45000 },
    isLiked: false, isCollected: false, tags: ['HIIT', '燃脂', '零基础'],
  },
  {
    id: 'fc2', creator: { id: 'c2', name: '瑜伽老师Luna', avatar: '🧘‍♀️', isVerified: true, followers: 28000, recipes: 15, courses: 32, bio: 'RYT500认证瑜伽导师，身心平衡倡导者', tags: ['瑜伽', '冥想'], hasShop: false }, title: '晨间唤醒瑜伽', coverEmoji: '🌅',
    coverImage: CIMG('woman doing morning yoga sunrise, peaceful meditation, soft natural light, wellness'),
    description: '15分钟温柔唤醒身体，改善睡眠质量。每天早上跟练，精力充沛一整天。',
    category: '瑜伽', difficulty: 'beginner', duration: 15, calories: 80,
    isFree: true, isMemberOnly: false, rating: 4.8, ratingCount: 1890,
    stats: { likes: 4200, collections: 2800, views: 38000 },
    isLiked: false, isCollected: false, tags: ['瑜伽', '晨练', '放松'],
  },
  {
    id: 'fc3', creator: { id: 'c1', name: '健身教练阿杰', avatar: '💪', isVerified: true, followers: 45000, recipes: 20, courses: 48, bio: 'ACE认证私教，帮助10万+用户达成健身目标', tags: ['健身教练', '增肌'], hasShop: false }, title: '胸肌雕刻训练', coverEmoji: '💪',
    coverImage: CIMG('man doing chest press workout at gym, muscular fitness training, professional lighting'),
    description: '专业增肌训练，4周打造饱满胸肌。包含上胸、中胸、下胸全方位训练方案。',
    category: '增肌', difficulty: 'intermediate', duration: 35, calories: 320,
    isFree: true, isMemberOnly: false, rating: 4.9, ratingCount: 980,
    stats: { likes: 2100, collections: 1800, views: 15000 },
    isLiked: false, isCollected: false, tags: ['增肌', '胸肌', '力量训练'],
  },
  {
    id: 'fc4', creator: { id: 'c4', name: '跑步达人老张', avatar: '🏃', isVerified: false, followers: 8900, recipes: 5, courses: 15, bio: '马拉松完赛者，分享跑步训练方法', tags: ['跑步', '有氧'], hasShop: false }, title: '5公里跑步训练计划', coverEmoji: '🏃',
    coverImage: CIMG('person running in park sunny day, jogging fitness outdoor, athletic lifestyle'),
    description: '从走路到跑步，8周完成5公里。科学的渐进式训练，避免运动损伤。',
    category: '跑步', difficulty: 'beginner', duration: 30, calories: 250,
    isFree: true, isMemberOnly: false, rating: 4.7, ratingCount: 1560,
    stats: { likes: 3400, collections: 2100, views: 28000 },
    isLiked: false, isCollected: false, tags: ['跑步', '5K', '入门'],
  },
  {
    id: 'fc5', creator: { id: 'c2', name: '瑜伽老师Luna', avatar: '🧘‍♀️', isVerified: true, followers: 28000, recipes: 15, courses: 32, bio: 'RYT500认证瑜伽导师，身心平衡倡导者', tags: ['瑜伽', '冥想'], hasShop: false }, title: '深度冥想放松', coverEmoji: '🧘',
    coverImage: CIMG('person meditating in peaceful zen garden, mindfulness relaxation, soft natural light'),
    description: '10分钟正念冥想，缓解焦虑和压力。适合工作间隙或睡前练习。',
    category: '冥想', difficulty: 'beginner', duration: 10, calories: 15,
    isFree: true, isMemberOnly: false, rating: 4.9, ratingCount: 3200,
    stats: { likes: 6800, collections: 4500, views: 52000 },
    isLiked: false, isCollected: false, tags: ['冥想', '放松', '睡眠'],
  },
  {
    id: 'fc6', creator: { id: 'c1', name: '健身教练阿杰', avatar: '💪', isVerified: true, followers: 45000, recipes: 20, courses: 48, bio: 'ACE认证私教，帮助10万+用户达成健身目标', tags: ['健身教练', '增肌'], hasShop: false }, title: '核心力量进阶训练', coverEmoji: '🎯',
    coverImage: CIMG('athlete doing core plank exercise, abs workout training, fitness studio professional'),
    description: '30天核心蜕变计划，从平板支撑到高阶核心动作。打造稳定核心，提升运动表现。',
    category: '增肌', difficulty: 'advanced', duration: 40, calories: 350,
    isFree: true, isMemberOnly: false, rating: 4.8, ratingCount: 760,
    stats: { likes: 1800, collections: 1500, views: 12000 },
    isLiked: false, isCollected: false, tags: ['核心', '进阶', '力量'],
  },
  {
    id: 'fc7', creator: { id: 'c2', name: '瑜伽老师Luna', avatar: '🧘‍♀️', isVerified: true, followers: 28000, recipes: 15, courses: 32, bio: 'RYT500认证瑜伽导师，身心平衡倡导者', tags: ['瑜伽', '冥想'], hasShop: false }, title: '全身拉伸放松', coverEmoji: '🤸',
    coverImage: CIMG('full body stretching routine woman flexibility training, bright yoga studio, wellness lifestyle'),
    description: '15分钟全身拉伸，缓解肌肉酸痛、改善柔韧性。适合运动后或久坐办公后练习。',
    category: '拉伸', difficulty: 'beginner', duration: 15, calories: 50,
    isFree: true, isMemberOnly: false, rating: 4.7, ratingCount: 2100,
    stats: { likes: 4800, collections: 3600, views: 42000 },
    isLiked: false, isCollected: false, tags: ['拉伸', '柔韧性', '放松', '久坐'],
  },
  {
    id: 'fc8', creator: { id: 'c1', name: '健身教练阿杰', avatar: '💪', isVerified: true, followers: 45000, recipes: 20, courses: 48, bio: 'ACE认证私教，帮助10万+用户达成健身目标', tags: ['健身教练', '增肌'], hasShop: false }, title: '搏击燃脂操', coverEmoji: '🥊',
    coverImage: CIMG('boxing fitness workout class energetic people punching bags, gym studio, dynamic lighting'),
    description: '30分钟高强度搏击操，融合拳击和跆拳道动作。暴汗燃脂，释放压力，协调全身。',
    category: '减脂', difficulty: 'intermediate', duration: 30, calories: 360,
    isFree: true, isMemberOnly: false, rating: 4.9, ratingCount: 1800,
    stats: { likes: 6200, collections: 4100, views: 48000 },
    isLiked: false, isCollected: false, tags: ['搏击', '燃脂', '高强度', '减压'],
  },
  {
    id: 'fc9', creator: { id: 'c2', name: '瑜伽老师Luna', avatar: '🧘‍♀️', isVerified: true, followers: 28000, recipes: 15, courses: 32, bio: 'RYT500认证瑜伽导师，身心平衡倡导者', tags: ['瑜伽', '冥想'], hasShop: false }, title: '蜜桃臀塑造', coverEmoji: '🍑',
    coverImage: CIMG('woman doing glute bridge exercise at gym, lower body workout, fitness training, professional lighting'),
    description: '20分钟臀部专项训练，激活臀肌、塑造蜜桃曲线。包含深蹲、臀桥、后踢腿等经典动作。',
    category: '增肌', difficulty: 'beginner', duration: 20, calories: 180,
    isFree: true, isMemberOnly: false, rating: 4.8, ratingCount: 2900,
    stats: { likes: 7800, collections: 5400, views: 55000 },
    isLiked: false, isCollected: false, tags: ['臀部', '塑形', '下肢', '入门'],
  },
  {
    id: 'fc10', creator: { id: 'c4', name: '跑步达人老张', avatar: '🏃', isVerified: false, followers: 8900, recipes: 5, courses: 15, bio: '马拉松完赛者，分享跑步训练方法', tags: ['跑步', '有氧'], hasShop: false }, title: '10公里进阶跑', coverEmoji: '🏅',
    coverImage: CIMG('long distance runner on trail running race, endurance training, outdoor fitness'),
    description: '从5公里到10公里的进阶训练计划。科学提升耐力，配速策略，减少受伤风险。',
    category: '跑步', difficulty: 'intermediate', duration: 45, calories: 400,
    isFree: true, isMemberOnly: false, rating: 4.6, ratingCount: 680,
    stats: { likes: 1500, collections: 1100, views: 9800 },
    isLiked: false, isCollected: false, tags: ['跑步', '10K', '进阶', '耐力'],
  },
  {
    id: 'fc11', creator: { id: 'c3', name: '减脂小姐姐', avatar: '💃', isVerified: true, followers: 15600, recipes: 120, courses: 8, bio: '从140斤到100斤，分享我的减脂经验', tags: ['减脂', '健康饮食'], hasShop: false }, title: '7分钟科学晨练', coverEmoji: '🌞',
    coverImage: CIMG('morning exercise routine woman stretching by window sunrise, healthy lifestyle, home workout'),
    description: '高效7分钟晨间训练，科学编排12个动作。唤醒身体，提升全天代谢，坚持一周见效。',
    category: '减脂', difficulty: 'beginner', duration: 7, calories: 80,
    isFree: true, isMemberOnly: false, rating: 4.7, ratingCount: 3400,
    stats: { likes: 8900, collections: 6200, views: 68000 },
    isLiked: false, isCollected: false, tags: ['晨练', '高效', '代谢', '入门'],
  },
  {
    id: 'fc12', creator: { id: 'c2', name: '瑜伽老师Luna', avatar: '🧘‍♀️', isVerified: true, followers: 28000, recipes: 15, courses: 32, bio: 'RYT500认证瑜伽导师，身心平衡倡导者', tags: ['瑜伽', '冥想'], hasShop: false }, title: '睡前舒缓瑜伽', coverEmoji: '🌙',
    coverImage: CIMG('bedtime yoga stretching woman in bedroom moonlight, calm relaxation, peaceful atmosphere'),
    description: '10分钟睡前瑜伽序列，舒缓一天疲劳。改善睡眠质量，释放肩颈紧张。',
    category: '瑜伽', difficulty: 'beginner', duration: 10, calories: 35,
    isFree: true, isMemberOnly: false, rating: 4.9, ratingCount: 3800,
    stats: { likes: 9200, collections: 7100, views: 72000 },
    isLiked: false, isCollected: false, tags: ['瑜伽', '睡眠', '放松', '睡前'],
  },
  {
    id: 'fc13', creator: { id: 'c3', name: '减脂小姐姐', avatar: '💃', isVerified: true, followers: 15600, recipes: 120, courses: 8, bio: '从140斤到100斤，分享我的减脂经验', tags: ['减脂', '健康饮食'], hasShop: false }, title: 'Zumba舞蹈燃脂', coverEmoji: '💃',
    coverImage: CIMG('zumba dance fitness class people dancing latin music, energetic group workout, colorful studio'),
    description: '25分钟Zumba舞蹈操，拉丁音乐节奏。快乐燃脂，学会舞蹈步伐，瘦身不枯燥。',
    category: '舞蹈', difficulty: 'intermediate', duration: 25, calories: 280,
    isFree: true, isMemberOnly: false, rating: 4.8, ratingCount: 1600,
    stats: { likes: 5600, collections: 3800, views: 45000 },
    isLiked: false, isCollected: false, tags: ['舞蹈', '燃脂', 'Zumba', '有氧'],
  },
  {
    id: 'fc14', creator: { id: 'c2', name: '瑜伽老师Luna', avatar: '🧘‍♀️', isVerified: true, followers: 28000, recipes: 15, courses: 32, bio: 'RYT500认证瑜伽导师，身心平衡倡导者', tags: ['瑜伽', '冥想'], hasShop: false }, title: '肩颈理疗瑜伽', coverEmoji: '🧘',
    coverImage: CIMG('neck and shoulder rehabilitation yoga poses, woman sitting in office, relaxation therapy'),
    description: '15分钟肩颈专项理疗，针对久坐办公人群。缓解颈椎压力、改善圆肩驼背。',
    category: '瑜伽', difficulty: 'beginner', duration: 15, calories: 45,
    isFree: true, isMemberOnly: false, rating: 4.9, ratingCount: 4200,
    stats: { likes: 10500, collections: 8200, views: 78000 },
    isLiked: false, isCollected: false, tags: ['肩颈', '理疗', '办公', '纠正体态'],
  },
  {
    id: 'fc15', creator: { id: 'c1', name: '健身教练阿杰', avatar: '💪', isVerified: true, followers: 45000, recipes: 20, courses: 48, bio: 'ACE认证私教，帮助10万+用户达成健身目标', tags: ['健身教练', '增肌'], hasShop: false }, title: 'HIIT全身燃脂进阶', coverEmoji: '⚡',
    coverImage: CIMG('intense HIIT workout athlete doing burpees, high intensity interval training, dynamic action shot'),
    description: '35分钟高强度间歇训练进阶版。波比跳、登山者、跳箱等复合动作，挑战极限燃脂。',
    category: '减脂', difficulty: 'advanced', duration: 35, calories: 420,
    isFree: true, isMemberOnly: false, rating: 4.7, ratingCount: 1200,
    stats: { likes: 3200, collections: 2400, views: 22000 },
    isLiked: false, isCollected: false, tags: ['HIIT', '进阶', '燃脂', '极限'],
  },
  {
    id: 'fc16', creator: { id: 'c4', name: '跑步达人老张', avatar: '🏃', isVerified: false, followers: 8900, recipes: 5, courses: 15, bio: '马拉松完赛者，分享跑步训练方法', tags: ['跑步', '有氧'], hasShop: false }, title: '户外跑步拉伸指南', coverEmoji: '🏃',
    coverImage: CIMG('runner stretching after outdoor run in park, post-run cool down, active lifestyle'),
    description: '跑前热身+跑后拉伸完整指南。预防运动损伤，提升跑步表现。',
    category: '跑步', difficulty: 'beginner', duration: 12, calories: 30,
    isFree: true, isMemberOnly: false, rating: 4.6, ratingCount: 1500,
    stats: { likes: 3400, collections: 2500, views: 28000 },
    isLiked: false, isCollected: false, tags: ['拉伸', '跑步', '热身', '预防损伤'],
  },
  {
    id: 'fc17', creator: { id: 'c2', name: '瑜伽老师Luna', avatar: '🧘‍♀️', isVerified: true, followers: 28000, recipes: 15, courses: 32, bio: 'RYT500认证瑜伽导师，身心平衡倡导者', tags: ['瑜伽', '冥想'], hasShop: false }, title: '经期舒缓瑜伽', coverEmoji: '🌸',
    coverImage: CIMG('gentle yoga for menstrual relief, woman relaxing on yoga mat, soft warm lighting, calm atmosphere'),
    description: '专为经期设计的温和瑜伽序列。缓解腹痛、腰酸和情绪波动，轻柔舒缓。',
    category: '瑜伽', difficulty: 'beginner', duration: 20, calories: 40,
    isFree: true, isMemberOnly: false, rating: 4.9, ratingCount: 5100,
    stats: { likes: 12800, collections: 9600, views: 85000 },
    isLiked: false, isCollected: false, tags: ['经期', '舒缓', '瑜伽', '女性健康'],
  },
  {
    id: 'fc18', creator: { id: 'c3', name: '减脂小姐姐', avatar: '💃', isVerified: true, followers: 15600, recipes: 120, courses: 8, bio: '从140斤到100斤，分享我的减脂经验', tags: ['减脂', '健康饮食'], hasShop: false }, title: '瘦手臂·天鹅臂训练', coverEmoji: '🦢',
    coverImage: CIMG('woman doing arm toning exercises ballet inspired, graceful arm movements, elegant posture'),
    description: '10分钟天鹅臂训练，紧致手臂线条。芭蕾基础动作改编，优雅塑形不粗壮。',
    category: '舞蹈', difficulty: 'beginner', duration: 10, calories: 60,
    isFree: true, isMemberOnly: false, rating: 4.7, ratingCount: 2600,
    stats: { likes: 6700, collections: 4900, views: 52000 },
    isLiked: false, isCollected: false, tags: ['手臂', '塑形', '芭蕾', '优雅'],
  },
  {
    id: 'fc19', creator: { id: 'c1', name: '健身教练阿杰', avatar: '💪', isVerified: true, followers: 45000, recipes: 20, courses: 48, bio: 'ACE认证私教，帮助10万+用户达成健身目标', tags: ['健身教练', '增肌'], hasShop: false }, title: '泡沫轴全身放松', coverEmoji: '🔄',
    coverImage: CIMG('person using foam roller for muscle recovery, self myofascial release, fitness recovery'),
    description: '20分钟泡沫轴肌筋膜放松，运动后恢复必备。缓解肌肉酸痛，加速恢复。',
    category: '拉伸', difficulty: 'beginner', duration: 20, calories: 40,
    isFree: true, isMemberOnly: false, rating: 4.5, ratingCount: 1100,
    stats: { likes: 2900, collections: 2100, views: 23000 },
    isLiked: false, isCollected: false, tags: ['泡沫轴', '恢复', '拉伸', '放松'],
  },
];

const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: 'free', name: '免费用户', price: '免费', icon: '🆓',
    features: [
      '基础饮食记录',
      '基础运动记录',
      '免费课程',
      '免费食谱浏览',
      'AI基础分析',
    ],
  },
  {
    id: 'premium', name: '高级会员', price: '¥19/月', icon: '👑',
    features: [
      '全部健康食谱',
      '全部教学视频',
      'AI智能教练',
      '个性化训练计划',
      '专属营养分析',
      '博主课程优惠',
      '商城专属折扣',
      '无广告体验',
    ],
  },
];

interface HealthPlanetStore {
  creators: CreatorProfile[];
  fitnessCourses: VideoCourse[];
  membershipTiers: MembershipTier[];
  currentUserTier: 'free' | 'premium';
  selectedFitnessCategory: string;
  fitnessCategories: string[];

  setFitnessCategory: (category: string) => void;
  toggleCourseLike: (courseId: string) => void;
  toggleCourseCollect: (courseId: string) => void;
  upgradeToPremium: () => void;
}

export const useHealthPlanetStore = create<HealthPlanetStore>((set) => ({
  creators: CREATORS,
  fitnessCourses: FITNESS_COURSES,
  membershipTiers: MEMBERSHIP_TIERS,
  currentUserTier: 'free',
  selectedFitnessCategory: '全部',
  fitnessCategories: ['全部', '减脂', '增肌', '瑜伽', '跑步', '冥想', '拉伸', '舞蹈'],

  setFitnessCategory: (category) => set({ selectedFitnessCategory: category }),

  toggleCourseLike: (courseId) => set((state) => ({
    fitnessCourses: state.fitnessCourses.map((course) =>
      course.id === courseId
        ? {
            ...course,
            isLiked: !course.isLiked,
            stats: {
              ...course.stats,
              likes: course.isLiked ? course.stats.likes - 1 : course.stats.likes + 1,
            },
          }
        : course
    ),
  })),

  toggleCourseCollect: (courseId) => set((state) => ({
    fitnessCourses: state.fitnessCourses.map((course) =>
      course.id === courseId
        ? {
            ...course,
            isCollected: !course.isCollected,
            stats: {
              ...course.stats,
              collections: course.isCollected ? course.stats.collections - 1 : course.stats.collections + 1,
            },
          }
        : course
    ),
  })),

  upgradeToPremium: () => set({ currentUserTier: 'premium' }),
}));
