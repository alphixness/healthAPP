import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const HealthTip: React.FC = () => {
  const tip = {
    icon: 'leaf',
    title: '健康小贴士',
    content: '每天摄入足够的蛋白质有助于维持肌肉质量，配合适量运动效果更佳！',
    color: '#4CAF50',
  };

  return (
    <View style={[styles.container, { backgroundColor: tip.color + '15' }]}>
      <View style={[styles.iconContainer, { backgroundColor: tip.color }]}>
        <Ionicons name={tip.icon as any} size={20} color="#fff" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{tip.title}</Text>
        <Text style={styles.text}>{tip.content}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
