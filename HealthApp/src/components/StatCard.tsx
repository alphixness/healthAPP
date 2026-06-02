import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, typography, borderRadius, spacing } from '../constants/theme'

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap
  iconColor?: string
  label: string
  value: string
  subtitle?: string
}

export default function StatCard({
  icon,
  iconColor = colors.primary,
  label,
  value,
  subtitle,
}: StatCardProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.sm }]}>
        {label}
      </Text>
      <Text style={[typography.h3, { color: colors.textPrimary, marginTop: 2 }]}>{value}</Text>
      {subtitle && (
        <Text style={[typography.caption, { color: colors.textTertiary, marginTop: 2 }]}>
          {subtitle}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
