import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNutritionStore } from '../store/nutritionStore';

const MEAL_TYPES = [
  { key: 'breakfast', label: '早餐', icon: 'sunny-outline' },
  { key: 'lunch', label: '午餐', icon: 'partly-sunny-outline' },
  { key: 'dinner', label: '晚餐', icon: 'moon-outline' },
  { key: 'snack', label: '零食', icon: 'cafe-outline' },
];

export const MealsScreen: React.FC = () => {
  const [selectedMeal, setSelectedMeal] = useState<string>('breakfast');
  const mealRecords = useNutritionStore((state) => state.mealRecords);
  const dailyNutrition = useNutritionStore((state) => state.dailyNutrition);

  const today = new Date().toISOString().split('T')[0];
  const todayRecords = mealRecords.filter((record) => record.recordDate === today);
  const selectedRecords = todayRecords.filter((record) => record.mealType === selectedMeal);

  const totalCalories = todayRecords.reduce((sum, record) => {
    return sum + record.foods.reduce((foodSum, food) => foodSum + food.calories, 0);
  }, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>饮食记录</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalCalories}</Text>
          <Text style={styles.summaryLabel}>已摄入</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{2000 - totalCalories}</Text>
          <Text style={styles.summaryLabel}>剩余目标</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>2000</Text>
          <Text style={styles.summaryLabel}>目标</Text>
        </View>
      </View>

      <View style={styles.mealTabs}>
        {MEAL_TYPES.map((meal) => (
          <TouchableOpacity
            key={meal.key}
            style={[styles.mealTab, selectedMeal === meal.key && styles.mealTabActive]}
            onPress={() => setSelectedMeal(meal.key)}
          >
            <Ionicons
              name={meal.icon as any}
              size={24}
              color={selectedMeal === meal.key ? '#4CAF50' : '#999'}
            />
            <Text style={[styles.mealTabText, selectedMeal === meal.key && styles.mealTabTextActive]}>
              {meal.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.mealList}>
        {selectedRecords.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color="#ddd" />
            <Text style={styles.emptyText}>暂无记录</Text>
            <Text style={styles.emptySubtext}>点击首页拍照按钮添加食物</Text>
          </View>
        ) : (
          selectedRecords.map((record) =>
            record.foods.map((food) => (
              <View key={food.id} style={styles.foodCard}>
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName}>{food.foodName}</Text>
                  <Text style={styles.foodQuantity}>{food.quantity}g</Text>
                </View>
                <View style={styles.nutritionInfo}>
                  <Text style={styles.calories}>{food.calories} 千卡</Text>
                  <View style={styles.macroInfo}>
                    <Text style={styles.macro}>P: {food.protein}g</Text>
                    <Text style={styles.macro}>C: {food.carbs}g</Text>
                    <Text style={styles.macro}>F: {food.fat}g</Text>
                  </View>
                </View>
              </View>
            ))
          )
        )}
      </ScrollView>

      <View style={styles.macroSummary}>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>蛋白质</Text>
          <Text style={styles.macroValue}>{dailyNutrition.protein}g</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>碳水</Text>
          <Text style={styles.macroValue}>{dailyNutrition.carbs}g</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>脂肪</Text>
          <Text style={styles.macroValue}>{dailyNutrition.fat}g</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  mealTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  mealTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    gap: 6,
  },
  mealTabActive: {
    backgroundColor: '#4CAF50',
  },
  mealTabText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  mealTabTextActive: {
    color: '#fff',
  },
  mealList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  foodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  foodQuantity: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  nutritionInfo: {
    alignItems: 'flex-end',
  },
  calories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  macroInfo: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  macro: {
    fontSize: 12,
    color: '#666',
  },
  macroSummary: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 20,
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
});
