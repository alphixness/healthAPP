import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme';

interface DashboardHeaderProps {
  userName?: string;
  onProfilePress?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  userName = '健康用户',
  onProfilePress,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了';
    if (hour < 9) return '早上好';
    if (hour < 12) return '上午好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    if (hour < 22) return '晚上好';
    return '夜深了';
  };

  const getFormattedDate = () => {
    const today = new Date();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const month = today.getMonth() + 1;
    const date = today.getDate();
    const day = weekdays[today.getDay()];
    return `${month}月${date}日 ${day}`;
  };

  return (
    <LinearGradient
      colors={Theme.colors.primaryGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <View style={styles.topRow}>
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <TouchableOpacity 
            style={styles.avatarButton} 
            onPress={onProfilePress}
            activeOpacity={0.8}
          >
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.date}>{getFormattedDate()}</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  greetingSection: {},
  greeting: {
    fontSize: Theme.fontSize.md,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
  },
  userName: {
    fontSize: Theme.fontSize.xxxl,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  avatarButton: {},
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Theme.borderRadius.full,
  },
  date: {
    fontSize: Theme.fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
});
