import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useExerciseStore } from '../store/exerciseStore';
import { useNutritionStore } from '../store/nutritionStore';
import { generateWeeklyPlan, getTodaysPlan, getExercisePool } from '../services/exerciseService';
import { getTodayHealthData, formatDistance } from '../services/healthConnectService';

const TYPES = ['全部', '有氧运动', '力量训练', '柔韧性训练', '高强度间歇'];

const TYPE_MAP: Record<string, string> = {
  cardio: '有氧运动',
  strength: '力量训练',
  flexibility: '柔韧性训练',
  hiit: '高强度间歇',
};

export const ExerciseScreen: React.FC = () => {
  const [selectedType, setSelectedType] = useState('全部');
  const [deviceData, setDeviceData] = useState({ steps: 0, calories: 0, heartRate: 0, distance: 0 });
  const [deviceLoading, setDeviceLoading] = useState(true);

  const user = useNutritionStore((s) => s.user);
  const exerciseLogs = useExerciseStore((s) => s.exerciseLogs);
  const addExerciseLog = useExerciseStore((s) => s.addExerciseLog);
  const loadExerciseData = useExerciseStore((s) => s.loadExerciseData);
  const todayCalories = useExerciseStore((s) => s.getTodayCalories());
  const todayDuration = useExerciseStore((s) => s.getTodayDuration());
  const streak = useExerciseStore((s) => s.getStreak());

  useEffect(() => {
    loadExerciseData();
    getTodayHealthData().then((data) => {
      setDeviceData(data);
      setDeviceLoading(false);
    });
  }, []);

  const weeklyPlan = useMemo(() => {
    if (!user) {
      return generateWeeklyPlan('moderate', 'maintain');
    }
    return generateWeeklyPlan(user.activityLevel, user.goal);
  }, [user?.activityLevel, user?.goal]);

  const today = useMemo(() => getTodaysPlan(weeklyPlan), [weeklyPlan]);

  const exercisePool = useMemo(() => {
    const pool = getExercisePool();
    return pool.map((e, idx) => ({
      id: `ex_${idx}`,
      name: e.name,
      type: TYPE_MAP[e.type] || e.type,
      icon: e.type === 'cardio' ? '🏃' : e.type === 'strength' ? '💪' : e.type === 'flexibility' ? '🧘' : '⚡',
      duration: e.duration,
      calories: e.caloriesBurned,
    }));
  }, []);

  const loggedToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return exerciseLogs.filter((log) => log.recordDate === today).map((log) => log.exerciseName);
  }, [exerciseLogs]);

  const filteredExercises = selectedType === '全部'
    ? exercisePool
    : exercisePool.filter((e) => e.type === selectedType);

  const handleLogExercise = (exercise: typeof exercisePool[0]) => {
    addExerciseLog({
      id: `ex_${Date.now()}`,
      exerciseName: exercise.name,
      exerciseIcon: exercise.icon,
      duration: exercise.duration,
      calories: exercise.calories,
      createdAt: new Date().toISOString(),
      recordDate: new Date().toISOString().split('T')[0],
    });
  };

  const isLogged = (name: string) => loggedToday.includes(name);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>运动计划</Text>
          {!user && (
            <Text style={styles.headerHint}>完成个人设置，获取个性化运动计划</Text>
          )}
        </View>

        {!deviceLoading && deviceData.steps > 0 && (
          <View style={styles.deviceCard}>
            <View style={styles.deviceHeader}>
              <Ionicons name="watch" size={18} color="#666" />
              <Text style={styles.deviceTitle}>设备数据</Text>
            </View>
            <View style={styles.deviceRow}>
              <View style={styles.deviceItem}>
                <Ionicons name="footsteps" size={22} color="#4CAF50" />
                <Text style={styles.deviceValue}>{deviceData.steps.toLocaleString()}</Text>
                <Text style={styles.deviceLabel}>步数</Text>
              </View>
              <View style={styles.deviceItem}>
                <Ionicons name="heart" size={22} color="#F44336" />
                <Text style={styles.deviceValue}>{deviceData.heartRate}</Text>
                <Text style={styles.deviceLabel}>心率</Text>
              </View>
              <View style={styles.deviceItem}>
                <Ionicons name="flame" size={22} color="#FF9800" />
                <Text style={styles.deviceValue}>{deviceData.calories}</Text>
                <Text style={styles.deviceLabel}>消耗千卡</Text>
              </View>
              <View style={styles.deviceItem}>
                <Ionicons name="map" size={22} color="#03A9F4" />
                <Text style={styles.deviceValue}>{formatDistance(deviceData.distance)}</Text>
                <Text style={styles.deviceLabel}>距离</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <Text style={styles.todayTitle}>今日计划</Text>
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>{today.day}</Text>
            </View>
          </View>
          <Text style={styles.todayFocus}>{today.focus}</Text>
          <View style={styles.todayExercises}>
            {today.exercises.map((exercise, index) => (
              <View key={index} style={styles.todayExerciseItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.todayExerciseText}>{exercise.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#FF9800" />
            <Text style={styles.statValue}>{todayCalories}</Text>
            <Text style={styles.statLabel}>今日消耗</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color="#03A9F4" />
            <Text style={styles.statValue}>{todayDuration}</Text>
            <Text style={styles.statLabel}>运动时长</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#FFD700" />
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>连续天数</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>选择运动</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeFilter}>
            {TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.typeChip, selectedType === type && styles.typeChipActive]}
                onPress={() => setSelectedType(type)}
              >
                <Text style={[styles.typeText, selectedType === type && styles.typeTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.exerciseGrid}>
            {filteredExercises.map((exercise) => {
              const logged = isLogged(exercise.name);
              return (
                <TouchableOpacity
                  key={exercise.id}
                  style={[styles.exerciseCard, logged && styles.exerciseCardLogged]}
                  onPress={() => handleLogExercise(exercise)}
                >
                  <Text style={styles.exerciseIcon}>{exercise.icon}</Text>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseType}>{exercise.type}</Text>
                  <View style={styles.exerciseMeta}>
                    <Text style={styles.exerciseDuration}>{exercise.duration}分钟</Text>
                    <Text style={styles.exerciseCalories}>{exercise.calories}千卡</Text>
                  </View>
                  {logged && (
                    <View style={styles.loggedBadge}>
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  headerHint: { fontSize: 13, color: '#FF9800', marginTop: 4 },
  deviceCard: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 8, borderRadius: 12, padding: 16 },
  deviceHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  deviceTitle: { fontSize: 13, color: '#666', fontWeight: '600' },
  deviceRow: { flexDirection: 'row', justifyContent: 'space-around' },
  deviceItem: { alignItems: 'center', gap: 4 },
  deviceValue: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 4 },
  deviceLabel: { fontSize: 11, color: '#999' },
  todayCard: {
    backgroundColor: '#03A9F4', margin: 16, borderRadius: 16,
    padding: 20,
  },
  todayHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  todayTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  todayBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 4,
    paddingHorizontal: 12, borderRadius: 12,
  },
  todayBadgeText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  todayFocus: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginBottom: 16 },
  todayExercises: { gap: 8 },
  todayExerciseItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  todayExerciseText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  statsContainer: {
    flexDirection: 'row', paddingHorizontal: 16, marginBottom: 24, gap: 12,
  },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  section: { paddingHorizontal: 16, paddingBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  typeFilter: { marginBottom: 16 },
  typeChip: {
    paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#fff',
    borderRadius: 20, marginRight: 10,
  },
  typeChipActive: { backgroundColor: '#03A9F4' },
  typeText: { fontSize: 14, color: '#666', fontWeight: '600' },
  typeTextActive: { color: '#fff' },
  exerciseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  exerciseCard: {
    width: '47%', backgroundColor: '#fff', borderRadius: 12,
    padding: 16, position: 'relative',
  },
  exerciseCardLogged: { opacity: 0.6 },
  exerciseIcon: { fontSize: 40, marginBottom: 8 },
  exerciseName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  exerciseType: { fontSize: 12, color: '#999', marginBottom: 12 },
  exerciseMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  exerciseDuration: { fontSize: 12, color: '#03A9F4', fontWeight: '600' },
  exerciseCalories: { fontSize: 12, color: '#FF9800', fontWeight: '600' },
  loggedBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: '#4CAF50', borderRadius: 12,
    width: 24, height: 24, justifyContent: 'center', alignItems: 'center',
  },
});
