import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNutritionStore } from '../store/nutritionStore';
import { useExerciseStore } from '../store/exerciseStore';

interface QuickStatsCardProps {
  onMealsPress: () => void;
  onExercisePress: () => void;
}

export const QuickStatsCard: React.FC<QuickStatsCardProps> = ({
  onMealsPress,
  onExercisePress,
}) => {
  const { dailyNutrition } = useNutritionStore();
  const { getTodayDuration, getStreak } = useExerciseStore();

  const stats = [
    {
      icon: 'restaurant',
      label: '今日饮食',
      value: dailyNutrition.calories.toString(),
      unit: '千卡',
      color: '#4CAF50',
      backgroundColor: '#E8F5E9',
      onPress: onMealsPress,
    },
    {
      icon: 'fitness',
      label: '运动时长',
      value: getTodayDuration().toString(),
      unit: '分钟',
      color: '#FF9800',
      backgroundColor: '#FFF3E0',
      onPress: onExercisePress,
    },
    {
      icon: 'flame',
      label: '连续运动',
      value: getStreak().toString(),
      unit: '天',
      color: '#FF5722',
      backgroundColor: '#FBE9E7',
      onPress: onExercisePress,
    },
    {
      icon: 'water',
      label: '饮水量',
      value: '0',
      unit: 'ml',
      color: '#03A9F4',
      backgroundColor: '#E3F2FD',
      onPress: () => {},
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>健康数据</Text>
      <View style={styles.grid}>
        {stats.map((stat, index) => (
          <TouchableOpacity
            key={index}
            style={styles.statCard}
            onPress={stat.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: stat.backgroundColor }]}>
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statUnit}>{stat.unit}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statUnit: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});
