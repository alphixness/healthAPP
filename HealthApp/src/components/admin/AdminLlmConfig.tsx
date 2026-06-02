import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

interface LlmProvider {
  id: string;
  name: string;
  provider_key: string;
  api_url: string;
  model_name: string;
  api_key: string;
  region: 'china' | 'global';
  is_active: number;
  sort_order: number;
}

export default function AdminLlmConfig() {
  const [providers, setProviders] = useState<LlmProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', providerKey: '', apiUrl: '', modelName: '', apiKey: '', region: 'china' as 'china' | 'global', sortOrder: 0,
  });

  const fetchProviders = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const res = await api.request('/llm/admin/providers');
      if (res.success && res.data) {
        setProviders(res.data as LlmProvider[]);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProviders(true);
    setRefreshing(false);
  }, [fetchProviders]);

  const handleToggle = useCallback(async (id: string) => {
    try {
      const res = await api.request(`/llm/admin/providers/${id}/toggle`, { method: 'PUT' });
      if (res.success) {
        setProviders(prev => prev.map(p => p.id === id ? { ...p, is_active: p.is_active ? 0 : 1 } : p));
      }
    } catch {}
  }, []);

  const handleDelete = useCallback((id: string, name: string) => {
    Alert.alert('确认删除', `确定删除 "${name}" 吗？`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: async () => {
        const res = await api.request(`/llm/admin/providers/${id}`, { method: 'DELETE' });
        if (res.success) setProviders(prev => prev.filter(p => p.id !== id));
      }},
    ]);
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.name || !form.providerKey || !form.apiUrl || !form.modelName) {
      Alert.alert('请填写必填项');
      return;
    }
    try {
      const res = editingId
        ? await api.request(`/llm/admin/providers/${editingId}`, { method: 'PUT', body: JSON.stringify(form) })
        : await api.request('/llm/admin/providers', { method: 'POST', body: JSON.stringify(form) });
      if (res.success) {
        setShowModal(false);
        resetForm();
        fetchProviders();
      } else {
        Alert.alert('保存失败', res.error || '');
      }
    } catch {}
  }, [form, editingId, fetchProviders]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: '', providerKey: '', apiUrl: '', modelName: '', apiKey: '', region: 'china', sortOrder: 0 });
  };

  const openEdit = (provider: LlmProvider) => {
    setEditingId(provider.id);
    setForm({
      name: provider.name,
      providerKey: provider.provider_key,
      apiUrl: provider.api_url,
      modelName: provider.model_name,
      apiKey: provider.api_key,
      region: provider.region,
      sortOrder: provider.sort_order,
    });
    setShowModal(true);
  };

  const chinaProviders = providers.filter(p => p.region === 'china');
  const globalProviders = providers.filter(p => p.region === 'global');

  const renderProviderCard = (provider: LlmProvider) => (
    <View key={provider.id} style={[styles.card, !provider.is_active && styles.cardDisabled]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <View style={[styles.statusDot, { backgroundColor: provider.is_active ? colors.success : colors.textTertiary }]} />
          <Text style={[typography.bodyBold, { color: colors.textPrimary, flex: 1 }]}>{provider.name}</Text>
        </View>
        <Text style={[typography.caption, { color: provider.region === 'china' ? colors.error : colors.info }]}>
          {provider.region === 'china' ? '🇨🇳 国内' : '🌍 海外'}
        </Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>Key: {provider.provider_key}</Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>模型: {provider.model_name}</Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>URL: {provider.api_url}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleToggle(provider.id)}>
          <Ionicons name={provider.is_active ? 'pause-circle' : 'play-circle'} size={18} color={provider.is_active ? colors.accent : colors.success} />
          <Text style={[typography.caption, { color: provider.is_active ? colors.accent : colors.success }]}>
            {provider.is_active ? '禁用' : '启用'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(provider)}>
          <Ionicons name="create-outline" size={18} color={colors.info} />
          <Text style={[typography.caption, { color: colors.info }]}>编辑</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(provider.id, provider.name)}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={[typography.caption, { color: colors.error }]}>删除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setShowModal(true); }}>
          <Ionicons name="add-circle" size={18} color="#fff" />
          <Text style={[typography.caption, { color: '#fff', fontWeight: '600' }]}>添加提供商</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.sm }]}>🇨🇳 国内提供商</Text>
          {chinaProviders.length === 0 ? (
            <Text style={[typography.caption, { color: colors.textTertiary, marginBottom: spacing.lg }]}>暂无</Text>
          ) : chinaProviders.map(renderProviderCard)}

          <View style={{ height: spacing.lg }} />

          <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.sm }]}>🌍 海外提供商</Text>
          {globalProviders.length === 0 ? (
            <Text style={[typography.caption, { color: colors.textTertiary, marginBottom: spacing.lg }]}>暂无</Text>
          ) : globalProviders.map(renderProviderCard)}
        </ScrollView>
      )}

      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowModal(false)}>
          <View style={styles.modal} onStartShouldSetResponder={() => true}>
            <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing.lg }]}>
              {editingId ? '编辑提供商' : '添加提供商'}
            </Text>

            <Text style={styles.label}>名称 *</Text>
            <TextInput style={styles.input} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} placeholder="如: DeepSeek Chat" />

            <Text style={styles.label}>Provider Key *</Text>
            <TextInput style={styles.input} value={form.providerKey} onChangeText={v => setForm(f => ({ ...f, providerKey: v }))} placeholder="如: deepseek-chat" editable={!editingId} />

            <Text style={styles.label}>API URL *</Text>
            <TextInput style={styles.input} value={form.apiUrl} onChangeText={v => setForm(f => ({ ...f, apiUrl: v }))} placeholder="https://api.deepseek.com" />

            <Text style={styles.label}>模型名称 *</Text>
            <TextInput style={styles.input} value={form.modelName} onChangeText={v => setForm(f => ({ ...f, modelName: v }))} placeholder="deepseek-chat" />

            <Text style={styles.label}>API Key</Text>
            <TextInput style={styles.input} value={form.apiKey} onChangeText={v => setForm(f => ({ ...f, apiKey: v }))} placeholder="sk-..." secureTextEntry />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>区域</Text>
                <View style={styles.regionRow}>
                  <TouchableOpacity onPress={() => setForm(f => ({ ...f, region: 'china' }))} style={[styles.regionBtn, form.region === 'china' && styles.regionBtnActive]}>
                    <Text style={[styles.regionBtnText, form.region === 'china' && styles.regionBtnTextActive]}>国内</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setForm(f => ({ ...f, region: 'global' }))} style={[styles.regionBtn, form.region === 'global' && styles.regionBtnActive]}>
                    <Text style={[styles.regionBtnText, form.region === 'global' && styles.regionBtnTextActive]}>海外</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ width: 80 }}>
                <Text style={styles.label}>排序</Text>
                <TextInput style={styles.input} value={String(form.sortOrder)} onChangeText={v => setForm(f => ({ ...f, sortOrder: parseInt(v) || 0 }))} keyboardType="number-pad" />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={[typography.body, { color: colors.textSecondary }]}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={[typography.bodyBold, { color: '#fff' }]}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toolbar: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.primary, borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  list: { padding: spacing.lg },
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  cardDisabled: { opacity: 0.6 },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  cardBody: { gap: 2, marginBottom: spacing.sm },
  cardActions: { flexDirection: 'row', gap: spacing.md, borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing.sm },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.xl },
  modal: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.xl, maxHeight: '80%',
  },
  label: { fontSize: 13, color: colors.textSecondary, marginBottom: 4, marginTop: spacing.sm },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: 14, color: colors.textPrimary, backgroundColor: colors.background,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  regionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
  regionBtn: {
    flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.sm,
    backgroundColor: colors.background, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  regionBtnActive: { backgroundColor: colors.primaryBg, borderColor: colors.primary },
  regionBtnText: { fontSize: 13, color: colors.textSecondary },
  regionBtnTextActive: { color: colors.primary, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  cancelBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.sm,
    backgroundColor: colors.background, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  saveBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.sm,
    backgroundColor: colors.primary, alignItems: 'center',
  },
});
