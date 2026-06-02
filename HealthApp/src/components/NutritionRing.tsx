import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, typography } from '../constants/theme'

interface NutritionRingProps {
  current: number
  target: number
  label: string
  unit?: string
  color?: string
  size?: number
  strokeWidth?: number
}

export default function NutritionRing({
  current,
  target,
  label,
  unit = '',
  color = colors.primary,
  size = 80,
  strokeWidth = 6,
}: NutritionRingProps) {
  const percentage = target > 0 ? Math.min(current / target, 1) : 0
  const circumference = 2 * Math.PI * ((size - strokeWidth) / 2)
  const progress = circumference * (1 - percentage)
  const isOver = current > target

  return (
    <View style={[styles.container, { width: size }]}>
      <View style={{ width: size, height: size }}>
        <View
          style={[
            styles.ring,
            {
              width: size - strokeWidth,
              height: size - strokeWidth,
              borderRadius: (size - strokeWidth) / 2,
              borderWidth: strokeWidth,
              borderColor: `${color}20`,
            },
          ]}
        >
          <Text
            style={[
              typography.numberSmall,
              { color: isOver ? colors.accent : color },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {Math.round(current)}
          </Text>
        </View>
      </View>
      <View style={styles.labels}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {label}
        </Text>
        {target > 0 && (
          <Text style={[typography.caption, { color: colors.textTertiary }]}>
            目标 {target}
            {unit}
          </Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  ring: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  labels: {
    alignItems: 'center',
    marginTop: 4,
  },
})
