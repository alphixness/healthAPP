import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { colors, typography, borderRadius, spacing } from '../../constants/theme';
import AdminUserList from '../../components/admin/AdminUserList';
import AdminLlmConfig from '../../components/admin/AdminLlmConfig';
import AdminAppUpdate from '../../components/admin/AdminAppUpdate';

interface Stats {
  totalUsers: number;
  newUsersToday: number;
  activeUsersToday: number;
  totalMeals: number;
  totalExercises: number;
  totalRecipes: number;
}

interface Recipe {
  id: string;
  name: string;
  category: string;
  calories: number;
  image?: string;
}

type TabKey = 'overview' | 'users' | 'recipes' | 'llm' | 'updates';

interface TabDefinition {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabDefinition[] = [
  { key: 'overview', label: '概览', icon: 'stats-chart' },
  { key: 'users', label: '用户管理', icon: 'people' },
  { key: 'recipes', label: '食谱管理', icon: 'restaurant' },
  { key: 'llm', label: '模型配置', icon: 'cloud' },
  { key: 'updates', label: '版本更新', icon: 'phone-portrait' },
];

function StatCardItem({
  icon,
  iconColor,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string | number;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconCircle, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={[typography.numberSmall, { color: colors.textPrimary, marginTop: spacing.sm }]}>
        {value}
      </Text>
      <Text
        style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

function RecipeRow({ item }: { item: Recipe }) {
  return (
    <View style={styles.recipeRow}>
      <View style={styles.recipeInfo}>
        <Text style={[typography.bodyBold, { color: colors.textPrimary }]} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.recipeMeta}>
          <View style={[styles.badge, { backgroundColor: colors.primaryBg }]}>
            <Text style={[typography.caption, { color: colors.primary }]}>{item.category}</Text>
          </View>
          <Text style={[typography.caption, { color: colors.textTertiary }]}>
            {item.calories} kcal
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </View>
  );
}

export default function AdminDashboard() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recipesLoading, setRecipesLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.admin.getStats();
      if (res.success && res.data) {
        setStats(res.data as Stats);
      }
    } catch {
      // Error fetching stats
    }
  }, []);

  const fetchRecipes = useCallback(async () => {
    setRecipesLoading(true);
    try {
      const res = await api.admin.getRecipes(100);
      if (res.success && res.data) {
        setRecipes((res.data as Recipe[]) || []);
      }
    } catch {
      // Error fetching recipes
    } finally {
      setRecipesLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    await fetchStats();
    if (activeTab === 'recipes') {
      await fetchRecipes();
    }
    setLoading(false);
  }, [activeTab, fetchStats, fetchRecipes]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    if (activeTab === 'recipes') {
      await fetchRecipes();
    }
    setRefreshing(false);
  }, [activeTab, fetchStats, fetchRecipes]);

  useEffect(() => {
    if (activeTab === 'recipes') {
      fetchRecipes();
    }
  }, [activeTab, fetchRecipes]);

  const statsConfig: { icon: keyof typeof Ionicons.glyphMap; iconColor: string; label: string; valueKey: keyof Stats }[] = [
    { icon: 'people', iconColor: colors.primary, label: '总用户数', valueKey: 'totalUsers' },
    { icon: 'person-add', iconColor: colors.info, label: '今日新增', valueKey: 'newUsersToday' },
    { icon: 'flash', iconColor: colors.accent, label: '今日活跃', valueKey: 'activeUsersToday' },
    { icon: 'nutrition', iconColor: colors.secondary, label: '总饮食记录', valueKey: 'totalMeals' },
    { icon: 'fitness', iconColor: colors.sports, label: '总运动记录', valueKey: 'totalExercises' },
    { icon: 'book', iconColor: colors.premium, label: '总食谱数', valueKey: 'totalRecipes' },
  ];

  const renderOverview = () => (
    <ScrollView
      contentContainerStyle={styles.overviewContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.statsGrid}>
        {statsConfig.map((cfg) => (
          <StatCardItem
            key={cfg.valueKey}
            icon={cfg.icon}
            iconColor={cfg.iconColor}
            label={cfg.label}
            value={stats ? stats[cfg.valueKey] : '--'}
          />
        ))}
      </View>
    </ScrollView>
  );

  const renderRecipes = () => {
    if (recipesLoading && recipes.length === 0) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    return (
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RecipeRow item={item} />}
        contentContainerStyle={styles.recipeList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.centerContent}>
            <Ionicons name="restaurant-outline" size={48} color={colors.textTertiary} />
            <Text style={[typography.body, { color: colors.textTertiary, marginTop: spacing.md }]}>
              暂无食谱数据
            </Text>
          </View>
        }
      />
    );
  };

  const renderTabContent = () => {
    if (loading && !stats) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'users':
        return <AdminUserList />;
      case 'recipes':
        return renderRecipes();
      case 'llm':
        return <AdminLlmConfig />;
      case 'updates':
        return <AdminAppUpdate />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[typography.h2, { color: colors.textPrimary, flex: 1 }]}>管理后台</Text>
      </View>

      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={isActive ? colors.primary : colors.textTertiary}
              />
              <Text
                style={[
                  typography.caption,
                  { color: isActive ? colors.primary : colors.textTertiary, marginLeft: spacing.xs },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.content}>{renderTabContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  tabItemActive: {
    backgroundColor: colors.primaryBg,
  },
  content: {
    flex: 1,
    marginTop: spacing.md,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  overviewContent: {
    padding: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  recipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  recipeInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
});
