import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useNutritionStore } from '../store/nutritionStore';
import { useHealthPlanetStore } from '../store/healthPlanetStore';
import { useAuthStore } from '../store/authStore';
import { Theme } from '../theme';

export const ProfileScreen: React.FC = () => {
  const { user, setUser } = useNutritionStore();
  const { currentUserTier, upgradeToPremium } = useHealthPlanetStore();
  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigation = useNavigation<any>();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    height: user?.height || 170,
    weight: user?.weight || 65,
    age: user?.age || 30,
    gender: user?.gender || 'male',
    goal: user?.goal || 'maintain',
    activityLevel: user?.activityLevel || 'moderate',
  });

  useEffect(() => {
    if (authUser?.role === 'admin' && currentUserTier !== 'premium') {
      upgradeToPremium();
    }
  }, [authUser?.role]);

  const handleSave = () => {
    setUser({
      id: user?.id || 'user-1',
      ...formData,
    });
    setIsEditing(false);
    Alert.alert('成功', '个人信息已更新');
  };

  const stats = [
    { label: '连续打卡', value: '7', unit: '天', icon: 'flame-outline', color: '#FF9800' },
    { label: '本周摄入', value: '14.2', unit: '千卡', icon: 'restaurant-outline', color: '#4CAF50' },
    { label: '目标完成', value: '85', unit: '%', icon: 'checkmark-circle-outline', color: '#2196F3' },
  ];

  const isBlogger = authUser?.role === 'fitness_blogger' || authUser?.role === 'food_blogger';

  const menuItems = [
    { icon: 'person-outline', label: '个人信息', onPress: () => setIsEditing(true) },
    { icon: 'diamond-outline', label: '会员中心', onPress: () => navigation.navigate('Membership') },
    ...(isAuthenticated && !isBlogger
      ? [{ icon: 'create-outline' as const, label: '申请成为博主', onPress: () => navigation.navigate('BloggerRegister') }]
      : []),
    ...(isBlogger
      ? [{ icon: 'videocam-outline' as const, label: '发布课程', onPress: () => navigation.navigate('CoursePublish') }]
      : []),
    { icon: 'notifications-outline', label: '消息通知', onPress: () => {} },
    { icon: 'shield-checkmark-outline', label: '隐私设置', onPress: () => {} },
    { icon: 'help-circle-outline', label: '帮助中心', onPress: () => {} },
    { icon: 'information-circle-outline', label: '关于我们', onPress: () => {} },
    ...(isAuthenticated && authUser?.role === 'admin'
      ? [{ icon: 'shield-outline' as const, label: '管理后台', onPress: () => navigation.navigate('AdminDashboard') }]
      : []),
  ];

  if (isEditing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.editHeader}>
          <TouchableOpacity onPress={() => setIsEditing(false)}>
            <Text style={styles.cancelText}>取消</Text>
          </TouchableOpacity>
          <Text style={styles.editTitle}>编辑个人信息</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveText}>保存</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.editForm}>
          <View style={styles.formItem}>
            <Text style={styles.formLabel}>身高 (cm)</Text>
            <TextInput
              style={styles.formInput}
              value={String(formData.height)}
              onChangeText={(value) => setFormData({ ...formData, height: Number(value) })}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formItem}>
            <Text style={styles.formLabel}>体重 (kg)</Text>
            <TextInput
              style={styles.formInput}
              value={String(formData.weight)}
              onChangeText={(value) => setFormData({ ...formData, weight: Number(value) })}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formItem}>
            <Text style={styles.formLabel}>年龄</Text>
            <TextInput
              style={styles.formInput}
              value={String(formData.age)}
              onChangeText={(value) => setFormData({ ...formData, age: Number(value) })}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formItem}>
            <Text style={styles.formLabel}>性别</Text>
            <View style={styles.optionGroup}>
              <TouchableOpacity
                style={[styles.optionButton, formData.gender === 'male' && styles.optionButtonActive]}
                onPress={() => setFormData({ ...formData, gender: 'male' })}
              >
                <Text style={[styles.optionText, formData.gender === 'male' && styles.optionTextActive]}>男</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, formData.gender === 'female' && styles.optionButtonActive]}
                onPress={() => setFormData({ ...formData, gender: 'female' })}
              >
                <Text style={[styles.optionText, formData.gender === 'female' && styles.optionTextActive]}>女</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formItem}>
            <Text style={styles.formLabel}>健康目标</Text>
            <View style={styles.optionGroup}>
              <TouchableOpacity
                style={[styles.optionButton, formData.goal === 'lose' && styles.optionButtonActive]}
                onPress={() => setFormData({ ...formData, goal: 'lose' })}
              >
                <Text style={[styles.optionText, formData.goal === 'lose' && styles.optionTextActive]}>减脂</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, formData.goal === 'maintain' && styles.optionButtonActive]}
                onPress={() => setFormData({ ...formData, goal: 'maintain' })}
              >
                <Text style={[styles.optionText, formData.goal === 'maintain' && styles.optionTextActive]}>维持</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, formData.goal === 'gain' && styles.optionButtonActive]}
                onPress={() => setFormData({ ...formData, goal: 'gain' })}
              >
                <Text style={[styles.optionText, formData.goal === 'gain' && styles.optionTextActive]}>增肌</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formItem}>
            <Text style={styles.formLabel}>活动水平</Text>
            <View style={styles.optionGroup}>
              {['久坐', '轻度', '中度', '活跃'].map((level, index) => {
                const levels = ['sedentary', 'light', 'moderate', 'active'];
                return (
                  <TouchableOpacity
                    key={level}
                    style={[styles.optionButton, formData.activityLevel === levels[index] && styles.optionButtonActive]}
                    onPress={() => setFormData({ ...formData, activityLevel: levels[index] as any })}
                  >
                    <Text style={[styles.optionText, formData.activityLevel === levels[index] && styles.optionTextActive]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={60} color="#fff" />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{authUser?.nickname || '健康用户'}</Text>
          <Text style={styles.userGoal}>
            {isAuthenticated ? (authUser?.role === 'admin' ? '管理员' : '已登录') : user?.goal === 'lose' ? '减脂中' : user?.goal === 'gain' ? '增肌中' : '维持体重'}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.profileCard}>
          <Text style={styles.sectionTitle}>基本信息</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>身高</Text>
            <Text style={styles.infoValue}>{user?.height || 170} cm</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>体重</Text>
            <Text style={styles.infoValue}>{user?.weight || 65} kg</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>年龄</Text>
            <Text style={styles.infoValue}>{user?.age || 30} 岁</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>性别</Text>
            <Text style={styles.infoValue}>{user?.gender === 'male' ? '男' : '女'}</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon as any} size={22} color="#666" />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {isAuthenticated ? (
          <TouchableOpacity style={styles.logoutButton} onPress={() => {
            Alert.alert('退出登录', '确定要退出登录吗？', [
              { text: '取消', style: 'cancel' },
              { text: '退出', style: 'destructive', onPress: () => clearAuth() },
            ]);
          }}>
            <Text style={styles.logoutText}>退出登录</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
            <Ionicons name="log-in-outline" size={20} color="#fff" />
            <Text style={styles.loginButtonText}>登录 / 注册</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userGoal: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  profileCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  memberCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  memberTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  memberBadge: {
    backgroundColor: '#FFF8E1',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  memberBadgeText: {
    fontSize: 11,
    color: '#FFA000',
    fontWeight: '700',
  },
  memberDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  memberFeatures: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  memberFeature: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  memberFeatureText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFA000',
    paddingVertical: 14,
    borderRadius: 12,
  },
  upgradeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF5722',
    fontWeight: '600',
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  editTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  saveText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  editForm: {
    padding: 20,
  },
  formItem: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
  },
  formInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
  },
  optionGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#4CAF50',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#fff',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4CAF50',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  loginButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
