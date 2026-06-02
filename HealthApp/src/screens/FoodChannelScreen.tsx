import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFoodChannelStore, RecipePost } from '../store/foodChannelStore';
import { useNutritionStore } from '../store/nutritionStore';
import { sortRecipesByFit, buildNutritionContext } from '../services/recipeService';
import { Theme } from '../theme';

type NavigationProp = NativeStackNavigationProp<any>;

const RecipeCard: React.FC<{
  post: RecipePost & { fitScore?: number };
  onPress: () => void;
  onLike: () => void;
  onCollect: () => void;
}> = ({ post, onPress, onLike, onCollect }) => {
  const difficultyMap = { easy: '简单', medium: '中等', hard: '困难' };
  const difficultyColorMap = { easy: '#4CAF50', medium: '#FF9800', hard: '#F44336' };

  return (
    <TouchableOpacity style={styles.recipeCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.recipeLeft}>
        <Image source={{ uri: post.coverImage }} style={styles.recipeCover} />
        <View style={[styles.recipeDifficultyDot, { backgroundColor: difficultyColorMap[post.difficulty] }]}>
          <Text style={styles.recipeDifficultyDotText}>{difficultyMap[post.difficulty].charAt(0)}</Text>
        </View>
        {post.stats.views > 10000 && (
          <View style={styles.recipeFeaturedBadge}>
            <Ionicons name="star" size={8} color="#FFD700" />
          </View>
        )}
      </View>
      <View style={styles.recipeRight}>
        <View style={styles.recipeTopRow}>
          <Text style={styles.recipeTitle} numberOfLines={1}>{post.title}</Text>
          {post.fitScore && post.fitScore >= 75 && (
            <View style={styles.fitBadge}>
              <Ionicons name="checkmark-circle" size={10} color={Theme.colors.primary} />
            </View>
          )}
          {post.isMemberOnly && (
            <View style={styles.memberBadge}>
              <Ionicons name="diamond" size={10} color="#fff" />
            </View>
          )}
        </View>

        <View style={styles.recipeMetaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="flame-outline" size={12} color={Theme.colors.accent} />
            <Text style={styles.metaText}>{post.nutrition.calories}千卡</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={Theme.colors.info} />
            <Text style={styles.metaText}>{post.cookTime}分钟</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaText}>{post.servings}人份</Text>
          </View>
        </View>

        <View style={styles.recipeAuthorRow}>
          <Text style={styles.authorAvatarSm}>{post.author.avatar}</Text>
          <Text style={styles.authorNameSm}>{post.author.name}</Text>
          {post.author.isVerified && (
            <Ionicons name="checkmark-circle" size={12} color={Theme.colors.info} />
          )}
        </View>

        {post.tags.length > 0 && (
          <View style={styles.tagRow}>
            {post.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.recipeActions}>
          <TouchableOpacity style={styles.actionItem} onPress={onLike}>
            <Ionicons
              name={post.isLiked ? 'heart' : 'heart-outline'}
              size={15}
              color={post.isLiked ? '#EF5350' : Theme.colors.text.tertiary}
            />
            <Text style={[styles.actionText, post.isLiked && { color: '#EF5350' }]}>
              {post.stats.likes > 999 ? `${(post.stats.likes / 1000).toFixed(1)}k` : post.stats.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={onCollect}>
            <Ionicons
              name={post.isCollected ? 'bookmark' : 'bookmark-outline'}
              size={15}
              color={post.isCollected ? '#FF9800' : Theme.colors.text.tertiary}
            />
            <Text style={[styles.actionText, post.isCollected && { color: '#FF9800' }]}>
              {post.stats.collections > 999 ? `${(post.stats.collections / 1000).toFixed(1)}k` : post.stats.collections}
            </Text>
          </TouchableOpacity>

          <View style={styles.actionItem}>
            <Ionicons name="chatbubble-outline" size={15} color={Theme.colors.text.tertiary} />
            <Text style={styles.actionText}>{post.stats.comments}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

  // 博主展示暂时隐藏，待真实用户内容上线后再开启
  // const CreatorAvatar: React.FC<{ creator: RecipeAuthor; isFirst?: boolean }> = (...) => (...)
  // const uniqueCreators = ...

export const FoodChannelScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const posts = useFoodChannelStore((s) => s.posts);
  const categories = useFoodChannelStore((s) => s.categories);
  const selectedCategory = useFoodChannelStore((s) => s.selectedCategory);
  const setCategory = useFoodChannelStore((s) => s.setCategory);
  const toggleLike = useFoodChannelStore((s) => s.toggleLike);
  const toggleCollect = useFoodChannelStore((s) => s.toggleCollect);

  const user = useNutritionStore((s) => s.user);
  const dailyNutrition = useNutritionStore((s) => s.dailyNutrition);
  const calculateDailyGoals = useNutritionStore((s) => s.calculateDailyGoals);

  const goals = useMemo(() => (user ? calculateDailyGoals() : null), [user]);
  const nutritionContext = useMemo(() => {
    if (!goals || !user) return null;
    return buildNutritionContext(
      goals,
      { calories: dailyNutrition.calories, protein: dailyNutrition.protein, carbs: dailyNutrition.carbs, fat: dailyNutrition.fat },
      user.goal,
    );
  }, [goals, dailyNutrition, user]);

  const scoredPosts = useMemo(() => {
    if (!nutritionContext) return posts.map(p => ({ ...p, fitScore: 50 }));
    return sortRecipesByFit(posts, nutritionContext);
  }, [posts, nutritionContext]);

  const displayCategories = useMemo(() => ['为你推荐', ...categories], [categories]);

  const isRecommended = selectedCategory === '为你推荐';
  const filteredPosts = isRecommended
    ? scoredPosts
    : (selectedCategory === '全部'
      ? scoredPosts
      : scoredPosts.filter(post => post.category === selectedCategory));

  // 去重博主（暂时隐藏）
  // const uniqueCreators = posts.reduce<RecipeAuthor[]>((acc, post) => {
  //   if (!acc.find(c => c.id === post.author.id)) {
  //     acc.push(post.author);
  //   }
  //   return acc;
  // }, []);

  const handlePostPress = (post: RecipePost) => {
    navigation.navigate('RecipeDetail' as any, { postId: post.id });
  };

  const handlePublish = () => {
    navigation.navigate('PublishRecipe' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={Theme.colors.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerIcon}
          >
            <Ionicons name="restaurant" size={22} color="#fff" />
          </LinearGradient>
          <Text style={styles.headerTitle}>营养美食</Text>
        </View>
        <TouchableOpacity style={styles.publishButton} onPress={handlePublish} activeOpacity={0.8}>
          <LinearGradient
            colors={Theme.colors.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.publishGradient}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.publishText}>发布食谱</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* 博主展示暂时隐藏
      <View style={styles.creatorSection}>
        ...
      </View>
      */}

      <View style={styles.categorySection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {displayCategories.map((category) => {
            const isActive = selectedCategory === category;
            const isRecCategory = category === '为你推荐';
            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  isActive && styles.categoryChipActive,
                  isRecCategory && !isActive && styles.categoryChipRecommend,
                ]}
                onPress={() => setCategory(category)}
                activeOpacity={0.7}
              >
                {isRecCategory && !isActive && (
                  <Ionicons name="sparkles" size={14} color={Theme.colors.accent} />
                )}
                <View style={[styles.categoryDot, isActive && styles.categoryDotActive]} />
                <Text style={[
                  styles.categoryText,
                  isActive && styles.categoryTextActive,
                  isRecCategory && !isActive && { color: Theme.colors.accent },
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeCard
            post={item}
            onPress={() => handlePostPress(item)}
            onLike={() => toggleLike(item.id)}
            onCollect={() => toggleCollect(item.id)}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={48} color={Theme.colors.text.light} />
            <Text style={styles.emptyText}>暂无该分类的食谱</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    letterSpacing: 0.5,
  },
  publishButton: {
    borderRadius: Theme.borderRadius.full,
    overflow: 'hidden',
  },
  publishGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 4,
  },
  publishText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '700',
    color: '#fff',
  },
  creatorSection: {
    paddingHorizontal: Theme.spacing.xl,
    marginBottom: Theme.spacing.lg,
  },
  creatorSectionTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: '700',
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  creatorContainer: {
    gap: Theme.spacing.lg,
    alignItems: 'center',
  },
  creatorCard: {
    alignItems: 'center',
    width: 64,
  },
  creatorAvatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  creatorAvatarActive: {
    borderWidth: 2,
    borderColor: Theme.colors.primary,
  },
  creatorAvatar: {
    fontSize: 24,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  creatorName: {
    fontSize: 11,
    color: Theme.colors.text.secondary,
    fontWeight: '500',
  },
  creatorMore: {
    alignItems: 'center',
    width: 64,
  },
  creatorMoreCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: `${Theme.colors.primary}12`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  creatorMoreText: {
    fontSize: 11,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  categorySection: {
    marginBottom: Theme.spacing.md,
  },
  categoryContainer: {
    paddingHorizontal: Theme.spacing.xl,
    gap: Theme.spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: Theme.colors.border.medium,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  categoryChipRecommend: {
    borderColor: Theme.colors.accent,
    borderWidth: 1,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.border.medium,
  },
  categoryDotActive: {
    backgroundColor: '#fff',
  },
  categoryText: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.secondary,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xl,
    gap: Theme.spacing.lg,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    ...Theme.cardShadow,
    minHeight: 130,
  },
  recipeLeft: {
    width: 120,
    minHeight: 130,
    backgroundColor: '#F5F7FA',
    position: 'relative',
    overflow: 'hidden',
  },
  recipeCover: {
    width: 120,
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  recipeDifficultyDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeDifficultyDotText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  recipeFeaturedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,180,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeRight: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  recipeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recipeTitle: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    fontWeight: '700',
    color: Theme.colors.text.primary,
  },
  memberBadge: {
    backgroundColor: Theme.colors.purple,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fitBadge: {
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeMetaRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: Theme.colors.text.tertiary,
  },
  recipeAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  authorAvatarSm: {
    fontSize: 14,
  },
  authorNameSm: {
    fontSize: 11,
    color: Theme.colors.text.secondary,
    fontWeight: '500',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  tagChip: {
    backgroundColor: `${Theme.colors.primary}10`,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 0.5,
    borderColor: `${Theme.colors.primary}30`,
  },
  tagText: {
    fontSize: 10,
    color: Theme.colors.primary,
    fontWeight: '500',
  },
  recipeActions: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginTop: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  actionText: {
    fontSize: 11,
    color: Theme.colors.text.tertiary,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.light,
    marginTop: Theme.spacing.md,
  },
});
