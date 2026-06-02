import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useHealthPlanetStore } from '../store/healthPlanetStore';
import { api } from '../services/api';
import { detectRegion } from '../config/env';

export const MembershipScreen: React.FC = () => {
  const navigation = useNavigation();
  const { currentUserTier, upgradeToPremium } = useHealthPlanetStore();
  const [purchasing, setPurchasing] = useState(false);
  const [price, setPrice] = useState(19);
  const [currency, setCurrency] = useState('CNY');
  const [region, setRegion] = useState<'china' | 'global'>('china');

  useEffect(() => {
    const userRegion = detectRegion();
    setRegion(userRegion);
    api.membership.getPrice().then((res) => {
      if (res.success && res.data) {
        setPrice(res.data.amount);
        setCurrency(res.data.currency);
      }
    });
  }, []);

  const features = [
    { icon: 'restaurant-outline', color: '#4CAF50', title: '每日个性化食谱', desc: '基于您的身体数据，每天推荐专属食谱' },
    { icon: 'fitness-outline', color: '#2196F3', title: '每日运动计划', desc: '根据您的目标定制运动方案' },
    { icon: 'lock-open-outline', color: '#FF9800', title: '解锁会员课程', desc: '畅享所有会员专享课程内容' },
    { icon: 'analytics-outline', color: '#9C27B0', title: '高级数据分析', desc: '更详细的健康数据分析和建议' },
  ];

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      const res = await api.membership.purchase();
      if (res.success) {
        upgradeToPremium();
        Alert.alert('开通成功', '您已成功开通会员，立即享受所有会员权益！', [
          { text: '开始使用', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('开通失败', res.error || '请稍后重试');
      }
    } catch {
      Alert.alert('网络异常', '请检查网络连接后重试');
    } finally {
      setPurchasing(false);
    }
  };

  const isPremium = currentUserTier === 'premium';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>会员中心</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>👑</Text>
          <Text style={styles.heroTitle}>健康Pro会员</Text>
          <Text style={styles.heroSubtitle}>开启科学健康管理之旅</Text>
          {!isPremium && (
            <View style={styles.priceRow}>
              <Text style={styles.priceSymbol}>{currency === 'USD' ? '$' : '¥'}</Text>
              <Text style={styles.priceAmount}>{price}</Text>
              <Text style={styles.priceUnit}>/{region === 'china' ? '月' : 'mo'}</Text>
            </View>
          )}
        </View>

        {isPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="checkmark-circle" size={22} color="#FFD700" />
            <Text style={styles.premiumBadgeText}>会员已开通 · 享受全部权益</Text>
          </View>
        )}

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>会员权益</Text>
          {features.map((f, i) => (
            <View key={i} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: f.color + '15' }]}>
                <Ionicons name={f.icon as any} size={24} color={f.color} />
              </View>
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {!isPremium && (
          <>
            <View style={styles.purchaseSection}>
              <TouchableOpacity
                style={[styles.purchaseBtn, purchasing && styles.purchaseBtnDisabled]}
                onPress={handlePurchase}
                disabled={purchasing}
                activeOpacity={0.8}
              >
                <Ionicons name="diamond" size={20} color="#fff" />
                <Text style={styles.purchaseBtnText}>
                  {purchasing ? '开通中...' : `立即开通 ${currency === 'USD' ? '$' : '¥'}${price}/${region === 'china' ? '月' : 'mo'}`}
                </Text>
              </TouchableOpacity>
              <Text style={styles.purchaseNote}>可随时取消自动续费</Text>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#4CAF50',
  },
  backBtn: { width: 40 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  heroSection: {
    alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20,
    backgroundColor: '#4CAF50',
  },
  heroEmoji: { fontSize: 48, marginBottom: 12 },
  heroTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  heroSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.85)', marginBottom: 20 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  priceSymbol: { fontSize: 20, color: '#fff', fontWeight: '700' },
  priceAmount: { fontSize: 48, fontWeight: 'bold', color: '#fff', marginHorizontal: 2 },
  priceUnit: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  premiumBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, backgroundColor: '#FFF8E1',
  },
  premiumBadgeText: { fontSize: 16, fontWeight: '700', color: '#F57F17' },
  featuresSection: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  featureCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: '#fff', borderRadius: 14, padding: 18,
    marginBottom: 12,
  },
  featureIcon: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
  },
  featureInfo: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 4 },
  featureDesc: { fontSize: 13, color: '#999', lineHeight: 18 },
  purchaseSection: { paddingHorizontal: 20, paddingTop: 8 },
  purchaseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#FFA000', borderRadius: 16, paddingVertical: 18,
    shadowColor: '#FFA000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  purchaseBtnDisabled: { opacity: 0.6 },
  purchaseBtnText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  purchaseNote: { textAlign: 'center', fontSize: 12, color: '#999', marginTop: 12 },
});
