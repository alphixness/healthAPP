import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNutritionStore } from '../store/nutritionStore';
import { useExerciseStore } from '../store/exerciseStore';
import { Theme } from '../theme';

export const HealthTipsCard: React.FC = () => {
  const { dailyNutrition } = useNutritionStore();
  const { getTodayCalories, getTodayDuration, getWeeklyStats, getStreak } = useExerciseStore();
  
  const tips = useMemo(() => {
    const todayDuration = getTodayDuration();
    const streak = getStreak();
    const weeklyStats = getWeeklyStats();
    
    const tipsList: Array<{
      icon: string;
      title: string;
      content: string;
      priority: 'high' | 'medium' | 'normal';
      gradient: readonly [string, string, ...string[]];
      bgColor: string;
      textColor: string;
    }> = [];
    
    if (dailyNutrition.calories < 1200) {
      tipsList.push({
        icon: 'warning',
        title: '热量摄入偏低',
        content: '今日摄入热量较低，建议适量增加健康食物摄入，确保身体获得足够能量。',
        priority: 'high',
        gradient: ['#FFA726', '#FFCC80'],
        bgColor: '#FFF8EE',
        textColor: '#E65100',
      });
    } else if (dailyNutrition.calories > 2500) {
      tipsList.push({
        icon: 'alert-circle',
        title: '热量摄入偏高',
        content: '今日摄入热量较高，建议晚餐选择清淡食物，多吃蔬菜水果。',
        priority: 'high',
        gradient: ['#EF5350', '#FF7043'],
        bgColor: '#FFF0EE',
        textColor: '#C62828',
      });
    } else {
      tipsList.push({
        icon: 'checkmark-circle',
        title: '热量摄入良好',
        content: '今日热量摄入在合理范围内，继续保持均衡饮食！',
        priority: 'normal',
        gradient: Theme.colors.primaryGradient,
        bgColor: '#F0F9F0',
        textColor: '#2E7D32',
      });
    }
    
    if (dailyNutrition.protein < 50) {
      tipsList.push({
        icon: 'fitness',
        title: '蛋白质摄入建议',
        content: '蛋白质摄入不足，建议多吃鸡胸肉、鱼、蛋、豆腐等高蛋白食物。',
        priority: 'medium',
        gradient: ['#42A5F5', '#90CAF9'],
        bgColor: '#EEF6FF',
        textColor: '#1565C0',
      });
    }
    
    if (todayDuration === 0) {
      tipsList.push({
        icon: 'bicycle',
        title: '今日还未运动',
        content: '建议进行30分钟有氧运动，如快走、慢跑或骑行，保持身体活力。',
        priority: 'high',
        gradient: ['#FFA726', '#FFCC80'],
        bgColor: '#FFF8EE',
        textColor: '#E65100',
      });
    } else if (todayDuration < 30) {
      tipsList.push({
        icon: 'walk',
        title: '运动量可以增加',
        content: `今日运动${todayDuration}分钟，建议再运动${30 - todayDuration}分钟达到推荐运动量。`,
        priority: 'medium',
        gradient: ['#42A5F5', '#90CAF9'],
        bgColor: '#EEF6FF',
        textColor: '#1565C0',
      });
    } else {
      tipsList.push({
        icon: 'trophy',
        title: '运动目标达成',
        content: `今日运动${todayDuration}分钟，已达到推荐运动量，继续保持！`,
        priority: 'normal',
        gradient: ['#FFA726', '#FFCC80'],
        bgColor: '#FFF8EE',
        textColor: '#E65100',
      });
    }
    
    if (streak >= 3) {
      tipsList.push({
        icon: 'flame',
        title: `连续运动 ${streak} 天`,
        content: '太棒了！保持运动习惯对健康非常重要，记得做好运动后拉伸。',
        priority: 'normal',
        gradient: ['#EF5350', '#FF7043'],
        bgColor: '#FFF0EE',
        textColor: '#C62828',
      });
    }
    
    if (dailyNutrition.carbs > 300) {
      tipsList.push({
        icon: 'leaf',
        title: '碳水摄入偏高',
        content: '建议减少精制碳水，增加粗粮和蔬菜摄入，保持营养均衡。',
        priority: 'medium',
        gradient: ['#AB47BC', '#CE93D8'],
        bgColor: '#F8F0FA',
        textColor: '#6A1B9A',
      });
    }
    
    const priorityOrder = { high: 0, medium: 1, normal: 2 };
    return tipsList.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 4);
  }, [dailyNutrition, getTodayCalories, getTodayDuration, getWeeklyStats, getStreak]);

  return (
    <View style={[styles.container, Theme.cardShadow]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={Theme.colors.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerIcon}
          >
            <Ionicons name="bulb" size={20} color="#fff" />
          </LinearGradient>
          <Text style={styles.title}>健康小贴士</Text>
        </View>
        <View style={styles.aiBadge}>
          <Ionicons name="sparkles" size={14} color={Theme.colors.primary} />
          <Text style={styles.aiBadgeText}>AI分析</Text>
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tipsContainer}
        decelerationRate="fast"
        snapToInterval={296}
      >
        {tips.map((tip, index) => (
          <View key={index} style={[styles.tipCard, { backgroundColor: tip.bgColor }]}>
            <View style={styles.tipHeader}>
              <LinearGradient
                colors={tip.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tipIcon}
              >
                <Ionicons name={tip.icon as any} size={18} color="#fff" />
              </LinearGradient>
              <Text style={[styles.tipTitle, { color: tip.textColor }]}>{tip.title}</Text>
              {tip.priority === 'high' && (
                <View style={styles.priorityDot} />
              )}
            </View>
            <Text style={styles.tipContent}>{tip.content}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Ionicons name="information-circle-outline" size={14} color={Theme.colors.text.light} />
        <Text style={styles.footerText}>
          根据您的饮食和运动数据智能生成
        </Text>
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
    marginBottom: Theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
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
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Theme.borderRadius.full,
    gap: 4,
  },
  aiBadgeText: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  tipsContainer: {
    paddingRight: Theme.spacing.xl,
    gap: Theme.spacing.md,
  },
  tipCard: {
    width: 280,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: 'bold',
    flex: 1,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF5350',
  },
  tipContent: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F5F5FA',
  },
  footerText: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.text.light,
  },
});
