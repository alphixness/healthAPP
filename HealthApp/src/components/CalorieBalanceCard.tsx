import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNutritionStore } from '../store/nutritionStore';
import { useExerciseStore } from '../store/exerciseStore';

interface CalorieBalanceCardProps {
  onCameraPress: () => void;
  onExercisePress: () => void;
}

export const CalorieBalanceCard: React.FC<CalorieBalanceCardProps> = ({ 
  onCameraPress, 
  onExercisePress 
}) => {
  const { dailyNutrition } = useNutritionStore();
  const { getTodayCalories, getTodayDuration, getStreak } = useExerciseStore();
  
  const todayCaloriesConsumed = getTodayCalories();
  const goalCalories = dailyNutrition.calories;
  const remaining = Math.max(0, goalCalories - todayCaloriesConsumed);
  const consumedPercentage = Math.min((todayCaloriesConsumed / goalCalories) * 100, 100);
  const streak = getStreak();

  return (
    <View style={styles.container}>
      <View style={styles.mainCard}>
        <View style={styles.header}>
          <Text style={styles.title}>今日卡路里</Text>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={14} color="#FF5722" />
              <Text style={styles.streakText}>{streak}天连续</Text>
            </View>
          )}
        </View>

        <View style={styles.mainContent}>
          <View style={styles.calorieRing}>
            <View style={styles.outerRing}>
              <View style={styles.progressRing}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      height: `${consumedPercentage}%`,
                      backgroundColor: consumedPercentage > 100 ? '#FF5722' : '#4CAF50'
                    }
                  ]} 
                />
              </View>
              <View style={styles.innerCircle}>
                <Text style={styles.caloriesNumber}>{todayCaloriesConsumed}</Text>
                <Text style={styles.caloriesLabel}>千卡已摄入</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsColumn}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="flag" size={20} color="#2196F3" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>目标</Text>
                <Text style={styles.statValue}>{goalCalories}</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="remove-circle" size={20} color="#FF9800" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>剩余</Text>
                <Text style={styles.statValue}>{remaining}</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="flame" size={20} color="#FF5722" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>消耗</Text>
                <Text style={styles.statValue}>{todayCaloriesConsumed}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={onCameraPress}>
            <Ionicons name="camera" size={24} color="#4CAF50" />
            <Text style={styles.actionText}>记录饮食</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.exerciseButton]} onPress={onExercisePress}>
            <Ionicons name="fitness" size={24} color="#FF9800" />
            <Text style={[styles.actionText, styles.exerciseText]}>记录运动</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
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
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  streakText: {
    fontSize: 12,
    color: '#FF5722',
    fontWeight: '600',
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  calorieRing: {
    marginRight: 24,
  },
  outerRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  progressRing: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'flex-end',
  },
  progressFill: {
    width: '100%',
    opacity: 0.3,
    borderRadius: 60,
  },
  innerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  caloriesNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  caloriesLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statsColumn: {
    flex: 1,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
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
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  exerciseButton: {
    backgroundColor: '#FFF3E0',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  exerciseText: {
    color: '#FF9800',
  },
});
