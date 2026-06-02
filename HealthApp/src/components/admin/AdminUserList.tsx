import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { colors } from '../../constants/theme';

interface User {
  id: string;
  email: string;
  phone: string;
  nickname: string;
  role: string;
  created_at: string;
}

const PAGE_LIMIT = 20;

function UserRow({
  item,
  onToggleRole,
}: {
  item: User;
  onToggleRole: (user: User) => void;
}) {
  const isAdmin = item.role === 'admin';
  const registeredDate = item.created_at
    ? new Date(item.created_at).toLocaleDateString('zh-CN')
    : '--';

  return (
    <View style={styles.userRow}>
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>
            {item.nickname || '--'}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: isAdmin ? '#F3E5F5' : '#E8F5E9' }]}>
            <Text style={[styles.roleText, { color: isAdmin ? '#9C27B0' : colors.primary }]}>
              {isAdmin ? '管理员' : '用户'}
            </Text>
          </View>
        </View>
        <View style={styles.userDetail}>
          <Ionicons name="mail-outline" size={14} color={colors.textTertiary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.email || '--'}
          </Text>
        </View>
        <View style={styles.userDetail}>
          <Ionicons name="call-outline" size={14} color={colors.textTertiary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.phone || '--'}
          </Text>
        </View>
        <View style={styles.userDetail}>
          <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            注册于 {registeredDate}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.roleButton, { backgroundColor: isAdmin ? '#FFF3E0' : '#F3E5F5' }]}
        onPress={() => onToggleRole(item)}
      >
        <Text style={[styles.roleButtonText, { color: isAdmin ? colors.accent : '#9C27B0' }]}>
          {isAdmin ? '降级为用户' : '提升为管理员'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AdminUserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchUsers = useCallback(
    async (currentPage: number, currentSearch: string, isRefresh = false) => {
      if (!isRefresh) {
        setLoading(true);
      }
      try {
        const res = await api.admin.getUsers(currentPage, PAGE_LIMIT, currentSearch);
        if (res.success && res.data) {
          const data = res.data as User[];
          setUsers(data || []);
          if (res.meta) {
            setTotal(res.meta.total);
          }
        }
      } catch {
        // Error fetching users
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchUsers(page, search);
  }, [page, fetchUsers]);

  const handleSearch = useCallback(() => {
    setPage(1);
    fetchUsers(1, search);
  }, [search, fetchUsers]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUsers(page, search, true);
    setRefreshing(false);
  }, [page, search, fetchUsers]);

  const handleToggleRole = useCallback(
    async (user: User) => {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      const actionLabel = newRole === 'admin' ? '提升为管理员' : '降级为普通用户';
      const targetName = user.nickname || user.email || user.id;

      Alert.alert('确认操作', `确定要将 ${targetName} ${actionLabel} 吗？`, [
        { text: '取消', style: 'cancel' },
        {
          text: '确认',
          style: 'destructive',
          onPress: async () => {
            setTogglingId(user.id);
            try {
              const res = await api.admin.updateUserRole(user.id, newRole);
              if (res.success) {
                setUsers((prev) =>
                  prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)),
                );
              } else {
                Alert.alert('操作失败', res.error || '请稍后重试');
              }
            } catch {
              Alert.alert('操作失败', '网络错误，请稍后重试');
            } finally {
              setTogglingId(null);
            }
          },
        },
      ]);
    },
    [],
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const renderItem = useCallback(
    ({ item }: { item: User }) => (
      <UserRow item={item} onToggleRole={handleToggleRole} />
    ),
    [handleToggleRole],
  );

  const keyExtractor = useCallback((item: User) => item.id, []);

  const ListEmptyComponent = useCallback(
    () =>
      loading ? null : (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
            {search ? '未找到匹配的用户' : '暂无用户数据'}
          </Text>
        </View>
      ),
    [loading, search],
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索邮箱、手机号、昵称"
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={[styles.searchButtonText, { color: colors.surface }]}>搜索</Text>
        </TouchableOpacity>
      </View>

      {loading && users.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={
            users.length > 0 ? (
              <View style={styles.pagination}>
                <TouchableOpacity
                  style={[styles.pageButton, page <= 1 && styles.pageButtonDisabled]}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <Ionicons
                    name="chevron-back"
                    size={16}
                    color={page <= 1 ? colors.textTertiary : colors.primary}
                  />
                  <Text
                    style={[
                      styles.pageButtonText,
                      { color: page <= 1 ? colors.textTertiary : colors.primary },
                    ]}
                  >
                    上一页
                  </Text>
                </TouchableOpacity>

                <Text style={[styles.pageInfo, { color: colors.textSecondary }]}>
                  {page} / {totalPages}
                </Text>

                <TouchableOpacity
                  style={[styles.pageButton, page >= totalPages && styles.pageButtonDisabled]}
                  onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  <Text
                    style={[
                      styles.pageButtonText,
                      { color: page >= totalPages ? colors.textTertiary : colors.primary },
                    ]}
                  >
                    下一页
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={page >= totalPages ? colors.textTertiary : colors.primary}
                  />
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.textPrimary,
    padding: 0,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  userInfo: {
    flex: 1,
    marginRight: 10,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  userDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  detailText: {
    fontSize: 13,
    flexShrink: 1,
  },
  roleButton: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  pageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  pageInfo: {
    fontSize: 13,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
});
