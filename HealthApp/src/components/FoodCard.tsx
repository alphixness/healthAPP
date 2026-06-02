import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, typography, borderRadius, spacing } from '../constants/theme'
import { FoodLog } from '../types'

interface FoodCardProps {
  food: FoodLog
  onPress?: () => void
}

export default function FoodCard({ food, onPress }: FoodCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="fast-food-outline" size={20} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
          {food.foodName}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {food.quantity}
          {food.unit} · {food.calories} kcal
        </Text>
      </View>
      <View style={styles.macros}>
        <MacroBadge value={food.protein} label="P" color={colors.primary} />
        <MacroBadge value={food.carbs} label="C" color={colors.accent} />
        <MacroBadge value={food.fat} label="F" color={colors.premium} />
      </View>
    </TouchableOpacity>
  )
}

function MacroBadge({
  value,
  label,
  color,
}: {
  value: number
  label: string
  color: string
}) {
  return (
    <View style={[styles.macroBadge, { backgroundColor: `${color}15` }]}>
      <Text style={[typography.caption, { color, fontWeight: '600' }]}>
        {label}
        {Math.round(value)}g
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  macros: {
    flexDirection: 'row',
    gap: 4,
  },
  macroBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
})
