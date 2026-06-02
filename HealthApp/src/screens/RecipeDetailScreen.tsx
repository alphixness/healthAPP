import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useFoodChannelStore } from '../store/foodChannelStore';
import { useNutritionStore, FoodLog } from '../store/nutritionStore';
import { scoreRecipe, buildNutritionContext } from '../services/recipeService';
import { Theme } from '../theme';
import { getRecipeById } from '../constants/nutrition';

export const RecipeDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { posts, toggleLike } = useFoodChannelStore();

  const { postId } = route.params as { postId: string };
  const channelPost = posts.find(p => p.id === postId);
  const mockRecipe = !channelPost ? getRecipeById(postId) : null;

  const user = useNutritionStore((s) => s.user);
  const dailyNutrition = useNutritionStore((s) => s.dailyNutrition);
  const calculateDailyGoals = useNutritionStore((s) => s.calculateDailyGoals);
  const addMealRecord = useNutritionStore((s) => s.addMealRecord);

  const nutritionContext = useMemo(() => {
    if (!user) return null;
    const goals = calculateDailyGoals();
    return buildNutritionContext(
      goals,
      { calories: dailyNutrition.calories, protein: dailyNutrition.protein, carbs: dailyNutrition.carbs, fat: dailyNutrition.fat },
      user.goal,
    );
  }, [user, dailyNutrition]);

  const fitScore = useMemo(() => {
    if (!nutritionContext) return null;
    if (mockRecipe) return scoreRecipe(mockRecipe, nutritionContext);
    if (channelPost) return scoreRecipe(channelPost, nutritionContext);
    return null;
  }, [nutritionContext, mockRecipe, channelPost]);

  const handleAddToMeal = (name: string, calories: number, protein: number, carbs: number, fat: number) => {
    const today = new Date().toISOString().split('T')[0];
    const hour = new Date().getHours();
    const mealType = hour < 10 ? 'breakfast' as const : hour < 14 ? 'lunch' as const : hour < 18 ? 'snack' as const : 'dinner' as const;

    const foodLog: FoodLog = {
      id: `${Date.now()}`,
      foodName: name,
      quantity: 1,
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      createdAt: new Date().toISOString(),
    };

    addMealRecord({
      id: `meal-${Date.now()}`,
      userId: 'user-1',
      recordDate: today,
      mealType,
      foods: [foodLog],
    });

    Alert.alert('已添加', `「${name}」已加入今日${mealType === 'breakfast' ? '早餐' : mealType === 'lunch' ? '午餐' : mealType === 'dinner' ? '晚餐' : '零食'}记录`);
  };

  if (!channelPost && !mockRecipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="sad-outline" size={48} color={Theme.colors.text.tertiary} />
          <Text style={styles.emptyText}>食谱不存在</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (mockRecipe) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.navTitle} numberOfLines={1}>{mockRecipe.name}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.mockHero}>
            <View style={styles.mockHeroIcon}>
              <Ionicons name="restaurant-outline" size={48} color={Theme.colors.primary} />
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={20} color="#EF5350" />
              <Text style={styles.statValue}>{mockRecipe.calories}千卡</Text>
              <Text style={styles.statLabel}>热量</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={20} color={Theme.colors.primary} />
              <Text style={styles.statValue}>{mockRecipe.prepTime}分钟</Text>
              <Text style={styles.statLabel}>烹饪时间</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="nutrition-outline" size={20} color={Theme.colors.purple} />
              <Text style={styles.statValue}>{mockRecipe.protein}g</Text>
              <Text style={styles.statLabel}>蛋白质</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={Theme.colors.infoGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.sectionIcon}
              >
                <Ionicons name="nutrition" size={16} color="#fff" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>营养成分</Text>
            </View>
            <View style={styles.nutritionGrid}>
              <NutritionItem value={`${mockRecipe.calories}`} unit="千卡" label="热量" />
              <NutritionItem value={`${mockRecipe.protein}g`} unit="蛋白质" label="" color={Theme.colors.info} />
              <NutritionItem value={`${mockRecipe.carbs}g`} unit="碳水" label="" color={Theme.colors.accent} />
              <NutritionItem value={`${mockRecipe.fat}g`} unit="脂肪" label="" color={Theme.colors.purple} />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: Theme.colors.accentGradient[0] }]}>
                <Ionicons name="list" size={16} color="#fff" />
              </View>
              <Text style={styles.sectionTitle}>食材清单</Text>
              <Text style={styles.sectionSub}>{mockRecipe.ingredients.length}种食材</Text>
            </View>
            <View style={styles.ingredientList}>
              {mockRecipe.ingredients.map((ingredient: string, index: number) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.ingredientDot} />
                  <Text style={styles.ingredientName}>{ingredient}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={Theme.colors.primaryGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.sectionIcon}
              >
                <Ionicons name="book" size={16} color="#fff" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>烹饪步骤</Text>
              <Text style={styles.sectionSub}>{mockRecipe.steps.length}步</Text>
            </View>
            <View style={styles.stepsList}>
              {mockRecipe.steps.map((step: string, index: number) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <LinearGradient
                      colors={Theme.colors.primaryGradient}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      style={styles.stepNumberGradient}
                    >
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepDescription}>{step}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.shareButton}
            activeOpacity={0.8}
            onPress={() => handleAddToMeal(
              mockRecipe.name, mockRecipe.calories,
              mockRecipe.protein, mockRecipe.carbs, mockRecipe.fat,
            )}
          >
            <LinearGradient
              colors={fitScore && fitScore >= 75 ? Theme.colors.primaryGradient : ['#999', '#bbb']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.shareGradient}
            >
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={styles.shareText}>添加到今日饮食</Text>
              {fitScore && (
                <View style={styles.fitScoreBadge}>
                  <Text style={styles.fitScoreText}>匹配 {fitScore}%</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const post = channelPost!;
  const difficultyMap = { easy: '简单', medium: '中等', hard: '困难' } as const;
  const difficultyColorMap = { easy: '#4CAF50', medium: '#FF9800', hard: '#F44336' };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{post.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <LinearGradient
            colors={['#F5F7FA', '#E8ECF0']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <Text style={styles.heroEmoji}>{post.coverEmoji}</Text>
          </LinearGradient>
          <View style={styles.heroInfo}>
            <Text style={styles.heroTitle}>{post.title}</Text>
            <Text style={styles.heroDescription}>{post.description}</Text>
            <View style={styles.authorRow}>
              <Text style={styles.authorAvatarLarge}>{post.author.avatar}</Text>
              <View style={styles.authorInfo}>
                <Text style={styles.authorNameText}>{post.author.name}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={20} color={Theme.colors.primary} />
            <Text style={styles.statValue}>{post.cookTime}分钟</Text>
            <Text style={styles.statLabel}>烹饪时间</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="flame-outline" size={20} color="#EF5350" />
            <Text style={styles.statValue}>{post.nutrition.calories}千卡</Text>
            <Text style={styles.statLabel}>热量</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={20} color="#FF9800" />
            <Text style={styles.statValue}>{post.servings}人份</Text>
            <Text style={styles.statLabel}>份量</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.difficultyDot, { backgroundColor: difficultyColorMap[post.difficulty] }]} />
            <Text style={[styles.statValue, { color: difficultyColorMap[post.difficulty] }]}>
              {difficultyMap[post.difficulty]}
            </Text>
            <Text style={styles.statLabel}>难度</Text>
          </View>
        </View>

        <View style={styles.tagsRow}>
          {post.tags.map((tag, index) => (
            <View key={index} style={styles.tagChip}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={Theme.colors.infoGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.sectionIcon}
            >
              <Ionicons name="nutrition" size={16} color="#fff" />
            </LinearGradient>
            <Text style={styles.sectionTitle}>营养成分</Text>
          </View>
          <View style={styles.nutritionGrid}>
            <NutritionItem value={`${post.nutrition.calories}`} unit="千卡" label="热量" />
            <NutritionItem value={`${post.nutrition.protein}g`} unit="蛋白质" label="" color={Theme.colors.info} />
            <NutritionItem value={`${post.nutrition.carbs}g`} unit="碳水" label="" color={Theme.colors.accent} />
            <NutritionItem value={`${post.nutrition.fat}g`} unit="脂肪" label="" color={Theme.colors.purple} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: Theme.colors.accentGradient[0] }]}>
              <Ionicons name="list" size={16} color="#fff" />
            </View>
            <Text style={styles.sectionTitle}>食材清单</Text>
            <Text style={styles.sectionSub}>{post.ingredients.length}种食材</Text>
          </View>
          <View style={styles.ingredientList}>
            {post.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.ingredientDot} />
                <Text style={styles.ingredientName}>{ingredient.name}</Text>
                <Text style={styles.ingredientAmount}>{ingredient.amount}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={Theme.colors.primaryGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.sectionIcon}
            >
              <Ionicons name="book" size={16} color="#fff" />
            </LinearGradient>
            <Text style={styles.sectionTitle}>烹饪步骤</Text>
            <Text style={styles.sectionSub}>{post.steps.length}步</Text>
          </View>
          <View style={styles.stepsList}>
            {post.steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <LinearGradient
                    colors={Theme.colors.primaryGradient}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.stepNumberGradient}
                  >
                    <Text style={styles.stepNumberText}>{step.step}</Text>
                  </LinearGradient>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                  {step.tip && (
                    <View style={styles.stepTip}>
                      <Ionicons name="bulb-outline" size={14} color="#FF9800" />
                      <Text style={styles.stepTipText}>{step.tip}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomAction}
          onPress={() => toggleLike(post.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={post.isLiked ? '#EF5350' : Theme.colors.text.secondary}
          />
          <Text style={[styles.bottomActionText, post.isLiked && { color: '#EF5350' }]}>
            {post.stats.likes}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shareButton}
          activeOpacity={0.8}
          onPress={() => handleAddToMeal(
            post.title, post.nutrition.calories,
            post.nutrition.protein, post.nutrition.carbs, post.nutrition.fat,
          )}
        >
          <LinearGradient
            colors={fitScore && fitScore >= 75 ? Theme.colors.primaryGradient : ['#999', '#bbb']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.shareGradient}
          >
            <Ionicons name="add-circle" size={18} color="#fff" />
            <Text style={styles.shareText}>添加到今日饮食</Text>
            {fitScore && (
              <View style={styles.fitScoreBadge}>
                <Text style={styles.fitScoreText}>匹配 {fitScore}%</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const NutritionItem = ({ value, unit, label, color }: { value: string; unit: string; label?: string; color?: string }) => (
  <View style={styles.nutritionItem}>
    <Text style={[styles.nutritionValue, color ? { color } : undefined]}>{value}</Text>
    <Text style={styles.nutritionUnit}>{unit}</Text>
    {label ? <Text style={styles.nutritionLabel}>{label}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg, paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1, borderBottomColor: '#F5F5FA',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  navTitle: { fontSize: Theme.fontSize.lg, fontWeight: 'bold', color: Theme.colors.text.primary, flex: 1, textAlign: 'center' },
  hero: { marginBottom: Theme.spacing.lg },
  mockHero: {
    height: 180, justifyContent: 'center', alignItems: 'center',
    backgroundColor: Theme.colors.background.primary,
  },
  mockHeroIcon: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: `${Theme.colors.primary}15`,
    justifyContent: 'center', alignItems: 'center',
  },
  heroGradient: { height: 200, justifyContent: 'center', alignItems: 'center' },
  heroEmoji: { fontSize: 80 },
  heroInfo: { paddingHorizontal: Theme.spacing.xl, paddingTop: Theme.spacing.xl },
  heroTitle: { fontSize: Theme.fontSize.xxl, fontWeight: 'bold', color: Theme.colors.text.primary, marginBottom: Theme.spacing.sm },
  heroDescription: { fontSize: Theme.fontSize.md, color: Theme.colors.text.secondary, lineHeight: 22, marginBottom: Theme.spacing.lg },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  authorAvatarLarge: { fontSize: 36 },
  authorInfo: { flex: 1 },
  authorNameText: { fontSize: Theme.fontSize.md, fontWeight: 'bold', color: Theme.colors.text.primary },
  statsRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg, marginHorizontal: Theme.spacing.xl,
    backgroundColor: '#FAFBFC', borderRadius: Theme.borderRadius.lg, marginBottom: Theme.spacing.lg,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, height: 30, backgroundColor: '#E0E0EA' },
  statValue: { fontSize: Theme.fontSize.md, fontWeight: 'bold', color: Theme.colors.text.primary },
  statLabel: { fontSize: Theme.fontSize.xs, color: Theme.colors.text.tertiary },
  difficultyDot: { width: 8, height: 8, borderRadius: 4 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Theme.spacing.xl, gap: Theme.spacing.sm, marginBottom: Theme.spacing.xl },
  tagChip: { backgroundColor: '#F0F9F0', paddingVertical: 4, paddingHorizontal: 12, borderRadius: Theme.borderRadius.full },
  tagText: { fontSize: Theme.fontSize.xs, color: Theme.colors.primary, fontWeight: '600' },
  section: { paddingHorizontal: Theme.spacing.xl, marginBottom: Theme.spacing.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm, marginBottom: Theme.spacing.lg },
  sectionIcon: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: Theme.fontSize.lg, fontWeight: 'bold', color: Theme.colors.text.primary, flex: 1 },
  sectionSub: { fontSize: Theme.fontSize.xs, color: Theme.colors.text.tertiary },
  nutritionGrid: { flexDirection: 'row', gap: Theme.spacing.md },
  nutritionItem: { flex: 1, backgroundColor: '#FAFBFC', borderRadius: Theme.borderRadius.md, padding: Theme.spacing.md, alignItems: 'center' },
  nutritionValue: { fontSize: Theme.fontSize.xl, fontWeight: 'bold', color: Theme.colors.text.primary },
  nutritionUnit: { fontSize: Theme.fontSize.xs, color: Theme.colors.text.tertiary, marginTop: 2 },
  nutritionLabel: { fontSize: 10, color: Theme.colors.text.light, marginTop: 2 },
  ingredientList: { backgroundColor: '#FAFBFC', borderRadius: Theme.borderRadius.lg, padding: Theme.spacing.lg, gap: Theme.spacing.md },
  ingredientItem: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md },
  ingredientDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Theme.colors.primary },
  ingredientName: { flex: 1, fontSize: Theme.fontSize.md, color: Theme.colors.text.primary },
  ingredientAmount: { fontSize: Theme.fontSize.md, color: Theme.colors.text.tertiary, fontWeight: '500' },
  stepsList: { gap: Theme.spacing.lg },
  stepItem: { flexDirection: 'row', gap: Theme.spacing.md },
  stepNumber: { width: 32, height: 32, borderRadius: 16, overflow: 'hidden' },
  stepNumberGradient: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  stepNumberText: { fontSize: Theme.fontSize.sm, fontWeight: 'bold', color: '#fff' },
  stepContent: { flex: 1, paddingTop: 4 },
  stepDescription: { fontSize: Theme.fontSize.md, color: Theme.colors.text.primary, lineHeight: 22 },
  stepTip: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: Theme.spacing.sm, backgroundColor: '#FFF8EE', paddingVertical: 8, paddingHorizontal: 12, borderRadius: Theme.borderRadius.sm },
  stepTipText: { fontSize: Theme.fontSize.sm, color: '#E65100', flex: 1, lineHeight: 18 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F5F5FA', gap: Theme.spacing.lg,
  },
  bottomAction: { alignItems: 'center', gap: 2 },
  bottomActionText: { fontSize: Theme.fontSize.xs, color: Theme.colors.text.tertiary, fontWeight: '500' },
  shareButton: { flex: 1, borderRadius: Theme.borderRadius.full, overflow: 'hidden' },
  shareGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 6 },
  shareText: { fontSize: Theme.fontSize.md, fontWeight: '700', color: '#fff' },
  fitScoreBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
    marginLeft: 4,
  },
  fitScoreText: { fontSize: 11, fontWeight: '600', color: '#fff' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  emptyText: { fontSize: 16, color: Theme.colors.text.secondary },
  backBtn: { paddingVertical: 10, paddingHorizontal: 24, backgroundColor: Theme.colors.primary, borderRadius: 8 },
  backBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
