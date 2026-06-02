import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useNutritionStore } from '../store/nutritionStore';
import { useExerciseStore } from '../store/exerciseStore';
import { useHealthPlanetStore } from '../store/healthPlanetStore';
import { Theme } from '../theme';
import { healthTips } from '../constants/mockData';
import { buildNutritionContext } from '../services/recipeService';
import { getAiRecommendations, type AiRecommendation } from '../services/recommendationService';

const NUTRITION_COLORS = {
  calories: { primary: '#4CAF50', bg: '#E8F5E9' },
  protein: { primary: '#42A5F5', bg: '#E3F2FD' },
  carbs: { primary: '#FF9800', bg: '#FFF3E0' },
  fat: { primary: '#AB47BC', bg: '#F3E5F5' },
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const user = useNutritionStore((s) => s.user);
  const mealRecords = useNutritionStore((s) => s.mealRecords);
  const dailyNutrition = useNutritionStore((s) => s.dailyNutrition);
  const calculateDailyGoals = useNutritionStore((s) => s.calculateDailyGoals);
  const getTodayCalories = useExerciseStore((s) => s.getTodayCalories);
  const getTodayDuration = useExerciseStore((s) => s.getTodayDuration);
  const getStreak = useExerciseStore((s) => s.getStreak);

  const goals = useMemo(() => user ? calculateDailyGoals() : null, [user]);

  const today = new Date().toISOString().split('T')[0];
  const todayRecords = mealRecords.filter((r) => r.recordDate === today);
  const totalFoods = todayRecords.flatMap((r) => r.foods);
  const mealCount = todayRecords.length;

  const consumed = useMemo(() => ({
    calories: dailyNutrition.calories || 0,
    protein: dailyNutrition.protein || 0,
    carbs: dailyNutrition.carbs || 0,
    fat: dailyNutrition.fat || 0,
  }), [dailyNutrition]);

  const todayExCalories = getTodayCalories();
  const todayExDuration = getTodayDuration();
  const streak = getStreak();

  const tipOfDay = useMemo(
    () => healthTips[new Date().getDate() % healthTips.length],
    [],
  );

  const calPct = goals?.calories ? Math.min(consumed.calories / goals.calories, 1) : 0;

  const isPremium = useHealthPlanetStore((s) => s.currentUserTier) === 'premium';

  const [aiRec, setAiRec] = useState<AiRecommendation | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setAiLoading(true);
    getAiRecommendations(user, consumed).then((data) => {
      if (data) setAiRec(data);
      setAiLoading(false);
    });
  }, [user?.id, consumed.calories]);

  const handleMemberGate = (target: 'Recipes' | 'Exercise') => {
    if (isPremium) {
      navigation.navigate(target);
    } else {
      Alert.alert(
        '开通会员',
        '此功能仅限会员使用，开通后可享受个性化食谱推荐、每日运动计划等专属权益',
        [
          { text: '稍后再说', style: 'cancel' },
          { text: '立即开通', onPress: () => navigation.navigate('Membership') },
        ],
      );
    }
  };

  const recommendedRecipes = aiRec?.recipes ?? [];
  const todayExRecommendation = aiRec?.exercise;

  // AI 生成今日健康摘要
  const healthSummary = useMemo(() => {
    const parts: string[] = [];

    // 饮食评价
    const calRatio = goals?.calories ? consumed.calories / goals.calories : 0;
    if (calRatio < 0.3) parts.push('今天热量摄入偏少，记得按时吃饭哦');
    else if (calRatio < 0.7) parts.push('热量摄入适中，可以再补充一些营养');
    else if (calRatio <= 1) parts.push('热量摄入合理，继续保持');
    else parts.push('今天热量摄入较多，建议增加运动消耗');

    // 蛋白质评价
    const protRatio = goals?.protein ? consumed.protein / goals.protein : 0;
    if (protRatio < 0.5) parts.push('蛋白质摄入不足，建议补充蛋奶豆制品');
    else if (protRatio >= 1) parts.push('蛋白质摄入充足 👍');

    // 运动评价
    if (todayExCalories > 300) parts.push('运动消耗很给力！');
    else if (todayExCalories > 100) parts.push('有运动习惯，真不错');
    else if (todayExCalories > 0) parts.push('今天有运动，继续保持');
    else parts.push('今天还没有运动记录，动起来吧');

    // 综合
    if (streak > 3) parts.push(`已连续运动${streak}天，坚持就是胜利`);
    if (totalFoods.length > 5) parts.push(`今天记录了${totalFoods.length}种食物，饮食管理很细致`);

    return parts;
  }, [consumed, goals, todayExCalories, streak, totalFoods]);

  const NutritionRing = ({ current, target, label, color }: {
    current: number; target: number; label: string;
    color: { primary: string; bg: string };
  }) => {
    const pct = target > 0 ? Math.min(current / target, 1) : 0;
    const isOver = current > target;
    return (
      <View style={nRing.container}>
        <View style={[nRing.circleOuter, { backgroundColor: `${color.primary}15`, borderColor: `${color.primary}30` }]}>
          <View style={[nRing.circleInner, { backgroundColor: color.bg }]}>
            <Text style={[nRing.circleValue, { color: isOver ? Theme.colors.accent : color.primary }]}>
              {Math.round(current)}
            </Text>
            <Text style={nRing.circleUnit}>{label === '热量' ? '千卡' : 'g'}</Text>
          </View>
        </View>
        <Text style={nRing.label}>{label}</Text>
        <Text style={nRing.target}>目标 {target}{label === '热量' ? '' : 'g'}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <View style={styles.greetingRow}>
              <Text style={styles.greeting}>
                你好{user?.gender === 'male' ? '先生' : '女士'}
              </Text>
              <View style={styles.greetingDot} />
              <Text style={styles.greetingDate}>
                {new Date().getMonth() + 1}月{new Date().getDate()}日
              </Text>
            </View>
            <Text style={styles.headerTitle}>今天也要健康饮食</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <View style={styles.avatarRing}>
              <Ionicons name="person-circle-outline" size={38} color={Theme.colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* 新用户问卷引导 */}
        {user && !user.questionnaireCompleted && (
          <TouchableOpacity
            style={styles.questionnaireBanner}
            onPress={() => navigation.navigate('HealthQuestionnaire')}
            activeOpacity={0.85}
          >
            <View style={styles.questionnaireBannerLeft}>
              <View style={styles.questionnaireIconWrap}>
                <Ionicons name="clipboard-outline" size={18} color="#fff" />
              </View>
              <View>
                <Text style={styles.questionnaireTitle}>完善健康档案</Text>
                <Text style={styles.questionnaireSub}>完成问卷，获取个性化推荐</Text>
              </View>
            </View>
            <View style={styles.questionnaireArrow}>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
        )}

        {/* 今日营养 — 核心功能卡片 */}
        <View style={styles.nutritionCard}>
          {/* 拍照识别入口 */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Camera')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#43A047', '#66BB6A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cameraBanner}
            >
              <View style={styles.cameraBannerLeft}>
                <View style={styles.cameraIconWrap}>
                  <Ionicons name="camera" size={20} color="#fff" />
                </View>
                <View>
                  <Text style={styles.cameraBannerTitle}>拍照识别食物</Text>
                  <Text style={styles.cameraBannerSub}>一拍即知营养数据</Text>
                </View>
              </View>
              <View style={styles.cameraBannerRight}>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* 热量总览 */}
          <View style={styles.calSummary}>
            <View style={styles.calSummaryLeft}>
              <Text style={styles.calSummaryLabel}>今日摄入</Text>
              <View style={styles.calSummaryValueRow}>
                <Text style={styles.calSummaryValue}>{Math.round(consumed.calories)}</Text>
                <Text style={styles.calSummaryUnit}> / {goals?.calories || 2000} kcal</Text>
              </View>
              <View style={styles.calProgressBg}>
                <View style={[styles.calProgressFill, { width: `${calPct * 100}%` as any }]} />
              </View>
            </View>
            <View style={styles.calSummaryRight}>
              <View style={styles.calMealBadge}>
                <Ionicons name="fast-food-outline" size={14} color={Theme.colors.primary} />
                <Text style={styles.calMealBadgeText}>{mealCount}餐</Text>
              </View>
              <Text style={styles.calFoodCount}>{totalFoods.length}种食物</Text>
            </View>
          </View>

          {/* 营养环 */}
          <View style={styles.ringRow}>
            <NutritionRing current={consumed.calories} target={goals?.calories || 2000} label="热量" color={NUTRITION_COLORS.calories} />
            <NutritionRing current={consumed.protein} target={goals?.protein || 60} label="蛋白质" color={NUTRITION_COLORS.protein} />
            <NutritionRing current={consumed.carbs} target={goals?.carbs || 200} label="碳水" color={NUTRITION_COLORS.carbs} />
            <NutritionRing current={consumed.fat} target={goals?.fat || 55} label="脂肪" color={NUTRITION_COLORS.fat} />
          </View>

          {totalFoods.length > 0 && (
            <TouchableOpacity style={styles.detailLink} onPress={() => navigation.navigate('Meals')}>
              <Text style={styles.detailLinkText}>查看详细饮食记录</Text>
              <Ionicons name="chevron-forward" size={14} color={Theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* 今日运动 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.cardIcon, { backgroundColor: `${Theme.colors.info}15` }]}>
                <Ionicons name="fitness-outline" size={16} color={Theme.colors.info} />
              </View>
              <Text style={styles.cardTitle}>今日运动</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Exercise')}>
              <Text style={styles.cardAction}>查看全部</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.exerciseGrid}>
            <View style={[styles.exerciseItem, { backgroundColor: `${Theme.colors.accent}10` }]}>
              <Ionicons name="flame" size={22} color={Theme.colors.accent} />
              <Text style={styles.exerciseValue}>{Math.round(todayExCalories)}</Text>
              <Text style={styles.exerciseLabel}>千卡消耗</Text>
            </View>
            <View style={[styles.exerciseItem, { backgroundColor: `${Theme.colors.info}10` }]}>
              <Ionicons name="time" size={22} color={Theme.colors.info} />
              <Text style={styles.exerciseValue}>{todayExDuration}</Text>
              <Text style={styles.exerciseLabel}>运动分钟</Text>
            </View>
            <View style={[styles.exerciseItem, { backgroundColor: `${Theme.colors.primary}10` }]}>
              <Ionicons name="trending-up" size={22} color={Theme.colors.primary} />
              <Text style={styles.exerciseValue}>{streak}</Text>
              <Text style={styles.exerciseLabel}>连续天数</Text>
            </View>
          </View>
        </View>

        {/* 今日健康摘要 */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('HealthDetail')}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.cardIcon, { backgroundColor: `${Theme.colors.primary}15` }]}>
                <Ionicons name="analytics" size={16} color={Theme.colors.primary} />
              </View>
              <Text style={styles.cardTitle}>今日健康摘要</Text>
            </View>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>详情</Text>
              <Ionicons name="chevron-forward" size={12} color={Theme.colors.primary} />
            </View>
          </View>

          {/* AI 摘要 */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconRow}>
              <View style={styles.summarySparkle}>
                <Ionicons name="sparkles" size={14} color={Theme.colors.accent} />
              </View>
              <Text style={styles.summaryAiLabel}>AI 健康摘要</Text>
            </View>
            <View style={styles.summaryTextWrap}>
              {healthSummary.slice(0, 3).map((text, i) => (
                <View key={i} style={styles.summaryLine}>
                  <View style={[styles.summaryDot, {
                    backgroundColor: [Theme.colors.primary, Theme.colors.info, Theme.colors.accent][i],
                  }]} />
                  <Text style={styles.summaryLineText}>{text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 核心数据 */}
          <View style={styles.summaryMetrics}>
            <View style={styles.summaryMetric}>
              <Text style={[styles.summaryMetricValue, { color: Theme.colors.primary }]}>
                {Math.round(consumed.calories)}
              </Text>
              <Text style={styles.summaryMetricLabel}>摄入千卡</Text>
            </View>
            <View style={styles.summaryMetricDivider} />
            <View style={styles.summaryMetric}>
              <Text style={[styles.summaryMetricValue, { color: Theme.colors.info }]}>
                {todayExDuration}
              </Text>
              <Text style={styles.summaryMetricLabel}>运动分钟</Text>
            </View>
            <View style={styles.summaryMetricDivider} />
            <View style={styles.summaryMetric}>
              <Text style={[styles.summaryMetricValue, { color: Theme.colors.accent }]}>
                {Math.round(consumed.calories - todayExCalories)}
              </Text>
              <Text style={styles.summaryMetricLabel}>净热量</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 个性化健康食谱推荐 — 全员可见，会员可打开 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.cardIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="restaurant-outline" size={16} color="#FF9800" />
              </View>
              <Text style={styles.cardTitle}>个性化食谱推荐</Text>
              {!isPremium && (
                <View style={styles.memberBadge}>
                  <Ionicons name="crown-outline" size={10} color={Theme.colors.accent} />
                  <Text style={styles.memberBadgeText}>会员</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={() => handleMemberGate('Recipes')}>
              <Text style={styles.cardAction}>{isPremium ? '查看全部' : '开通查看'}</Text>
            </TouchableOpacity>
          </View>
          {aiLoading ? (
            <View style={styles.aiLoadingWrap}>
              <ActivityIndicator size="small" color={Theme.colors.primary} />
              <Text style={styles.aiLoadingText}>AI 为你生成个性化推荐...</Text>
            </View>
          ) : recommendedRecipes.length === 0 ? (
            <View style={styles.aiLoadingWrap}>
              <Text style={styles.aiLoadingText}>暂无推荐，请先记录饮食数据</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recipeScroll}>
              {recommendedRecipes.map((recipe, idx) => (
                <TouchableOpacity
                  key={recipe.name + idx}
                  style={styles.recipeCard}
                  onPress={() => handleMemberGate('Recipes')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.recipeIconWrap, { backgroundColor: recipe.category === 'breakfast' ? '#FFF3E0' : recipe.category === 'lunch' ? '#E8F5E9' : '#E3F2FD' }]}>
                    <Ionicons
                      name={recipe.category === 'breakfast' ? 'sunny-outline' : recipe.category === 'lunch' ? 'sunny' : 'moon-outline'}
                      size={22}
                      color={recipe.category === 'breakfast' ? '#FF9800' : recipe.category === 'lunch' ? '#4CAF50' : '#2196F3'}
                    />
                  </View>
                  <Text style={styles.recipeName} numberOfLines={1}>{recipe.name}</Text>
                  <Text style={styles.recipeMeta}>{recipe.calories}千卡 · {recipe.prepTime}分钟</Text>
                  <Text style={styles.recipeReason} numberOfLines={2}>{recipe.reason}</Text>
                  {!isPremium && (
                    <View style={styles.lockOverlay}>
                      <Ionicons name="lock-closed" size={14} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          {aiRec?.disclaimer && !aiLoading && (
            <Text style={styles.disclaimerText}>{aiRec.disclaimer}</Text>
          )}
          {aiRec?.needsMoreInfo && !aiLoading && (
            <TouchableOpacity style={styles.profilePrompt} onPress={() => navigation.navigate('Profile')}>
              <Ionicons name="information-circle-outline" size={16} color={Theme.colors.accent} />
              <Text style={styles.profilePromptText}>为获得更精准的推荐，请完善个人健康信息</Text>
              <Ionicons name="chevron-forward" size={14} color={Theme.colors.accent} />
            </TouchableOpacity>
          )}
        </View>

        {/* 每日健康运动推荐 — 全员可见，会员可打开 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.cardIcon, { backgroundColor: `${Theme.colors.info}15` }]}>
                <Ionicons name="fitness-outline" size={16} color={Theme.colors.info} />
              </View>
              <Text style={styles.cardTitle}>今日运动推荐</Text>
              {!isPremium && (
                <View style={styles.memberBadge}>
                  <Ionicons name="crown-outline" size={10} color={Theme.colors.accent} />
                  <Text style={styles.memberBadgeText}>会员</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={() => handleMemberGate('Exercise')}>
              <Text style={styles.cardAction}>{isPremium ? '查看全部' : '开通查看'}</Text>
            </TouchableOpacity>
          </View>
          {aiLoading ? (
            <View style={styles.aiLoadingWrap}>
              <ActivityIndicator size="small" color={Theme.colors.info} />
              <Text style={styles.aiLoadingText}>AI 为你生成运动推荐...</Text>
            </View>
          ) : !todayExRecommendation ? (
            <View style={styles.aiLoadingWrap}>
              <Text style={styles.aiLoadingText}>暂无推荐，请先记录饮食数据</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.exRecCard}
              onPress={() => handleMemberGate('Exercise')}
              activeOpacity={0.8}
            >
              <View style={styles.exRecLeft}>
                <View style={[styles.exRecIcon, { backgroundColor: todayExRecommendation.type === 'cardio' ? '#FFEBEE' : todayExRecommendation.type === 'strength' ? '#E8F5E9' : todayExRecommendation.type === 'flexibility' ? '#E3F2FD' : '#FFF3E0' }]}>
                  <Text style={styles.exRecEmoji}>
                    {todayExRecommendation.type === 'cardio' ? '🏃' : todayExRecommendation.type === 'strength' ? '💪' : todayExRecommendation.type === 'flexibility' ? '🧘' : '⚡'}
                  </Text>
                </View>
                <View style={styles.exRecInfo}>
                  <Text style={styles.exRecName}>{todayExRecommendation.name}</Text>
                  <Text style={styles.exRecDetail}>{todayExRecommendation.duration}分钟 · 消耗{todayExRecommendation.caloriesBurned}千卡</Text>
                  <Text style={styles.recipeReason} numberOfLines={2}>{todayExRecommendation.reason}</Text>
                </View>
              </View>
              {!isPremium && (
                <View style={styles.exRecLock}>
                  <Ionicons name="lock-closed" size={16} color={Theme.colors.text.tertiary} />
                </View>
              )}
              {isPremium && (
                <Ionicons name="chevron-forward" size={16} color={Theme.colors.text.tertiary} />
              )}
            </TouchableOpacity>
          )}
          {aiRec?.disclaimer && !aiLoading && (
            <Text style={styles.disclaimerText}>{aiRec.disclaimer}</Text>
          )}
          {aiRec?.needsMoreInfo && !aiLoading && (
            <TouchableOpacity style={styles.profilePrompt} onPress={() => navigation.navigate('Profile')}>
              <Ionicons name="information-circle-outline" size={16} color={Theme.colors.accent} />
              <Text style={styles.profilePromptText}>为获得更精准的推荐，请完善个人健康信息</Text>
              <Ionicons name="chevron-forward" size={14} color={Theme.colors.accent} />
            </TouchableOpacity>
          )}
        </View>

        {/* 快捷入口 */}
        <View style={styles.shortcutsRow}>
          <ShortcutCard
            icon="camera-outline"
            label="拍照识别"
            color={Theme.colors.primary}
            onPress={() => navigation.navigate('Camera')}
          />
          <ShortcutCard
            icon="chatbubble-ellipses-outline"
            label="AI助手"
            color={Theme.colors.purple}
            onPress={() => navigation.navigate('Assistant')}
          />
          <ShortcutCard
            icon="restaurant-outline"
            label="营养美食"
            color={Theme.colors.accent}
            onPress={() => navigation.navigate('FoodChannel' as any)}
          />
          <ShortcutCard
            icon="analytics-outline"
            label="健康周报"
            color="#FF9800"
            onPress={() => navigation.navigate('Report')}
          />
        </View>

        {/* 健康小贴士 */}
        <View style={styles.tipCard}>
          <View style={styles.tipLeft}>
            <View style={styles.tipIconWrap}>
              <Ionicons name="bulb" size={16} color={Theme.colors.accent} />
            </View>
            <Text style={styles.tipTitle}>健康小贴士</Text>
          </View>
          <Text style={styles.tipText}>{tipOfDay}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ShortcutCard = ({ icon, label, color, onPress }: {
  icon: string; label: string; color: string; onPress: () => void;
}) => (
  <TouchableOpacity style={shortcutStyles.card} onPress={onPress} activeOpacity={0.7}>
    <View style={[shortcutStyles.iconWrap, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon as any} size={22} color={color} />
    </View>
    <Text style={shortcutStyles.label}>{label}</Text>
  </TouchableOpacity>
);

const nRing = StyleSheet.create({
  container: { alignItems: 'center', width: 80 },
  circleOuter: {
    width: 64, height: 64, borderRadius: 32, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  circleInner: {
    width: 50, height: 50, borderRadius: 25,
    justifyContent: 'center', alignItems: 'center',
  },
  circleValue: { fontSize: 15, fontWeight: '800', lineHeight: 18 },
  circleUnit: { fontSize: 8, color: '#999', fontWeight: '500' },
  label: { fontSize: 11, color: Theme.colors.text.secondary, marginTop: 6, fontWeight: '500' },
  target: { fontSize: 9, color: Theme.colors.text.light, marginTop: 2 },
});

const shortcutStyles = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14,
    alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 12, color: Theme.colors.text.primary, fontWeight: '600' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  content: { paddingBottom: 100 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 3,
  },
  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greeting: { fontSize: 14, color: Theme.colors.text.secondary },
  greetingDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Theme.colors.text.light },
  greetingDate: { fontSize: 12, color: Theme.colors.text.light },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Theme.colors.text.primary, marginTop: 2 },
  avatarRing: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },

  // 今日营养核心卡片
  nutritionCard: {
    marginHorizontal: 20, marginTop: 16,
    backgroundColor: '#fff', borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 14, elevation: 4,
  },
  cameraBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 16,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  cameraBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  cameraIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  cameraBannerTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  cameraBannerSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  cameraBannerRight: { marginLeft: 8 },

  calSummary: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  calSummaryLeft: { flex: 1 },
  calSummaryLabel: { fontSize: 13, color: Theme.colors.text.secondary, fontWeight: '500' },
  calSummaryValueRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  calSummaryValue: { fontSize: 28, fontWeight: '800', color: Theme.colors.text.primary },
  calSummaryUnit: { fontSize: 13, color: Theme.colors.text.tertiary, fontWeight: '500' },
  calProgressBg: {
    height: 4, borderRadius: 2, backgroundColor: '#E8E8F0',
    marginTop: 10, overflow: 'hidden',
  },
  calProgressFill: { height: '100%', borderRadius: 2, backgroundColor: Theme.colors.primary },
  calSummaryRight: { alignItems: 'flex-end', justifyContent: 'center' },
  calMealBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#E8F5E9', paddingVertical: 4, paddingHorizontal: 10,
    borderRadius: 10,
  },
  calMealBadgeText: { fontSize: 12, color: Theme.colors.primary, fontWeight: '600' },
  calFoodCount: { fontSize: 11, color: Theme.colors.text.tertiary, marginTop: 4 },

  ringRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingHorizontal: 12, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#F0F0F5',
  },
  detailLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, gap: 4,
    borderTopWidth: 1, borderTopColor: '#F0F0F5',
  },
  detailLinkText: { fontSize: 13, color: Theme.colors.primary, fontWeight: '600' },

  // 通用卡片
  card: {
    marginHorizontal: 20, marginTop: 12,
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 14, elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIcon: {
    width: 32, height: 32, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Theme.colors.text.primary },
  cardAction: { fontSize: 13, color: Theme.colors.primary, fontWeight: '600' },
  cardBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: `${Theme.colors.primary}10`, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10,
  },
  cardBadgeText: { fontSize: 12, color: Theme.colors.primary, fontWeight: '600' },

  // 今日健康摘要
  summaryCard: {
    backgroundColor: '#FAFBFE', borderRadius: 14, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#EDF0F7',
  },
  summaryIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  summarySparkle: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: `${Theme.colors.accent}20`,
    justifyContent: 'center', alignItems: 'center',
  },
  summaryAiLabel: { fontSize: 12, fontWeight: '700', color: Theme.colors.accent, letterSpacing: 0.5 },
  summaryTextWrap: { gap: 8 },
  summaryLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  summaryDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  summaryLineText: { flex: 1, fontSize: 13, color: Theme.colors.text.secondary, lineHeight: 20 },
  summaryMetrics: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F8FAFE', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 8,
  },
  summaryMetric: { flex: 1, alignItems: 'center', gap: 4 },
  summaryMetricValue: { fontSize: 20, fontWeight: '800' },
  summaryMetricLabel: { fontSize: 11, color: Theme.colors.text.tertiary, fontWeight: '500' },
  summaryMetricDivider: {
    width: 1, height: 32, backgroundColor: '#E8E8F0',
  },

  // 运动
  exerciseGrid: { flexDirection: 'row', gap: 10 },
  exerciseItem: {
    flex: 1, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 8,
    alignItems: 'center', gap: 6,
  },
  exerciseValue: { fontSize: 18, fontWeight: '800', color: Theme.colors.text.primary },
  exerciseLabel: { fontSize: 11, color: Theme.colors.text.tertiary, fontWeight: '500' },

  // 快捷入口
  shortcutsRow: { flexDirection: 'row', marginHorizontal: 20, gap: 10, marginTop: 12 },

  // 食谱推荐
  memberBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: `${Theme.colors.accent}15`,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
  },
  memberBadgeText: { fontSize: 10, color: Theme.colors.accent, fontWeight: '700' },
  recipeScroll: { marginHorizontal: -4, paddingVertical: 4 },
  recipeCard: {
    width: 130, marginRight: 10, padding: 12,
    backgroundColor: '#FAFBFE', borderRadius: 14,
    borderWidth: 1, borderColor: '#EDF0F7',
    position: 'relative',
  },
  recipeIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  recipeName: { fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 2 },
  recipeMeta: { fontSize: 11, color: Theme.colors.text.tertiary },
  lockOverlay: {
    position: 'absolute', top: 8, right: 8,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  // 运动推荐
  exRecCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FAFBFE', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#EDF0F7',
  },
  exRecLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  exRecIcon: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  exRecEmoji: { fontSize: 22 },
  exRecInfo: { flex: 1 },
  exRecName: { fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 2 },
  exRecDetail: { fontSize: 11, color: Theme.colors.text.tertiary },
  exRecLock: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#F0F0F5', justifyContent: 'center', alignItems: 'center',
  },
  recipeReason: { fontSize: 10, color: Theme.colors.text.secondary, marginTop: 4, lineHeight: 14 },
  aiLoadingWrap: { paddingVertical: 20, alignItems: 'center', justifyContent: 'center' },
  aiLoadingText: { fontSize: 13, color: Theme.colors.text.tertiary, marginTop: 8 },
  disclaimerText: { fontSize: 11, color: Theme.colors.text.tertiary, marginTop: 12, lineHeight: 16, fontStyle: 'italic' },
  profilePrompt: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: `${Theme.colors.accent}10`, marginTop: 12, padding: 10, borderRadius: 10,
  },
  profilePromptText: { flex: 1, fontSize: 12, color: Theme.colors.accent, fontWeight: '500' },

  // 健康小贴士
  tipCard: {
    marginHorizontal: 20, marginTop: 12,
    backgroundColor: '#FFF8EE', borderRadius: 16, padding: 16,
    borderLeftWidth: 3, borderLeftColor: Theme.colors.accent,
  },
  tipLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  tipIconWrap: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: `${Theme.colors.accent}20`,
    justifyContent: 'center', alignItems: 'center',
  },
  tipTitle: { fontSize: 14, fontWeight: '600', color: Theme.colors.accent },
  tipText: { fontSize: 13, color: Theme.colors.text.primary, lineHeight: 20, paddingLeft: 36 },

  // 问卷引导
  questionnaireBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Theme.colors.primary,
    borderRadius: 14,
  },
  questionnaireBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  questionnaireIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionnaireTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  questionnaireSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },
  questionnaireArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
