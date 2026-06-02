import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFoodChannelStore, RecipePost } from '../store/foodChannelStore';
import { useHealthPlanetStore } from '../store/healthPlanetStore';
import { Theme } from '../theme';

type NavigationProp = NativeStackNavigationProp<any>;

const RecipeCard: React.FC<{
  post: RecipePost;
  isPremium: boolean;
  onPress: () => void;
  onLike: () => void;
  onCollect: () => void;
}> = ({ post, isPremium, onPress, onLike, onCollect }) => {
  const difficultyMap = { easy: '简单', medium: '中等', hard: '困难' };
  const difficultyColorMap = { easy: '#4CAF50', medium: '#FF9800', hard: '#F44336' };
  const isLocked = post.isMemberOnly && !isPremium;

  return (
    <TouchableOpacity style={styles.recipeCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardImage}>
        <Image source={{ uri: post.coverImage }} style={styles.coverImg} resizeMode="cover" />
        {isLocked && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={24} color="#fff" />
            <Text style={styles.lockText}>会员专享</Text>
          </View>
        )}
        <View style={styles.diffBadge}>
          <Text style={styles.diffBadgeText}>{difficultyMap[post.difficulty]}</Text>
        </View>
        {post.isMemberOnly && (
          <View style={styles.vipBadge}>
            <Text style={styles.vipBadgeIcon}>👑</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{post.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{post.description}</Text>
        
        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="flame-outline" size={13} color={Theme.colors.text.tertiary} />
            <Text style={styles.metaText}>{post.nutrition.calories}千卡</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color={Theme.colors.text.tertiary} />
            <Text style={styles.metaText}>{post.cookTime}分钟</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.authorRow}>
            <Text style={styles.authorEmoji}>{post.author.avatar}</Text>
            <Text style={styles.authorNameText}>{post.author.name}</Text>
            {post.author.isVerified && (
              <Ionicons name="checkmark-circle" size={12} color={Theme.colors.info} />
            )}
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={onLike} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={post.isLiked ? 'heart' : 'heart-outline'} size={16} color={post.isLiked ? '#EF5350' : '#ccc'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onCollect} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={post.isCollected ? 'bookmark' : 'bookmark-outline'} size={16} color={post.isCollected ? '#FF9800' : '#ccc'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const HealthyFoodScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { posts, categories, selectedCategory, setCategory, toggleLike, toggleCollect } = useFoodChannelStore();
  const { creators, currentUserTier } = useHealthPlanetStore();
  const isPremium = currentUserTier === 'premium';

  const filteredPosts = selectedCategory === '全部'
    ? posts
    : posts.filter(post => post.category === selectedCategory);

  const foodCreators = creators.filter(c => c.recipes > 10);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerIconWrap}>
            <Ionicons name="restaurant" size={20} color="#FF9800" />
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle} numberOfLines={1}>营养美食</Text>
            <Text style={styles.headerSub} numberOfLines={1}>健康食谱 · 科学饮食</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.publishBtn} onPress={() => navigation.navigate('PublishRecipe' as any)} activeOpacity={0.8}>
          <Ionicons name="add-circle-outline" size={20} color="#FF9800" />
          <Text style={styles.publishText}>发布</Text>
        </TouchableOpacity>
      </View>

      {foodCreators.length > 0 && (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.creatorScroll}>
        {foodCreators.map((creator) => (
          <TouchableOpacity key={creator.id} style={styles.creatorItem} activeOpacity={0.7}>
            <View style={styles.creatorAvatarWrap}>
              <Text style={styles.creatorAvatarEmoji}>{creator.avatar}</Text>
            </View>
            <Text style={styles.creatorName} numberOfLines={1}>{creator.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
            onPress={() => setCategory(cat)}
            activeOpacity={0.7}
          >
            <Text style={[styles.catChipText, selectedCategory === cat && styles.catChipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <RecipeCard
            post={item}
            isPremium={isPremium}
            onPress={() => {
              if (item.isMemberOnly && !isPremium) return;
              navigation.navigate('RecipeDetail' as any, { postId: item.id });
            }}
            onLike={() => toggleLike(item.id)}
            onCollect={() => toggleCollect(item.id)}
          />
        )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
  },
  headerSub: {
    fontSize: 12,
    color: Theme.colors.text.tertiary,
    marginTop: 1,
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF3E0',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  publishText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF9800',
  },
  creatorScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  creatorItem: {
    alignItems: 'center',
    width: 56,
  },
  creatorAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  creatorAvatarEmoji: {
    fontSize: 22,
  },
  creatorName: {
    fontSize: 11,
    color: Theme.colors.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F5F5FA',
  },
  catChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
  },
  catChipActive: {
    backgroundColor: '#FF9800',
  },
  catChipText: {
    fontSize: 13,
    color: Theme.colors.text.secondary,
    fontWeight: '500',
  },
  catChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    gap: 12,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    ...Theme.cardShadow,
  },
  cardImage: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  coverImg: {
    width: 120,
    height: 120,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  lockText: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: '600',
  },
  diffBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  diffBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  vipBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vipBadgeIcon: {
    fontSize: 12,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    lineHeight: 20,
  },
  cardDesc: {
    fontSize: 12,
    color: Theme.colors.text.tertiary,
    lineHeight: 17,
    marginTop: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorEmoji: {
    fontSize: 14,
  },
  authorNameText: {
    fontSize: 11,
    color: Theme.colors.text.tertiary,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: Theme.colors.text.light,
    marginTop: 12,
  },
});
