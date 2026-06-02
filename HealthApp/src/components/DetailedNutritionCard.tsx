import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNutritionStore } from '../store/nutritionStore';
import { useExerciseStore } from '../store/exerciseStore';

interface DetailedNutritionCardProps {
  onCameraPress: () => void;
}

export const DetailedNutritionCard: React.FC<DetailedNutritionCardProps> = ({ onCameraPress }) => {
  const { dailyNutrition } = useNutritionStore();
  const { getTodayCalories, getTodayDuration, getStreak } = useExerciseStore();
  
  const consumedCalories = getTodayCalories();
  const goalCalories = dailyNutrition.calories;
  const remaining = Math.max(0, goalCalories - consumedCalories);
  const consumedPercentage = Math.min((consumedCalories / goalCalories) * 100, 100);
  const streak = getStreak();

  const macros = [
    {
      name: '蛋白质',
      current: dailyNutrition.protein,
      goal: Math.round(dailyNutrition.protein * 1.2),
      unit: 'g',
      color: '#2196F3',
      icon: 'fitness',
    },
    {
      name: '碳水',
      current: dailyNutrition.carbs,
      goal: Math.round(dailyNutrition.carbs * 1.2),
      unit: 'g',
      color: '#FF9800',
      icon: 'leaf',
    },
    {
      name: '脂肪',
      current: dailyNutrition.fat,
      goal: Math.round(dailyNutrition.fat * 1.2),
      unit: 'g',
      color: '#9C27B0',
      icon: 'water',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>今日营养摄入</Text>
        {streak > 0 && (
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={14} color="#FF5722" />
            <Text style={styles.streakText}>{streak}天连续</Text>
          </View>
        )}
      </View>

      <View style={styles.mainContent}>
        <View style={styles.calorieSection}>
          <View style={styles.calorieRing}>
            <View style={styles.outerRing}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    height: `${consumedPercentage}%`,
                    backgroundColor: consumedPercentage > 100 ? '#FF5722' : '#4CAF50'
                  }
                ]} 
              />
              <View style={styles.innerContent}>
                <Text style={styles.calorieNumber}>{consumedCalories}</Text>
                <Text style={styles.calorieLabel}>千卡</Text>
                <Text style={styles.remainingLabel}>剩余 {remaining}</Text>
              </View>
            </View>
          </View>

          <View style={styles.calorieStats}>
            <View style={styles.statRow}>
              <View style={styles.statIcon}>
                <Ionicons name="flag" size={18} color="#2196F3" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>目标摄入</Text>
                <Text style={styles.statValue}>{goalCalories} 千卡</Text>
              </View>
            </View>

            <View style={styles.statRow}>
              <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="restaurant" size={18} color="#4CAF50" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>已摄入</Text>
                <Text style={[styles.statValue, { color: '#4CAF50' }]}>{consumedCalories} 千卡</Text>
              </View>
            </View>

            <View style={styles.statRow}>
              <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="fitness" size={18} color="#FF9800" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>已消耗</Text>
                <Text style={[styles.statValue, { color: '#FF9800' }]}>{consumedCalories} 千卡</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.macrosSection}>
          <Text style={styles.sectionTitle}>营养素详情</Text>
          <View style={styles.macrosGrid}>
            {macros.map((macro, index) => {
              const progress = Math.min((macro.current / macro.goal) * 100, 100);
              return (
                <View key={index} style={styles.macroCard}>
                  <View style={styles.macroHeader}>
                    <View style={[styles.macroIcon, { backgroundColor: `${macro.color}20` }]}>
                      <Ionicons name={macro.icon as any} size={16} color={macro.color} />
                    </View>
                    <Text style={styles.macroName}>{macro.name}</Text>
                  </View>
                  
                  <View style={styles.macroProgressContainer}>
                    <View style={styles.macroProgressBar}>
                      <View 
                        style={[
                          styles.macroProgressFill,
                          { 
                            width: `${progress}%`,
                            backgroundColor: macro.color
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.macroPercentage}>{Math.round(progress)}%</Text>
                  </View>
                  
                  <Text style={styles.macroValues}>
                    {macro.current}{macro.unit} / {macro.goal}{macro.unit}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <TouchableOpacity style={styles.recordButton} onPress={onCameraPress}>
          <Ionicons name="camera" size={24} color="#4CAF50" />
          <Text style={styles.recordButtonText}>拍照记录饮食</Text>
          <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
        </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  streakText: {
    fontSize: 13,
    color: '#FF5722',
    fontWeight: '600',
  },
  mainContent: {
    gap: 20,
  },
  calorieSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  calorieRing: {
    alignItems: 'center',
  },
  outerRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.3,
    borderRadius: 65,
  },
  innerContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  calorieNumber: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  calorieLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  remainingLabel: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 6,
    fontWeight: '600',
  },
  calorieStats: {
    flex: 1,
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  macrosSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  macrosGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  macroIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  macroName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  macroProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  macroProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  macroProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  macroPercentage: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    minWidth: 32,
  },
  macroValues: {
    fontSize: 11,
    color: '#999',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
});
