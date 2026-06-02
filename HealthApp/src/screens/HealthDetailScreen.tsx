import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useNutritionStore } from '../store/nutritionStore';
import { useExerciseStore } from '../store/exerciseStore';
import { Theme } from '../theme';

export const HealthDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const user = useNutritionStore((s) => s.user);
  const mealRecords = useNutritionStore((s) => s.mealRecords);
  const dailyNutrition = useNutritionStore((s) => s.dailyNutrition);
  const calculateDailyGoals = useNutritionStore((s) => s.calculateDailyGoals);
  const getTodayCalories = useExerciseStore((s) => s.getTodayCalories);
  const getTodayDuration = useExerciseStore((s) => s.getTodayDuration);
  const getTodayExercises = useExerciseStore((s) => s.getTodayExercises);
  const getWeeklyStats = useExerciseStore((s) => s.getWeeklyStats);
  const getStreak = useExerciseStore((s) => s.getStreak);

  const goals = useMemo(() => user ? calculateDailyGoals() : null, [user]);

  const today = new Date().toISOString().split('T')[0];
  const todayRecords = mealRecords.filter((r) => r.recordDate === today);
  const totalFoods = todayRecords.flatMap((r) => r.foods);

  const todayExCalories = getTodayCalories();
  const todayExDuration = getTodayDuration();
  const todayExercises = getTodayExercises();
  const weeklyStats = getWeeklyStats();
  const streak = getStreak();

  const weekTotalCalories = weeklyStats.reduce((s, d) => s + d.totalCalories, 0);
  const weekTotalDuration = weeklyStats.reduce((s, d) => s + d.totalDuration, 0);
  const weekActiveDays = weeklyStats.filter((d) => d.exerciseCount > 0).length;

  const netCalories = dailyNutrition.calories - todayExCalories;

  const barData = [
    { label: '热量', current: dailyNutrition.calories, target: goals?.calories || 2000, unit: '千卡', color: Theme.colors.primary },
    { label: '蛋白质', current: dailyNutrition.protein, target: goals?.protein || 60, unit: 'g', color: Theme.colors.info },
    { label: '碳水', current: dailyNutrition.carbs, target: goals?.carbs || 200, unit: 'g', color: Theme.colors.accent },
    { label: '脂肪', current: dailyNutrition.fat, target: goals?.fat || 55, unit: 'g', color: Theme.colors.purple },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>健康详情</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* 今日综合评分 */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>今日综合健康评分</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreValue}>
              {[
                dailyNutrition.calories > 0,
                dailyNutrition.protein > 0,
                todayExCalories > 0,
                streak > 0,
              ].filter(Boolean).length * 25}
            </Text>
            <Text style={styles.scoreSuffix}>分</Text>
          </View>
          <View style={styles.scoreBarBg}>
            <View style={[styles.scoreBarFill, {
              width: `${[
                dailyNutrition.calories > 0,
                dailyNutrition.protein > 0,
                todayExCalories > 0,
                streak > 0,
              ].filter(Boolean).length * 25}%` as any,
            }]} />
          </View>
        </View>

        {/* 营养摄入详情 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>营养摄入</Text>
          {barData.map((item) => {
            const pct = item.target > 0 ? Math.min(item.current / item.target, 1) : 0;
            const isOver = item.current > item.target;
            return (
              <View key={item.label} style={styles.barRow}>
                <View style={styles.barLabelRow}>
                  <Text style={styles.barLabel}>{item.label}</Text>
                  <Text style={[styles.barValue, { color: isOver ? Theme.colors.accent : item.color }]}>
                    {Math.round(item.current)} <Text style={styles.barUnit}>/ {item.target}{item.unit}</Text>
                  </Text>
                </View>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${pct * 100}%` as any, backgroundColor: item.color }]} />
                </View>
              </View>
            );
          })}
        </View>

        {/* 今日饮食记录 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今日饮食</Text>
          {todayRecords.length === 0 ? (
            <Text style={styles.emptyText}>暂无饮食记录</Text>
          ) : (
            todayRecords.map((record) => (
              <View key={record.id} style={styles.mealBlock}>
                <Text style={styles.mealType}>
                  {{ breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' }[record.mealType]}
                </Text>
                {record.foods.map((food) => (
                  <View key={food.id} style={styles.foodRow}>
                    <Text style={styles.foodName}>{food.foodName}</Text>
                    <Text style={styles.foodCal}>{food.calories}千卡</Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </View>

        {/* 今日运动记录 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今日运动</Text>
          {todayExercises.length === 0 ? (
            <Text style={styles.emptyText}>暂无运动记录</Text>
          ) : (
            todayExercises.map((ex) => (
              <View key={ex.id} style={styles.exRow}>
                <Text style={styles.exIcon}>{ex.exerciseIcon}</Text>
                <View style={styles.exInfo}>
                  <Text style={styles.exName}>{ex.exerciseName}</Text>
                  <Text style={styles.exMeta}>{ex.duration}分钟 · {ex.calories}千卡</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* 本周趋势 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>本周趋势</Text>
          <View style={styles.trendGrid}>
            <View style={styles.trendItem}>
              <Text style={[styles.trendValue, { color: Theme.colors.primary }]}>{weekTotalCalories}</Text>
              <Text style={styles.trendLabel}>消耗(千卡)</Text>
            </View>
            <View style={styles.trendItem}>
              <Text style={[styles.trendValue, { color: Theme.colors.info }]}>{weekTotalDuration}</Text>
              <Text style={styles.trendLabel}>运动(分钟)</Text>
            </View>
            <View style={styles.trendItem}>
              <Text style={[styles.trendValue, { color: Theme.colors.accent }]}>{weekActiveDays}/7</Text>
              <Text style={styles.trendLabel}>运动天数</Text>
            </View>
            <View style={styles.trendItem}>
              <Text style={[styles.trendValue, { color: Theme.colors.purple }]}>{streak}</Text>
              <Text style={styles.trendLabel}>连续天数</Text>
            </View>
          </View>
          <View style={styles.weekBar}>
            {weeklyStats.map((day, i) => (
              <View key={i} style={styles.barCol}>
                <View style={[styles.barColFill, {
                  height: Math.max((day.totalCalories / 300) * 40, 2),
                  opacity: day.exerciseCount > 0 ? 1 : 0.2,
                  backgroundColor: day.exerciseCount > 0 ? Theme.colors.info : Theme.colors.text.light,
                }]} />
                <Text style={styles.barColLabel}>
                  {['日','一','二','三','四','五','六'][(new Date().getDay() - 6 + i + 7) % 7]}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8, paddingVertical: 12, backgroundColor: '#fff',
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F7FA', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text.primary },
  content: { paddingBottom: 40 },

  scoreCard: {
    marginHorizontal: 20, marginTop: 16, backgroundColor: '#fff',
    borderRadius: 20, padding: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 14, elevation: 4,
  },
  scoreLabel: { fontSize: 14, color: Theme.colors.text.secondary, fontWeight: '500' },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 8 },
  scoreValue: { fontSize: 48, fontWeight: '800', color: Theme.colors.primary },
  scoreSuffix: { fontSize: 18, color: Theme.colors.text.tertiary, fontWeight: '600', marginLeft: 4 },
  scoreBarBg: {
    width: '100%', height: 6, borderRadius: 3, backgroundColor: '#E8E8F0', marginTop: 12, overflow: 'hidden',
  },
  scoreBarFill: { height: '100%', borderRadius: 3, backgroundColor: Theme.colors.primary },

  section: {
    marginHorizontal: 20, marginTop: 12, backgroundColor: '#fff',
    borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 14, elevation: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 16 },

  barRow: { marginBottom: 14 },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  barLabel: { fontSize: 13, color: Theme.colors.text.secondary, fontWeight: '500' },
  barValue: { fontSize: 13, fontWeight: '700' },
  barUnit: { fontSize: 11, fontWeight: '400', color: Theme.colors.text.tertiary },
  barBg: { height: 8, borderRadius: 4, backgroundColor: '#F0F0F5', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },

  emptyText: { fontSize: 14, color: Theme.colors.text.light, textAlign: 'center', paddingVertical: 20 },

  mealBlock: { marginBottom: 12 },
  mealType: { fontSize: 14, fontWeight: '600', color: Theme.colors.primary, marginBottom: 8 },
  foodRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, paddingLeft: 12 },
  foodName: { fontSize: 13, color: Theme.colors.text.primary },
  foodCal: { fontSize: 13, color: Theme.colors.text.secondary, fontWeight: '500' },

  exRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  exIcon: { fontSize: 24 },
  exInfo: { flex: 1 },
  exName: { fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary },
  exMeta: { fontSize: 12, color: Theme.colors.text.tertiary, marginTop: 2 },

  trendGrid: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  trendItem: { flex: 1, backgroundColor: '#F8FAFE', borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 },
  trendValue: { fontSize: 16, fontWeight: '800' },
  trendLabel: { fontSize: 10, color: Theme.colors.text.tertiary },

  weekBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 56, borderTopWidth: 1, borderTopColor: '#F0F0F5', paddingTop: 8 },
  barCol: { alignItems: 'center', gap: 4 },
  barColFill: { width: 20, borderRadius: 8 },
  barColLabel: { fontSize: 10, color: Theme.colors.text.light },
});
