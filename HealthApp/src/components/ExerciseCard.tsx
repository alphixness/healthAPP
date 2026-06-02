import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useExerciseStore } from '../store/exerciseStore';
import { Theme } from '../theme';

interface ExerciseCardProps {
  onExercisePress: () => void;
  onViewAll: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ onExercisePress, onViewAll }) => {
  const { getTodayCalories, getTodayDuration, getStreak, getTodayExercises } = useExerciseStore();
  
  const todayCalories = getTodayCalories();
  const todayDuration = getTodayDuration();
  const streak = getStreak();
  const todayExercises = getTodayExercises();

  const stats = [
    {
      label: '消耗热量',
      value: todayCalories,
      unit: '千卡',
      icon: 'flame',
      gradient: ['#EF5350', '#FF7043'] as [string, string],
      bgColor: '#FFF0EE',
    },
    {
      label: '运动时长',
      value: todayDuration,
      unit: '分钟',
      icon: 'time',
      gradient: ['#42A5F5', '#64B5F6'] as [string, string],
      bgColor: '#EEF6FF',
    },
    {
      label: '连续运动',
      value: streak,
      unit: '天',
      icon: 'trophy',
      gradient: ['#FFA726', '#FFCC80'] as [string, string],
      bgColor: '#FFF8EE',
    },
  ];

  return (
    <View style={[styles.container, Theme.cardShadow]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={Theme.colors.accentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerIcon}
          >
            <Ionicons name="fitness" size={22} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={styles.title}>今日运动记录</Text>
            <Text style={styles.subtitle}>
              {todayExercises.length > 0 
                ? `已完成 <Text style={styles.subtitleHighlight}>${todayExercises.length}</Text> 项运动`
                : '还没有运动记录'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <View style={styles.viewAllButton}>
            <Text style={[styles.viewAllText, { color: Theme.colors.accent }]}>全部</Text>
            <Ionicons name="chevron-forward" size={16} color={Theme.colors.accent} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={[styles.statCard, { backgroundColor: stat.bgColor }]}>
            <LinearGradient
              colors={stat.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statIcon}
            >
              <Ionicons name={stat.icon as any} size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statUnit}>{stat.unit}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {todayExercises.length > 0 && (
        <View style={styles.exerciseList}>
          {todayExercises.slice(0, 3).map((exercise, index) => (
            <View key={index} style={styles.exerciseItem}>
              <Text style={styles.exerciseIcon}>{exercise.exerciseIcon}</Text>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
                <Text style={styles.exerciseMeta}>
                  {exercise.duration}分钟 · 消耗{exercise.calories}千卡
                </Text>
              </View>
              <View style={styles.exerciseBadge}>
                <Text style={styles.exerciseBadgeText}>已完成</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={onExercisePress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={Theme.colors.accentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.actionGradient}
        >
          <Ionicons name="add" size={22} color="#fff" />
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>记录运动</Text>
            <Text style={styles.actionSubtitle}>选择运动项目并记录</Text>
          </View>
          <View style={styles.actionArrow}>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
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
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Theme.fontSize.xl,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.tertiary,
    marginTop: 2,
  },
  subtitleHighlight: {
    color: Theme.colors.accent,
    fontWeight: '700',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8EE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Theme.borderRadius.full,
  },
  viewAllText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  statValue: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
  },
  statUnit: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.text.tertiary,
    marginTop: 2,
  },
  statLabel: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.text.tertiary,
    marginTop: 4,
    fontWeight: '500',
  },
  exerciseList: {
    marginBottom: Theme.spacing.lg,
    backgroundColor: '#FAFBFC',
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
  },
  exerciseIcon: {
    fontSize: 28,
    marginRight: Theme.spacing.md,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
    color: Theme.colors.text.primary,
  },
  exerciseMeta: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.text.tertiary,
    marginTop: 2,
  },
  exerciseBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Theme.borderRadius.full,
  },
  exerciseBadgeText: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  actionButton: {
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: Theme.spacing.md,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: 'bold',
    color: '#fff',
  },
  actionSubtitle: {
    fontSize: Theme.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  actionArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
