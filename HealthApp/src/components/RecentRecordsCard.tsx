import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNutritionStore } from '../store/nutritionStore';
import { useExerciseStore } from '../store/exerciseStore';

interface RecentRecordsCardProps {
  onViewAllMeals: () => void;
  onViewAllExercises: () => void;
}

export const RecentRecordsCard: React.FC<RecentRecordsCardProps> = ({
  onViewAllMeals,
  onViewAllExercises,
}) => {
  const { mealRecords } = useNutritionStore();
  const { getTodayExercises } = useExerciseStore();
  
  const todayExercises = getTodayExercises();
  const todayMeals = mealRecords.slice(-3).reverse();

  const renderMealItem = (meal: any) => (
    <View key={meal.id} style={styles.mealItem}>
      <View style={styles.mealIconContainer}>
        <Ionicons name="restaurant" size={20} color="#4CAF50" />
      </View>
      <View style={styles.mealInfo}>
        <Text style={styles.mealTitle}>
          {meal.mealType === 'breakfast' ? '早餐' : 
           meal.mealType === 'lunch' ? '午餐' : 
           meal.mealType === 'dinner' ? '晚餐' : '加餐'}
        </Text>
        <Text style={styles.mealDetails}>
          {meal.foods.length}种食物 · {meal.foods.reduce((sum: number, f: any) => sum + f.calories, 0)}千卡
        </Text>
      </View>
      <Text style={styles.mealTime}>
        {new Date(meal.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  const renderExerciseItem = (exercise: any) => (
    <View key={exercise.id} style={styles.exerciseItem}>
      <Text style={styles.exerciseIcon}>{exercise.exerciseIcon}</Text>
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
        <Text style={styles.exerciseDetails}>
          {exercise.duration}分钟 · {exercise.calories}千卡
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>今日饮食</Text>
          <TouchableOpacity onPress={onViewAllMeals}>
            <Text style={styles.viewAll}>查看全部</Text>
          </TouchableOpacity>
        </View>
        
        {todayMeals.length > 0 ? (
          todayMeals.map(renderMealItem)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={32} color="#ccc" />
            <Text style={styles.emptyText}>暂无饮食记录</Text>
            <Text style={styles.emptySubtext}>点击上方"记录饮食"开始</Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>今日运动</Text>
          <TouchableOpacity onPress={onViewAllExercises}>
            <Text style={styles.viewAll}>查看全部</Text>
          </TouchableOpacity>
        </View>
        
        {todayExercises.length > 0 ? (
          todayExercises.map(renderExerciseItem)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="fitness-outline" size={32} color="#ccc" />
            <Text style={styles.emptyText}>暂无运动记录</Text>
            <Text style={styles.emptySubtext}>点击上方"记录运动"开始</Text>
          </View>
        )}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAll: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  mealDetails: {
    fontSize: 12,
    color: '#999',
  },
  mealTime: {
    fontSize: 12,
    color: '#999',
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  exerciseIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 12,
    color: '#999',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },
});
