import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../theme';
import { weeklyRecipes } from '../constants/mockData';
import { useNutritionStore } from '../store/nutritionStore';
import { sortRecipesByFit, buildNutritionContext } from '../services/recipeService';

const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'breakfast', label: '早餐' },
  { key: 'lunch', label: '午餐' },
  { key: 'dinner', label: '晚餐' },
  { key: 'snack', label: '小食' },
];

export const RecipesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const scoredRecipes = useMemo(() => {
    if (!nutritionContext) return weeklyRecipes.map(r => ({ ...r, fitScore: 50 }));
    return sortRecipesByFit(weeklyRecipes, nutritionContext);
  }, [nutritionContext]);

  const filtered = scoredRecipes.filter((r) => {
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const topWeekly = scoredRecipes.slice(0, 3);

  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>健康食谱</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索食谱..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.categoryRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.chip, selectedCategory === cat.key && styles.chipActive]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <Text style={[styles.chipText, selectedCategory === cat.key && styles.chipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {nutritionContext ? '今日推荐' : '本周推荐'}
          </Text>
          {nutritionContext && (
            <Text style={styles.sectionSubtitle}>基于您今日营养目标推荐</Text>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          {topWeekly.map((recipe) => (
            <TouchableOpacity
              key={recipe.id}
              style={styles.featuredCard}
              onPress={() => navigation.navigate('RecipeDetail', { postId: recipe.id })}
              activeOpacity={0.8}
            >
              <View style={styles.featuredIcon}>
                <Ionicons name="restaurant-outline" size={28} color={Theme.colors.primary} />
              </View>
              <Text style={styles.featuredName} numberOfLines={2}>{recipe.name}</Text>
              <View style={styles.featuredMeta}>
                <Text style={styles.featuredCalories}>{recipe.calories}千卡</Text>
                <Text style={styles.featuredTime}>{recipe.prepTime}分钟</Text>
              </View>
              {nutritionContext && recipe.fitScore >= 70 && (
                <View style={styles.fitBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {!user && (
          <View style={styles.profilePrompt}>
            <Ionicons name="person-circle-outline" size={18} color={Theme.colors.accent} />
            <Text style={styles.profilePromptText}>完成个人设置，获取个性化推荐</Text>
          </View>
        )}

        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#ddd" />
            <Text style={styles.emptyText}>未找到匹配的食谱</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>全部食谱</Text>
            {filtered.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.card}
                onPress={() => navigation.navigate('RecipeDetail', { postId: recipe.id })}
                activeOpacity={0.8}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name="restaurant-outline" size={24} color={Theme.colors.primary} />
                </View>
                <View style={styles.cardInfo}>
                  <View style={styles.cardNameRow}>
                    <Text style={styles.cardName}>{recipe.name}</Text>
                    {recipe.fitScore >= 75 && (
                      <View style={styles.cardFitBadge}>
                        <Text style={styles.cardFitText}>适合你</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardCategory}>
                    {CATEGORIES.find(c => c.key === recipe.category)?.label || recipe.category}
                  </Text>
                  <View style={styles.cardMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="flame-outline" size={14} color={Theme.colors.accent} />
                      <Text style={styles.metaText}>{recipe.calories}千卡</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color={Theme.colors.info} />
                      <Text style={styles.metaText}>{recipe.prepTime}分钟</Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background.primary },
  header: { backgroundColor: '#fff', padding: 20, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#333', marginLeft: 8 },
  categoryRow: { paddingVertical: 12, paddingHorizontal: 16 },
  chip: {
    paddingVertical: 8, paddingHorizontal: 18, backgroundColor: '#fff',
    borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#eee',
  },
  chipActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  chipText: { fontSize: 14, color: '#666', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  list: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  featuredCard: {
    width: 140, backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginRight: 12, borderWidth: 1, borderColor: '#f0f0f0', position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  featuredIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: `${Theme.colors.primary}15`,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12, alignSelf: 'center',
  },
  featuredName: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, textAlign: 'center' },
  featuredMeta: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  featuredCalories: { fontSize: 11, color: Theme.colors.accent, fontWeight: '600' },
  featuredTime: { fontSize: 11, color: Theme.colors.info, fontWeight: '600' },
  fitBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: Theme.colors.primary, borderRadius: 10,
    width: 20, height: 20, justifyContent: 'center', alignItems: 'center',
  },
  sectionHeader: { marginBottom: 12 },
  sectionSubtitle: { fontSize: 12, color: '#999', marginTop: 2 },
  profilePrompt: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, marginBottom: 8, gap: 6,
  },
  profilePromptText: { fontSize: 13, color: Theme.colors.accent },
  cardNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  cardFitBadge: {
    backgroundColor: `${Theme.colors.primary}15`, borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  cardFitText: { fontSize: 11, color: Theme.colors.primary, fontWeight: '600' },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  cardIcon: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: `${Theme.colors.primary}12`,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 2 },
  cardCategory: { fontSize: 12, color: '#999', marginBottom: 6 },
  cardMeta: { flexDirection: 'row', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#666' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 12 },
});
