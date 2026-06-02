import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';

type BloggerType = 'fitness' | 'food';

export const BloggerRegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const [bloggerType, setBloggerType] = useState<BloggerType>('fitness');
  const [displayName, setDisplayName] = useState(user?.nickname || '');
  const [bio, setBio] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!displayName.trim()) {
      Alert.alert('提示', '请输入博主显示名称');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.bloggers.apply({
        blogger_type: bloggerType,
        display_name: displayName.trim(),
        bio: bio.trim(),
      });
      if (res.success) {
        Alert.alert('提交成功', '您的申请已提交，请等待管理员审核', [
          { text: '好的', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('申请失败', res.error || '请稍后重试');
      }
    } catch {
      Alert.alert('网络异常', '请检查网络连接后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>申请成为博主</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>选择博主类型</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeCard, bloggerType === 'fitness' && styles.typeCardActive]}
              onPress={() => setBloggerType('fitness')}
              activeOpacity={0.8}
            >
              <Text style={styles.typeEmoji}>💪</Text>
              <Text style={[styles.typeLabel, bloggerType === 'fitness' && styles.typeLabelActive]}>健身博主</Text>
              <Text style={styles.typeDesc}>分享健身课程、训练方法</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeCard, bloggerType === 'food' && styles.typeCardActive]}
              onPress={() => setBloggerType('food')}
              activeOpacity={0.8}
            >
              <Text style={styles.typeEmoji}>🍳</Text>
              <Text style={[styles.typeLabel, bloggerType === 'food' && styles.typeLabelActive]}>美食博主</Text>
              <Text style={styles.typeDesc}>分享健康食谱、饮食建议</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>博主信息</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>显示名称</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="输入您的博主名称"
              placeholderTextColor="#999"
              maxLength={50}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>个人简介</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="介绍一下自己（选填）"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.charCount}>{bio.length}/500</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>申请须知</Text>
          <View style={styles.noticeItem}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.noticeText}>审核通过后即可发布课程和内容</Text>
          </View>
          <View style={styles.noticeItem}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.noticeText}>可以发布免费或付费课程</Text>
          </View>
          <View style={styles.noticeItem}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.noticeText}>请遵守平台内容规范，分享优质内容</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={18} color="#fff" />
          <Text style={styles.submitBtnText}>{submitting ? '提交中...' : '提交申请'}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  content: { flex: 1, padding: 16 },
  section: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeCard: {
    flex: 1, borderRadius: 14, padding: 20, alignItems: 'center',
    backgroundColor: '#f8f8f8', borderWidth: 2, borderColor: '#f0f0f0',
  },
  typeCardActive: { borderColor: '#4CAF50', backgroundColor: '#F1F8E9' },
  typeEmoji: { fontSize: 36, marginBottom: 8 },
  typeLabel: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 4 },
  typeLabelActive: { color: '#4CAF50' },
  typeDesc: { fontSize: 12, color: '#999', textAlign: 'center' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: {
    backgroundColor: '#f5f5f5', borderRadius: 12, padding: 14,
    fontSize: 16, color: '#333',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  charCount: { fontSize: 12, color: '#999', textAlign: 'right', marginTop: 4 },
  noticeItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  noticeText: { fontSize: 14, color: '#666', flex: 1 },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#4CAF50', borderRadius: 14, padding: 16,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
