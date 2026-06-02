import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useNutritionStore } from '../store/nutritionStore';
import { useExerciseStore } from '../store/exerciseStore';
import { generateWeeklyReport, WeeklyReport, WeeklyReportParams } from '../services/reportService';

function getWeekRange() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  return { start: fmt(monday), end: fmt(sunday) };
}

export const ReportScreen: React.FC = () => {
  const navigation = useNavigation();
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const user = useNutritionStore((s) => s.user);
  const mealRecords = useNutritionStore((s) => s.mealRecords);
  const calculateDailyGoals = useNutritionStore((s) => s.calculateDailyGoals);
  const getWeeklyStats = useExerciseStore((s) => s.getWeeklyStats);
  const getStreak = useExerciseStore((s) => s.getStreak);

  const weekRange = useMemo(() => getWeekRange(), []);

  const generateReport = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

      // Calculate weekly nutrition
      const weekMeals = mealRecords.filter(
        (r) => r.recordDate >= weekAgo && r.recordDate <= today
      );
      const weeklyTotals = weekMeals.reduce(
        (acc, record) => {
          record.foods.forEach((food) => {
            acc.calories += food.calories;
            acc.protein += food.protein;
            acc.carbs += food.carbs;
            acc.fat += food.fat;
          });
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      // Weekly exercise stats
      const weeklyStats = getWeeklyStats();
      const exerciseDays = weeklyStats.filter((d) => d.exerciseCount > 0).length;
      const totalExerciseCalories = weeklyStats.reduce((a, d) => a + d.totalCalories, 0);
      const totalExerciseDuration = weeklyStats.reduce((a, d) => a + d.totalDuration, 0);

      const goals = calculateDailyGoals();
      const currentUser = useNutritionStore.getState().user;

      const params: WeeklyReportParams = {
        weekStart: weekRange.start,
        weekEnd: weekRange.end,
        totalCalories: weeklyTotals.calories,
        goalCalories: goals.calories,
        totalProtein: weeklyTotals.protein,
        totalCarbs: weeklyTotals.carbs,
        totalFat: weeklyTotals.fat,
        exerciseDays,
        totalExerciseCalories,
        totalExerciseDuration,
        streak: getStreak(),
        goal: currentUser?.goal || 'maintain',
        activityLevel: currentUser?.activityLevel || 'moderate',
      };

      const result = await generateWeeklyReport(params);
      setReport(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [mealRecords, getWeeklyStats, getStreak, calculateDailyGoals, weekRange]);

  useEffect(() => {
    generateReport();
  }, [generateReport]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 60) return '一般';
    if (score >= 40) return '需改善';
    return '待努力';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>健康周报</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>正在生成你的健康周报...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={48} color="#ccc" />
          <Text style={styles.errorText}>生成失败，请重试</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={generateReport}>
            <Text style={styles.retryText}>重新生成</Text>
          </TouchableOpacity>
        </View>
      ) : report ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={generateReport} />
          }
        >
          {/* Week Range */}
          <Text style={styles.weekLabel}>{weekRange.start} - {weekRange.end}</Text>

          {/* Score Circle */}
          <View style={styles.scoreSection}>
            <View style={[styles.scoreCircle, { borderColor: getScoreColor(report.score) }]}>
              <Text style={[styles.scoreNumber, { color: getScoreColor(report.score) }]}>
                {report.score}
              </Text>
              <Text style={styles.scoreUnit}>分</Text>
            </View>
            <Text style={[styles.scoreLabel, { color: getScoreColor(report.score) }]}>
              {getScoreLabel(report.score)}
            </Text>
          </View>

          {/* AI Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="chatbubble-ellipses" size={18} color="#4CAF50" />
              <Text style={styles.sectionTitle}>AI 总结</Text>
            </View>
            <Text style={styles.summaryText}>{report.summary}</Text>
          </View>

          {/* Highlights */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trophy" size={18} color="#FF9800" />
              <Text style={styles.sectionTitle}>本周亮点</Text>
            </View>
            {report.highlights.map((item, i) => (
              <View key={i} style={styles.bulletItem}>
                <Text style={styles.bullet}>●</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Recommendations */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb" size={18} color="#2196F3" />
              <Text style={styles.sectionTitle}>改进建议</Text>
            </View>
            {report.recommendations.map((item, i) => (
              <View key={i} style={styles.bulletItem}>
                <Text style={[styles.bullet, { color: '#2196F3' }]}>◆</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.generatedAt}>
            生成时间：{new Date(report.generatedAt).toLocaleString('zh-CN')}
          </Text>
        </ScrollView>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 15,
    color: '#666',
    marginTop: 16,
  },
  errorText: {
    fontSize: 15,
    color: '#666',
    marginTop: 16,
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  weekLabel: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreNumber: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  scoreUnit: {
    fontSize: 12,
    color: '#999',
    marginTop: -2,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  bullet: {
    fontSize: 14,
    color: '#FF9800',
    marginTop: 2,
  },
  bulletText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    lineHeight: 20,
  },
  generatedAt: {
    fontSize: 11,
    color: '#bbb',
    textAlign: 'center',
    marginTop: 16,
  },
});
