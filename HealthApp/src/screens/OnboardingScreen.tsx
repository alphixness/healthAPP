import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, typography, borderRadius, spacing } from '../constants/theme'
import { useNutritionStore } from '../store/nutritionStore'
import { useAppStore } from '../stores'
import GradientButton from '../components/GradientButton'

type Step = 'welcome' | 'info' | 'goal' | 'activity'

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>('welcome')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | null>(null)
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain' | null>(null)
  const [activityLevel, setActivityLevel] = useState<string | null>(null)

  const setUser = useNutritionStore((s) => s.setUser)
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete)

  const canProceed = {
    info: height && weight && age && gender,
    goal: goal !== null,
    activity: activityLevel !== null,
  }

  const handleComplete = () => {
    if (!goal || !activityLevel || !gender) return
    setUser({
      id: Date.now().toString(),
      height: Number(height),
      weight: Number(weight),
      age: Number(age),
      gender,
      goal,
      activityLevel: activityLevel as any,
    })
    setOnboardingComplete(true)
  }

  if (step === 'welcome') {
    return (
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.welcomeContainer}
      >
        <View style={styles.welcomeContent}>
          <View style={styles.welcomeIcon}>
            <Ionicons name="leaf-outline" size={64} color={colors.surface} />
          </View>
          <Text style={styles.welcomeTitle}>健康饮食管家</Text>
          <Text style={styles.welcomeSubtitle}>
            用AI拍照识别食物，智能追踪营养，{'\n'}让健康管理变得轻松简单
          </Text>
          <View style={styles.featureList}>
            <FeatureItem icon="camera-outline" text="拍照识别食物，秒获营养数据" />
            <FeatureItem icon="chatbubble-ellipses-outline" text="AI语音助手，随时解答健康疑问" />
            <FeatureItem icon="restaurant-outline" text="个性化食谱，科学搭配每一餐" />
            <FeatureItem icon="fitness-outline" text="运动计划推荐，全方位健康管理" />
          </View>
          <GradientButton
            title="开始设置"
            onPress={() => setStep('info')}
            colors={[colors.accent, colors.accent]}
            style={styles.startButton}
          />
          <Text style={styles.startHint}>回答几个问题，获取个性化方案</Text>
        </View>
      </LinearGradient>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (step === 'info') setStep('welcome')
            else if (step === 'goal') setStep('info')
            else if (step === 'activity') setStep('goal')
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width:
                  step === 'info' ? '33%' : step === 'goal' ? '66%' : '100%',
              },
            ]}
          />
        </View>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {step === 'info' ? '1/3' : step === 'goal' ? '2/3' : '3/3'}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
      >
        {step === 'info' && (
          <InfoStep
            height={height}
            weight={weight}
            age={age}
            gender={gender}
            onHeightChange={setHeight}
            onWeightChange={setWeight}
            onAgeChange={setAge}
            onGenderChange={setGender}
            onNext={() => setStep('goal')}
            canProceed={!!canProceed.info}
          />
        )}
        {step === 'goal' && (
          <GoalStep
            value={goal}
            onChange={setGoal}
            onNext={() => setStep('activity')}
            canProceed={!!canProceed.goal}
          />
        )}
        {step === 'activity' && (
          <ActivityStep
            value={activityLevel}
            onChange={setActivityLevel}
            onComplete={handleComplete}
            canProceed={!!canProceed.activity}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function InfoStep({
  height,
  weight,
  age,
  gender,
  onHeightChange,
  onWeightChange,
  onAgeChange,
  onGenderChange,
  onNext,
  canProceed,
}: {
  height: string
  weight: string
  age: string
  gender: 'male' | 'female' | null
  onHeightChange: (v: string) => void
  onWeightChange: (v: string) => void
  onAgeChange: (v: string) => void
  onGenderChange: (v: 'male' | 'female') => void
  onNext: () => void
  canProceed: boolean
}) {
  return (
    <View>
      <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
        基本信息
      </Text>
      <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.xxl }]}>
        让我们了解你的身体数据，以便提供更准确的建议
      </Text>

      <View style={styles.genderRow}>
        <TouchableOpacity
          style={[
            styles.genderCard,
            gender === 'male' && styles.genderCardActive,
          ]}
          onPress={() => onGenderChange('male')}
        >
          <Ionicons
            name="man-outline"
            size={32}
            color={gender === 'male' ? colors.surface : colors.textSecondary}
          />
          <Text
            style={[
              typography.body,
              {
                color:
                  gender === 'male' ? colors.surface : colors.textSecondary,
              },
            ]}
          >
            男性
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.genderCard,
            gender === 'female' && styles.genderCardActive,
          ]}
          onPress={() => onGenderChange('female')}
        >
          <Ionicons
            name="woman-outline"
            size={32}
            color={gender === 'female' ? colors.surface : colors.textSecondary}
          />
          <Text
            style={[
              typography.body,
              {
                color:
                  gender === 'female' ? colors.surface : colors.textSecondary,
              },
            ]}
          >
            女性
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputRow}>
        <InputField
          label="身高"
          unit="cm"
          value={height}
          onChange={onHeightChange}
          placeholder="170"
          keyboardType="numeric"
        />
        <InputField
          label="体重"
          unit="kg"
          value={weight}
          onChange={onWeightChange}
          placeholder="65"
          keyboardType="numeric"
        />
        <InputField
          label="年龄"
          unit="岁"
          value={age}
          onChange={onAgeChange}
          placeholder="28"
          keyboardType="numeric"
        />
      </View>

      <GradientButton
        title="下一步"
        onPress={onNext}
        disabled={!canProceed}
      />
    </View>
  )
}

function GoalStep({
  value,
  onChange,
  onNext,
  canProceed,
}: {
  value: string | null
  onChange: (v: 'lose' | 'maintain' | 'gain') => void
  onNext: () => void
  canProceed: boolean
}) {
  const goals = [
    { key: 'lose' as const, icon: 'trending-down-outline', label: '减脂', desc: '减少体脂，塑造身材' },
    { key: 'maintain' as const, icon: 'remove-outline', label: '维持', desc: '保持当前体重，健康生活' },
    { key: 'gain' as const, icon: 'trending-up-outline', label: '增肌', desc: '增加肌肉量，提升力量' },
  ]
  return (
    <View>
      <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
        健康目标
      </Text>
      <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.xxl }]}>
        你最主要的目标是什么？
      </Text>

      {goals.map((g) => (
        <TouchableOpacity
          key={g.key}
          style={[
            styles.optionCard,
            value === g.key && styles.optionCardActive,
          ]}
          onPress={() => onChange(g.key)}
        >
          <View
            style={[
              styles.optionIcon,
              {
                backgroundColor:
                  value === g.key ? `${colors.primary}20` : colors.borderLight,
              },
            ]}
          >
            <Ionicons
              name={g.icon as any}
              size={24}
              color={value === g.key ? colors.primary : colors.textSecondary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                typography.bodyBold,
                {
                  color:
                    value === g.key ? colors.primary : colors.textPrimary,
                },
              ]}
            >
              {g.label}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {g.desc}
            </Text>
          </View>
          {value === g.key && (
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          )}
        </TouchableOpacity>
      ))}

      <GradientButton
        title="下一步"
        onPress={onNext}
        disabled={!canProceed}
        style={{ marginTop: spacing.xl }}
      />
    </View>
  )
}

function ActivityStep({
  value,
  onChange,
  onComplete,
  canProceed,
}: {
  value: string | null
  onChange: (v: string) => void
  onComplete: () => void
  canProceed: boolean
}) {
  const levels = [
    { key: 'sedentary', label: '久坐不动', desc: '几乎不运动，办公室工作' },
    { key: 'light', label: '轻度运动', desc: '每周运动1-3天' },
    { key: 'moderate', label: '中度运动', desc: '每周运动3-5天' },
    { key: 'active', label: '积极运动', desc: '每周运动6-7天' },
    { key: 'very_active', label: '高强度运动', desc: '每天高强度运动或体力劳动' },
  ]
  return (
    <View>
      <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
        活动水平
      </Text>
      <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.xxl }]}>
        你平时的运动频率如何？
      </Text>

      {levels.map((l) => (
        <TouchableOpacity
          key={l.key}
          style={[
            styles.optionCard,
            value === l.key && styles.optionCardActive,
          ]}
          onPress={() => onChange(l.key)}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={[
                typography.bodyBold,
                {
                  color:
                    value === l.key ? colors.primary : colors.textPrimary,
                },
              ]}
            >
              {l.label}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {l.desc}
            </Text>
          </View>
          {value === l.key && (
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          )}
        </TouchableOpacity>
      ))}

      <GradientButton
        title="开始健康之旅"
        onPress={onComplete}
        disabled={!canProceed}
        style={{ marginTop: spacing.xl }}
      />
    </View>
  )
}

function InputField({
  label,
  unit,
  value,
  onChange,
  placeholder,
  keyboardType,
}: {
  label: string
  unit: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  keyboardType?: 'default' | 'numeric'
}) {
  return (
    <View style={styles.inputField}>
      <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 4 }]}>
        {label}（{unit}）
      </Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor={colors.textTertiary}
      />
    </View>
  )
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Ionicons name={icon as any} size={20} color={colors.surface} style={{ opacity: 0.9 }} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  welcomeIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.xxl,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.surface,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xxxl,
  },
  featureList: {
    marginBottom: spacing.xxxl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  featureText: {
    fontSize: 15,
    color: colors.surface,
    marginLeft: spacing.md,
  },
  startButton: {
    marginBottom: spacing.md,
  },
  startHint: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl + 20,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  formContent: {
    padding: spacing.xxl,
    paddingBottom: spacing.xxxl + 40,
  },
  genderRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  genderCard: {
    flex: 1,
    height: 100,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  genderCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  inputField: {
    flex: 1,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
})
