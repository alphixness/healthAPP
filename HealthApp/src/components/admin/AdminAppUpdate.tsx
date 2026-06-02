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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

interface AppRelease {
  id: string;
  version_code: number;
  version_name: string;
  apk_url: string;
  file_size: number;
  release_notes: string;
  force_update: number;
  created_at: string;
}

export default function AdminAppUpdate() {
  const [releases, setReleases] = useState<AppRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    versionCode: '', versionName: '', apkUrl: '', fileSize: '', releaseNotes: '', forceUpdate: false,
  });

  const fetchReleases = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const res = await api.request('/updates');
      if (res.success && res.data) {
        setReleases(res.data as AppRelease[]);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReleases(); }, [fetchReleases]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReleases(true);
    setRefreshing(false);
  }, [fetchReleases]);

  const handleSubmit = useCallback(async () => {
    const vc = parseInt(form.versionCode);
    if (!vc || !form.versionName || !form.apkUrl) {
      Alert.alert('请填写必填项：版本号、版本名、APK 下载地址');
      return;
    }
    try {
      const res = await api.request('/updates', {
        method: 'POST',
        body: JSON.stringify({
          versionCode: vc,
          versionName: form.versionName,
          apkUrl: form.apkUrl,
          fileSize: parseInt(form.fileSize) || 0,
          releaseNotes: form.releaseNotes,
          forceUpdate: form.forceUpdate,
        }),
      });
      if (res.success) {
        setShowForm(false);
        setForm({ versionCode: '', versionName: '', apkUrl: '', fileSize: '', releaseNotes: '', forceUpdate: false });
        fetchReleases();
      } else {
        Alert.alert('发布失败', res.error || '');
      }
    } catch {}
  }, [form, fetchReleases]);

  const handleDelete = useCallback((id: string, version: string) => {
    Alert.alert('确认删除', `确定删除版本 ${version} 吗？`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: async () => {
        const res = await api.request(`/updates/${id}`, { method: 'DELETE' });
        if (res.success) setReleases(prev => prev.filter(r => r.id !== id));
      }},
    ]);
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Ionicons name="add-circle" size={18} color="#fff" />
          <Text style={[typography.caption, { color: '#fff', fontWeight: '600' }]}>发布新版</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {releases.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="cloud-upload-outline" size={48} color={colors.textTertiary} />
              <Text style={[typography.body, { color: colors.textTertiary, marginTop: spacing.md }]}>暂无版本</Text>
            </View>
          ) : releases.map((r) => (
            <View key={r.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.versionRow}>
                  <Text style={[typography.h3, { color: colors.textPrimary }]}>v{r.version_name}</Text>
                  <Text style={[typography.caption, { color: colors.textTertiary }]}>(code {r.version_code})</Text>
                  {r.force_update ? (
                    <View style={[styles.badge, { backgroundColor: colors.error + '15' }]}>
                      <Text style={[styles.badgeText, { color: colors.error }]}>强制更新</Text>
                    </View>
                  ) : null}
                </View>
                <TouchableOpacity onPress={() => handleDelete(r.id, r.version_name)}>
                  <Ionicons name="trash-outline" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
              {r.release_notes ? (
                <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                  {r.release_notes}
                </Text>
              ) : null}
              <View style={styles.metaRow}>
                {r.file_size > 0 && <Text style={[typography.caption, { color: colors.textTertiary }]}>大小: {formatSize(r.file_size)}</Text>}
                <Text style={[typography.caption, { color: colors.textTertiary }]}>{new Date(r.created_at).toLocaleDateString('zh-CN')}</Text>
              </View>
              {r.apk_url ? (
                <Text style={[typography.caption, { color: colors.info, marginTop: spacing.xs }]} numberOfLines={1}>
                  {r.apk_url}
                </Text>
              ) : null}
            </View>
          ))}
        </ScrollView>
      )}

      {showForm && (
        <ScrollView style={styles.formOverlay} keyboardShouldPersistTaps="handled">
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={[typography.h2, { color: colors.textPrimary }]}>发布新版本</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>版本号 (versionCode) *</Text>
            <TextInput style={styles.input} value={form.versionCode} onChangeText={v => setForm(f => ({ ...f, versionCode: v }))} keyboardType="number-pad" placeholder="如: 2" />

            <Text style={styles.label}>版本名 (versionName) *</Text>
            <TextInput style={styles.input} value={form.versionName} onChangeText={v => setForm(f => ({ ...f, versionName: v }))} placeholder="如: 1.0.1" />

            <Text style={styles.label}>APK 下载地址 *</Text>
            <TextInput style={styles.input} value={form.apkUrl} onChangeText={v => setForm(f => ({ ...f, apkUrl: v }))} placeholder="https://..." />

            <Text style={styles.label}>文件大小 (bytes)</Text>
            <TextInput style={styles.input} value={form.fileSize} onChangeText={v => setForm(f => ({ ...f, fileSize: v }))} keyboardType="number-pad" placeholder="选填" />

            <Text style={styles.label}>更新说明</Text>
            <TextInput style={[styles.input, styles.multiline]} value={form.releaseNotes} onChangeText={v => setForm(f => ({ ...f, releaseNotes: v }))} multiline numberOfLines={3} placeholder="选填" />

            <TouchableOpacity style={styles.forceRow} onPress={() => setForm(f => ({ ...f, forceUpdate: !f.forceUpdate }))}>
              <Ionicons name={form.forceUpdate ? 'checkbox' : 'square-outline'} size={22} color={form.forceUpdate ? colors.error : colors.textTertiary} />
              <Text style={[typography.body, { color: colors.textSecondary }]}>强制更新（用户必须更新才能使用）</Text>
            </TouchableOpacity>

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
                <Text style={[typography.body, { color: colors.textSecondary }]}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <Text style={[typography.bodyBold, { color: '#fff' }]}>发布</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
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
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  versionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  metaRow: { flexDirection: 'row', gap: spacing.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingVertical: 48 },
  formOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  formContainer: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.xl, margin: spacing.lg, marginTop: 60,
  },
  formHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: { fontSize: 13, color: colors.textSecondary, marginBottom: 4, marginTop: spacing.sm },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: 14, color: colors.textPrimary, backgroundColor: colors.background,
  },
  multiline: { minHeight: 60, textAlignVertical: 'top' },
  forceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  formActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  cancelBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.sm,
    backgroundColor: colors.background, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  submitBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.sm,
    backgroundColor: colors.primary, alignItems: 'center',
  },
});
