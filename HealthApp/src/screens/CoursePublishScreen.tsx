import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

export const CoursePublishScreen: React.FC = () => {
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('减脂');
  const [difficulty, setDifficulty] = useState('beginner');
  const [duration, setDuration] = useState('30');
  const [calories, setCalories] = useState('200');
  const [isFree, setIsFree] = useState(true);
  const [coverEmoji, setCoverEmoji] = useState('💪');
  const [submitting, setSubmitting] = useState(false);

  const categories = ['减脂', '增肌', '瑜伽', '有氧', 'HIIT', '拉伸', '冥想', '其他'];
  const emojiOptions = ['💪', '🏃', '🧘', '🤸', '🏋️', '🥊', '🚴', '🏄'];

  const loadCourses = async () => {
    try {
      const res = await api.courses.getMyCourses();
      if (res.success && res.data) {
        setCourses(res.data.courses || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCourses(); }, []);

  const handleCreate = async () => {
    if (!title.trim()) { Alert.alert('提示', '请输入课程标题'); return; }
    setSubmitting(true);
    try {
      const res = await api.courses.create({
        title: title.trim(), description: description.trim(),
        category, difficulty, duration: parseInt(duration) || 0,
        calories: parseInt(calories) || 0,
        is_free: isFree ? 1 : 0, cover_emoji: coverEmoji,
      });
      if (res.success) {
        Alert.alert('发布成功', '课程已创建成功');
        setShowForm(false);
        resetForm();
        loadCourses();
      } else {
        Alert.alert('发布失败', res.error || '请稍后重试');
      }
    } catch {
      Alert.alert('网络错误', '请检查网络连接');
    } finally { setSubmitting(false); }
  };

  const resetForm = () => {
    setTitle(''); setDescription(''); setDuration('30'); setCalories('200');
    setIsFree(true); setCoverEmoji('💪');
  };

  const renderCourse = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.courseCard}
      onPress={() => navigation.navigate('CourseDetail' as never, { courseId: item.id } as never)}
      activeOpacity={0.8}
    >
      <Text style={styles.courseEmoji}>{item.cover_emoji || '💪'}</Text>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.courseMeta}>
          {item.category} · {item.duration}分钟 · {item.is_free ? '免费' : '付费'}
        </Text>
        <Text style={styles.courseStats}>
          {JSON.parse(item.stats || '{}').views || 0}次观看
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  if (showForm) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowForm(false)}>
            <Text style={styles.cancelText}>取消</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>发布课程</Text>
          <TouchableOpacity onPress={handleCreate} disabled={submitting}>
            <Text style={styles.publishText}>{submitting ? '发布中' : '发布'}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <View style={styles.formSection}>
            <Text style={styles.label}>课程标题</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle}
              placeholder="输入课程标题" placeholderTextColor="#999" maxLength={100} />
          </View>
          <View style={styles.formSection}>
            <Text style={styles.label}>课程简介</Text>
            <TextInput style={[styles.input, styles.textArea]} value={description}
              onChangeText={setDescription} placeholder="描述课程内容"
              placeholderTextColor="#999" multiline numberOfLines={4} />
          </View>
          <View style={styles.formSection}>
            <Text style={styles.label}>分类</Text>
            <View style={styles.chipRow}>
              {categories.map((c) => (
                <TouchableOpacity key={c} style={[styles.chip, category === c && styles.chipActive]}
                  onPress={() => setCategory(c)}>
                  <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.formSection}>
            <Text style={styles.label}>难度</Text>
            <View style={styles.chipRow}>
              {[{ k: 'beginner', v: '入门' }, { k: 'intermediate', v: '进阶' }, { k: 'advanced', v: '高级' }].map((d) => (
                <TouchableOpacity key={d.k} style={[styles.chip, difficulty === d.k && styles.chipActive]}
                  onPress={() => setDifficulty(d.k)}>
                  <Text style={[styles.chipText, difficulty === d.k && styles.chipTextActive]}>{d.v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.formRow}>
            <View style={[styles.formSection, { flex: 1 }]}>
              <Text style={styles.label}>时长(分钟)</Text>
              <TextInput style={styles.input} value={duration} onChangeText={setDuration}
                keyboardType="numeric" placeholderTextColor="#999" />
            </View>
            <View style={[styles.formSection, { flex: 1 }]}>
              <Text style={styles.label}>消耗(千卡)</Text>
              <TextInput style={styles.input} value={calories} onChangeText={setCalories}
                keyboardType="numeric" placeholderTextColor="#999" />
            </View>
          </View>
          <View style={styles.formSection}>
            <Text style={styles.label}>封面表情</Text>
            <View style={styles.chipRow}>
              {emojiOptions.map((e) => (
                <TouchableOpacity key={e} style={[styles.emojiChip, coverEmoji === e && styles.emojiChipActive]}
                  onPress={() => setCoverEmoji(e)}>
                  <Text style={styles.emojiText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.formSection}>
            <Text style={styles.label}>课程定价</Text>
            <View style={styles.chipRow}>
              <TouchableOpacity style={[styles.chip, isFree && styles.chipActive]}
                onPress={() => setIsFree(true)}>
                <Text style={[styles.chipText, isFree && styles.chipTextActive]}>免费</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.chip, !isFree && styles.chipActive]}
                onPress={() => setIsFree(false)}>
                <Text style={[styles.chipText, !isFree && styles.chipTextActive]}>付费</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>我的课程</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Ionicons name="add" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>加载中...</Text>
        </View>
      ) : courses.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="videocam-outline" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>还没有课程</Text>
          <Text style={styles.emptyText}>点击右上角 + 发布您的第一个课程</Text>
          <TouchableOpacity style={styles.createBtn} onPress={() => setShowForm(true)}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.createBtnText}>创建课程</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList data={courses} renderItem={renderCourse} keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  backBtn: { width: 40 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  addBtn: { width: 40, alignItems: 'flex-end' },
  cancelText: { fontSize: 16, color: '#666' },
  publishText: { fontSize: 16, color: '#4CAF50', fontWeight: '700' },
  list: { padding: 16 },
  courseCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
  },
  courseEmoji: { fontSize: 36 },
  courseInfo: { flex: 1 },
  courseTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 4 },
  courseMeta: { fontSize: 13, color: '#999', marginBottom: 2 },
  courseStats: { fontSize: 12, color: '#bbb' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#999', marginBottom: 20 },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#4CAF50', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24,
  },
  createBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  form: { flex: 1, padding: 20 },
  formSection: { marginBottom: 20 },
  formRow: { flexDirection: 'row', gap: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 14, fontSize: 16, color: '#333' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  chipActive: { backgroundColor: '#4CAF50' },
  chipText: { fontSize: 14, color: '#666' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  emojiChip: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  emojiChipActive: { backgroundColor: '#E8F5E9', borderWidth: 2, borderColor: '#4CAF50' },
  emojiText: { fontSize: 22 },
});
