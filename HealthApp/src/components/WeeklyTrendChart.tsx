import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNutritionStore } from '../store/nutritionStore';
import { useExerciseStore } from '../store/exerciseStore';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 64;
const CHART_HEIGHT = 160;

export const WeeklyTrendChart: React.FC = () => {
  const { getWeeklyStats } = useExerciseStore();
  const { dailyNutrition } = useNutritionStore();
  
  const weeklyStats = getWeeklyStats();
  const maxCalories = Math.max(
    ...weeklyStats.map(s => s.totalCalories),
    dailyNutrition.calories * 0.5
  );

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return weekdays[date.getDay()];
  };

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>近7天趋势</Text>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>饮食</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.legendText}>运动</Text>
          </View>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {weeklyStats.map((stat, index) => {
            const intakeHeight = (dailyNutrition.calories * 0.3 / maxCalories) * CHART_HEIGHT;
            const exerciseHeight = (stat.totalCalories / maxCalories) * CHART_HEIGHT;
            
            return (
              <View key={stat.date} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.intakeBar,
                      {
                        height: intakeHeight,
                        backgroundColor: isToday(stat.date) ? '#66BB6A' : '#4CAF50',
                      }
                    ]}
                  />
                  <View
                    style={[
                      styles.exerciseBar,
                      {
                        height: Math.max(exerciseHeight, 4),
                        backgroundColor: isToday(stat.date) ? '#FFA726' : '#FF9800',
                      }
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.dayLabel,
                    isToday(stat.date) && styles.dayLabelActive
                  ]}
                >
                  {getDayName(stat.date)}
                </Text>
              </View>
            );
          })}
        </View>
        
        <View style={styles.yAxis}>
          <Text style={styles.yAxisLabel}>{Math.round(maxCalories)}</Text>
          <Text style={styles.yAxisLabel}>{Math.round(maxCalories / 2)}</Text>
          <Text style={styles.yAxisLabel}>0</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>本周平均摄入</Text>
          <Text style={styles.summaryValue}>
            {Math.round(weeklyStats.reduce((sum, s) => sum + dailyNutrition.calories * 0.3, 0) / 7)} 千卡
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>本周运动消耗</Text>
          <Text style={styles.summaryValue}>
            {Math.round(weeklyStats.reduce((sum, s) => sum + s.totalCalories, 0))} 千卡
          </Text>
        </View>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  legendContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  chartContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  chart: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
    paddingBottom: 24,
  },
  barContainer: {
    alignItems: 'center',
  },
  barWrapper: {
    alignItems: 'center',
    gap: 2,
  },
  intakeBar: {
    width: 24,
    borderRadius: 4,
    opacity: 0.7,
  },
  exerciseBar: {
    width: 24,
    borderRadius: 4,
  },
  dayLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  dayLabelActive: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 24,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#ccc',
  },
  summaryRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});
