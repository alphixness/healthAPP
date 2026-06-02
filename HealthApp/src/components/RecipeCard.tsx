import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, typography, borderRadius, spacing } from '../constants/theme'
import { Recipe } from '../types'

interface RecipeCardProps {
  recipe: Recipe
  onPress?: () => void
  onSave?: () => void
  compact?: boolean
}

export default function RecipeCard({
  recipe,
  onPress,
  onSave,
  compact,
}: RecipeCardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, compact && styles.compact]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.imagePlaceholder, compact && styles.compactImage]}>
        {compact ? (
          <Ionicons name="restaurant-outline" size={24} color={colors.primary} />
        ) : (
          <>
            <Ionicons name="restaurant-outline" size={32} color={colors.primary} />
            {recipe.isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="diamond" size={10} color={colors.surface} />
                <Text style={[typography.caption, { color: colors.surface, fontSize: 9 }]}>
                  PREMIUM
                </Text>
              </View>
            )}
          </>
        )}
      </View>
      <View style={[styles.info, compact && styles.compactInfo]}>
        {!compact && (
          <View style={styles.categoryTag}>
            <Text style={[typography.caption, { color: colors.primary, fontSize: 10 }]}>
              {categoryLabel(recipe.category)}
            </Text>
          </View>
        )}
        <Text
          style={[
            compact ? typography.caption : typography.bodyBold,
            { color: colors.textPrimary },
            compact && { fontSize: 12 },
          ]}
          numberOfLines={2}
        >
          {recipe.name}
        </Text>
        {!compact && (
          <>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              {recipe.calories} kcal · {recipe.prepTime}分钟
            </Text>
            <View style={styles.macros}>
              <Text style={[typography.caption, { color: colors.textTertiary }]}>
                蛋白质 {recipe.protein}g
              </Text>
              <Text style={[typography.caption, { color: colors.textTertiary }]}>
                碳水 {recipe.carbs}g
              </Text>
              <Text style={[typography.caption, { color: colors.textTertiary }]}>
                脂肪 {recipe.fat}g
              </Text>
            </View>
          </>
        )}
      </View>
      {onSave && (
        <TouchableOpacity onPress={onSave} style={styles.saveButton}>
          <Ionicons
            name={recipe.isSaved ? 'heart' : 'heart-outline'}
            size={20}
            color={recipe.isSaved ? colors.error : colors.textTertiary}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  )
}

function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '小食',
  }
  return labels[category] || category
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  compact: {
    width: 140,
    flexDirection: 'column',
    padding: spacing.sm,
    marginRight: spacing.md,
    marginBottom: 0,
  },
  imagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  compactImage: {
    width: '100%',
    height: 80,
    marginRight: 0,
    marginBottom: spacing.sm,
  },
  info: {
    flex: 1,
  },
  compactInfo: {
    paddingHorizontal: 2,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  macros: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  premiumBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.premium,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  saveButton: {
    padding: spacing.sm,
    justifyContent: 'flex-start',
  },
})
