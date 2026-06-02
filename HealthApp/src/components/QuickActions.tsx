import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickActionsProps {
  onRecipesPress: () => void;
  onExercisePress: () => void;
  onAssistantPress: () => void;
  onMealsPress: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onRecipesPress,
  onExercisePress,
  onAssistantPress,
  onMealsPress,
}) => {
  const actions = [
    { icon: 'restaurant-outline', label: '食谱', color: '#4CAF50', onPress: onRecipesPress },
    { icon: 'fitness-outline', label: '运动', color: '#03A9F4', onPress: onExercisePress },
    { icon: 'chatbubbles-outline', label: 'AI助手', color: '#9C27B0', onPress: onAssistantPress },
    { icon: 'list-outline', label: '记录', color: '#FF9800', onPress: onMealsPress },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>快捷功能</Text>
      <View style={styles.actionsGrid}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.actionItem, { backgroundColor: action.color + '15' }]}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: action.color }]}>
              <Ionicons name={action.icon as any} size={24} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionItem: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    minWidth: 70,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
