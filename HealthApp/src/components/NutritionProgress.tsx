import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNutritionStore } from '../store/nutritionStore';

const { width } = Dimensions.get('window');

interface NutritionProgressProps {
  onCameraPress: () => void;
}

export const NutritionProgress: React.FC<NutritionProgressProps> = ({ onCameraPress }) => {
  const { dailyNutrition } = useNutritionStore();
  
  const getProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const remaining = Math.max(0, 2000 - dailyNutrition.calories);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>今日营养摄入</Text>
      
      <View style={styles.progressContainer}>
        <View style={styles.mainProgress}>
          <View style={styles.circleContainer}>
            <View style={styles.circleBackground}>
              <View style={[styles.circleProgress, { width: `${getProgress(dailyNutrition.calories, 2000)}%` }]}>
                <View style={styles.circleInner}>
                  <Text style={styles.caloriesNumber}>{dailyNutrition.calories}</Text>
                  <Text style={styles.caloriesLabel}>千卡</Text>
                  <Text style={styles.remainingText}>
                    剩余 {remaining} 千卡
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.cameraButton} onPress={onCameraPress}>
          <Ionicons name="camera" size={32} color="#fff" />
          <Text style={styles.cameraText}>拍照识别</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.macrosContainer}>
        <View style={styles.macroItem}>
          <View style={[styles.macroBar, styles.proteinBar, { width: `${getProgress(dailyNutrition.protein, 80)}%` }]} />
          <Text style={styles.macroLabel}>蛋白质</Text>
          <Text style={styles.macroValue}>{dailyNutrition.protein}g</Text>
        </View>
        
        <View style={styles.macroItem}>
          <View style={[styles.macroBar, styles.carbsBar, { width: `${getProgress(dailyNutrition.carbs, 250)}%` }]} />
          <Text style={styles.macroLabel}>碳水</Text>
          <Text style={styles.macroValue}>{dailyNutrition.carbs}g</Text>
        </View>
        
        <View style={styles.macroItem}>
          <View style={[styles.macroBar, styles.fatBar, { width: `${getProgress(dailyNutrition.fat, 65)}%` }]} />
          <Text style={styles.macroLabel}>脂肪</Text>
          <Text style={styles.macroValue}>{dailyNutrition.fat}g</Text>
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
    marginVertical: 8,
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  mainProgress: {
    flex: 1,
  },
  circleContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  circleProgress: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 70,
    opacity: 0.3,
  },
  circleInner: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  caloriesNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  caloriesLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  remainingText: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 8,
    fontWeight: '600',
  },
  cameraButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cameraText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
  },
  macrosContainer: {
    gap: 12,
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  macroBar: {
    height: 8,
    borderRadius: 4,
    flex: 1,
    maxWidth: width * 0.5,
  },
  proteinBar: {
    backgroundColor: '#2196F3',
  },
  carbsBar: {
    backgroundColor: '#FF9800',
  },
  fatBar: {
    backgroundColor: '#9C27B0',
  },
  macroLabel: {
    fontSize: 14,
    color: '#666',
    width: 50,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
