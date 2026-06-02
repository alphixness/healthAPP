import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNutritionStore } from '../store/nutritionStore';
import { useExerciseStore } from '../store/exerciseStore';
import { Theme } from '../theme';

export const HealthSummaryCard: React.FC = () => {
  const { dailyNutrition } = useNutritionStore();
  const { getWeeklyStats } = useExerciseStore();
  
  const weeklyStats = useMemo(() => getWeeklyStats(), []);
  
  const weeklyData = useMemo(() => {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const today = new Date();
    
    return weeklyStats.map((stat) => {
      const date = new Date(stat.date);
      const dayName = days[date.getDay()];
      const isToday = stat.date === today.toISOString().split('T')[0];
      
      return {
        day: dayName,
        isToday,
        calories: stat.totalCalories,
        hasExercise: stat.exerciseCount > 0,
        exerciseCount: stat.exerciseCount,
      };
    });
  }, [weeklyStats]);

  const summaryStats = useMemo(() => {
    const totalCaloriesBurned = weeklyStats.reduce((sum, stat) => sum + stat.totalCalories, 0);
    const exerciseDays = weeklyStats.filter(stat => stat.exerciseCount > 0).length;
    const totalExerciseTime = weeklyStats.reduce((sum, stat) => sum + stat.totalDuration, 0);
    
    return {
      totalBurned: totalCaloriesBurned,
      exerciseDays,
      totalExerciseTime,
    };
  }, [weeklyStats]);

  const maxCalories = Math.max(
    ...weeklyStats.map(s => Math.max(s.totalCalories, 200)),
    500
  );

  return (
    <View style={[styles.container, Theme.cardShadow]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={Theme.colors.infoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerIcon}
          >
            <Ionicons name="analytics" size={20} color="#fff" />
          </LinearGradient>
          <Text style={styles.title}>健康摘要</Text>
        </View>
        <View style={styles.periodBadge}>
          <Text style={styles.periodText}>近7天</Text>
        </View>
      </View>

      <View style={styles.chartSection}>
        <View style={styles.chart}>
          {weeklyData.map((day, index) => {
            const exerciseHeight = (day.calories / maxCalories) * 100;
            
            return (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  {day.isToday ? (
                    <LinearGradient
                      colors={Theme.colors.primaryGradient}
                      start={{ x: 0, y: 1 }}
                      end={{ x: 0, y: 0 }}
                      style={[styles.bar, { height: `${Math.max(exerciseHeight, 8)}%` }]}
                    />
                  ) : (
                    <View style={[styles.barInactive, { height: `${Math.max(exerciseHeight, 8)}%` }]} />
                  )}
                </View>
                <View style={[
                  styles.dayDot,
                  day.isToday && styles.dayDotActive,
                  day.hasExercise && !day.isToday && styles.dayDotExercise,
                ]} />
                <Text style={[styles.dayLabel, day.isToday && styles.dayLabelActive]}>
                  {day.day}
                </Text>
              </View>
            );
          })}
        </View>
        
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={styles.legendDotActive} />
            <Text style={styles.legendText}>今天</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendDotExercise} />
            <Text style={styles.legendText}>已运动</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendDotInactive} />
            <Text style={styles.legendText}>未运动</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <LinearGradient
            colors={['#FFF0EE', '#FFE0DC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statIconSmall}
          >
            <Ionicons name="flame" size={16} color="#EF5350" />
          </LinearGradient>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>本周消耗</Text>
            <Text style={styles.statValue}>{summaryStats.totalBurned}<Text style={styles.statUnit}>千卡</Text></Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <LinearGradient
            colors={['#EEF6FF', '#DCE9FC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statIconSmall}
          >
            <Ionicons name="calendar" size={16} color="#42A5F5" />
          </LinearGradient>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>运动天数</Text>
            <Text style={styles.statValue}>{summaryStats.exerciseDays}<Text style={styles.statUnit}>天</Text></Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <LinearGradient
            colors={['#F3E5F5', '#E8D5ED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statIconSmall}
          >
            <Ionicons name="time" size={16} color="#AB47BC" />
          </LinearGradient>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>运动时长</Text>
            <Text style={styles.statValue}>{summaryStats.totalExerciseTime}<Text style={styles.statUnit}>分钟</Text></Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <LinearGradient
            colors={['#E8F5E9', '#D0ECD3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statIconSmall}
          >
            <Ionicons name="restaurant" size={16} color="#4CAF50" />
          </LinearGradient>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>日均摄入</Text>
            <Text style={styles.statValue}>{Math.round(dailyNutrition.calories * 0.5)}<Text style={styles.statUnit}>千卡</Text></Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: Theme.borderRadius.xxl,
    padding: Theme.spacing.xl,
    marginHorizontal: Theme.spacing.xl,
    marginBottom: Theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Theme.fontSize.xl,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    letterSpacing: 0.3,
  },
  periodBadge: {
    backgroundColor: '#EEF6FF',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: Theme.borderRadius.full,
  },
  periodText: {
    fontSize: Theme.fontSize.xs,
    color: '#42A5F5',
    fontWeight: '600',
  },
  chartSection: {
    marginBottom: Theme.spacing.xl,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100,
    marginBottom: Theme.spacing.md,
  },
  barContainer: {
    alignItems: 'center',
    gap: 6,
  },
  barWrapper: {
    width: 28,
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 28,
    borderRadius: 8,
  },
  barInactive: {
    width: 28,
    borderRadius: 8,
    backgroundColor: '#F0F2F5',
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
  },
  dayDotActive: {
    backgroundColor: Theme.colors.primary,
  },
  dayDotExercise: {
    backgroundColor: '#FFA726',
  },
  dayLabel: {
    fontSize: 11,
    color: Theme.colors.text.light,
  },
  dayLabelActive: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.primary,
  },
  legendDotExercise: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFA726',
  },
  legendDotInactive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  legendText: {
    fontSize: 11,
    color: Theme.colors.text.tertiary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F5F5FA',
    paddingTop: Theme.spacing.lg,
  },
  statItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  statIconSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.text.tertiary,
  },
  statValue: {
    fontSize: Theme.fontSize.lg,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    marginTop: 1,
  },
  statUnit: {
    fontSize: Theme.fontSize.xs,
    fontWeight: '500',
    color: Theme.colors.text.tertiary,
  },
});
