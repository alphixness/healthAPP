import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNutritionStore } from '../store/nutritionStore';
import { Theme } from '../theme';

interface NutritionCardProps {
  onCameraPress: () => void;
  onViewAll: () => void;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({ onCameraPress, onViewAll }) => {
  const { dailyNutrition } = useNutritionStore();
  
  const goalCalories = dailyNutrition.calories;
  const consumedPercentage = Math.min((dailyNutrition.calories * 0.5 / goalCalories) * 100, 100);
  
  const macros = [
    {
      name: '蛋白质',
      current: dailyNutrition.protein,
      goal: Math.round(dailyNutrition.protein * 1.2),
      unit: 'g',
      color: '#42A5F5',
      gradient: ['#42A5F5', '#90CAF9'] as [string, string],
      icon: 'fitness-outline',
    },
    {
      name: '碳水',
      current: dailyNutrition.carbs,
      goal: Math.round(dailyNutrition.carbs * 1.2),
      unit: 'g',
      color: '#FFA726',
      gradient: ['#FFA726', '#FFCC80'] as [string, string],
      icon: 'leaf-outline',
    },
    {
      name: '脂肪',
      current: dailyNutrition.fat,
      goal: Math.round(dailyNutrition.fat * 1.2),
      unit: 'g',
      color: '#AB47BC',
      gradient: ['#AB47BC', '#CE93D8'] as [string, string],
      icon: 'water-outline',
    },
  ];

  return (
    <View style={[styles.container, Theme.cardShadowLg]}>
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
          <View>
            <Text style={styles.title}>今日营养摄入</Text>
            <Text style={styles.subtitle}>
              已摄入 <Text style={styles.subtitleHighlight}>{dailyNutrition.calories}</Text> 千卡
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <View style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>全部</Text>
            <Ionicons name="chevron-forward" size={16} color={Theme.colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.macrosContainer}>
        {macros.map((macro, index) => {
          const progress = Math.min((macro.current / macro.goal) * 100, 100);
          return (
            <View key={index} style={styles.macroCard}>
              <LinearGradient
                colors={macro.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.macroIcon}
              >
                <Ionicons name={macro.icon as any} size={18} color="#fff" />
              </LinearGradient>
              <Text style={styles.macroValue}>{macro.current}<Text style={styles.macroUnit}>{macro.unit}</Text></Text>
              <Text style={styles.macroName}>{macro.name}</Text>
              <View style={styles.macroProgressBar}>
                <LinearGradient
                  colors={macro.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.macroProgressFill, { width: `${progress}%` }]}
                />
              </View>
              <Text style={styles.macroGoal}>目标 {macro.goal}{macro.unit}</Text>
            </View>
          );
        })}
      </View>

      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={onCameraPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={Theme.colors.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.actionGradient}
        >
          <Ionicons name="camera" size={22} color="#fff" />
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>拍照分析食物营养</Text>
            <Text style={styles.actionSubtitle}>AI智能识别 · 精准计算</Text>
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
    marginTop: -16,
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
    color: Theme.colors.primary,
    fontWeight: '700',
    fontSize: Theme.fontSize.md,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Theme.borderRadius.full,
  },
  viewAllText: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  macrosContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#FAFBFC',
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
  macroIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  macroValue: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
  },
  macroUnit: {
    fontSize: Theme.fontSize.xs,
    fontWeight: '500',
    color: Theme.colors.text.tertiary,
  },
  macroName: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.text.tertiary,
    marginTop: 2,
    marginBottom: Theme.spacing.sm,
  },
  macroProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#F0F2F5',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  macroProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  macroGoal: {
    fontSize: 10,
    color: Theme.colors.text.light,
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
