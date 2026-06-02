import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useNutritionStore } from '../store/nutritionStore';
import { Theme } from '../theme';

const STEPS = ['饮食偏好', '过敏与健康', '运动习惯', '烹饪能力'];

const DIETARY_OPTIONS = [
  { value: 'omnivore' as const, label: '均衡饮食', icon: 'restaurant', desc: '肉蛋奶蔬菜都吃' },
  { value: 'vegetarian' as const, label: '蛋奶素', icon: 'leaf', desc: '不吃肉，吃蛋奶' },
  { value: 'vegan' as const, label: '纯素', icon: 'heart', desc: '纯植物饮食' },
  { value: 'keto' as const, label: '生酮', icon: 'flame', desc: '高脂肪低碳水' },
  { value: 'paleo' as const, label: '原始饮食', icon: 'barbell', desc: '天然食材为主' },
];

const ALLERGY_OPTIONS = [
  '花生', '坚果', '牛奶', '鸡蛋', '海鲜',
  '大豆', '小麦', '鱼类', '芝麻', '芹菜',
];

const HEALTH_CONDITIONS = [
  { value: 'none', label: '无特殊状况' },
  { value: 'hypertension', label: '高血压' },
  { value: 'diabetes', label: '糖尿病' },
  { value: 'hyperlipidemia', label: '高血脂' },
  { value: 'gastric', label: '胃病' },
  { value: 'gout', label: '痛风' },
  { value: 'anemia', label: '贫血' },
  { value: 'thyroid', label: '甲状腺问题' },
  { value: 'kidney', label: '肾脏疾病' },
  { value: 'pregnant', label: '孕期' },
];

const EXERCISE_FREQ_OPTIONS = [
  { value: 'never' as const, label: '几乎不运动', icon: 'bed' },
  { value: 'rarely' as const, label: '偶尔运动', icon: 'walk' },
  { value: 'sometimes' as const, label: '每周1-2次', icon: 'fitness' },
  { value: 'often' as const, label: '每周3-4次', icon: 'trending-up' },
  { value: 'daily' as const, label: '每天运动', icon: 'flash' },
];

const EXERCISE_TYPES = [
  '跑步', '步行', '游泳', '瑜伽', '力量训练',
  '骑行', '舞蹈', '球类', '太极拳', 'HIIT',
];

const COOKING_OPTIONS = [
  { value: 'beginner' as const, label: '厨房新手', desc: '只会简单的煮和炒' },
  { value: 'intermediate' as const, label: '一般水平', desc: '能做一些家常菜' },
  { value: 'advanced' as const, label: '厨艺达人', desc: '擅长各种烹饪方式' },
];

const PREP_TIME_OPTIONS = [
  { value: 'quick' as const, label: '快速', desc: '15分钟内搞定' },
  { value: 'moderate' as const, label: '适中', desc: '15-30分钟' },
  { value: 'any' as const, label: '不介意', desc: '多久都行' },
];

export const HealthQuestionnaireScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const user = useNutritionStore((s) => s.user);
  const setUser = useNutritionStore((s) => s.setUser);

  const [step, setStep] = useState(0);
  const [dietary, setDietary] = useState<'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'paleo'>('omnivore');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [exerciseFreq, setExerciseFreq] = useState<'never' | 'rarely' | 'sometimes' | 'often' | 'daily'>('sometimes');
  const [exerciseTypes, setExerciseTypes] = useState<string[]>([]);
  const [cookingAbility, setCookingAbility] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [mealPrepTime, setMealPrepTime] = useState<'quick' | 'moderate' | 'any'>('moderate');

  const toggleAllergy = (item: string) => {
    setAllergies((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
    );
  };

  const toggleCondition = (item: string) => {
    if (item === 'none') {
      setConditions(['none']);
      return;
    }
    const next = conditions.includes(item)
      ? conditions.filter((x) => x !== item)
      : [...conditions.filter((x) => x !== 'none'), item];
    setConditions(next);
  };

  const toggleExerciseType = (item: string) => {
    setExerciseTypes((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
    );
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      navigation.goBack();
    }
  };

  const handleComplete = () => {
    if (!user) return;
    setUser({
      ...user,
      questionnaireCompleted: true,
      healthProfile: {
        dietaryPreference: dietary,
        allergies,
        healthConditions: conditions.filter((x) => x !== 'none'),
        exerciseFrequency: exerciseFreq,
        exerciseTypes,
        cookingAbility,
        mealPrepTime,
      },
    });
    navigation.goBack();
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
          <Ionicons name="close" size={22} color={Theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>健康问卷</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.headerSkip}>跳过</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress}%` as any }]} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepLabel}>第 {step + 1} / {STEPS.length} 步</Text>
        <Text style={styles.stepTitle}>{STEPS[step]}</Text>
        <Text style={styles.stepSub}>{stepDescriptions[step]}</Text>

        {step === 0 && (
          <View style={styles.optionGrid}>
            {DIETARY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.optionCard, dietary === opt.value && styles.optionCardActive]}
                onPress={() => setDietary(opt.value)}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIconWrap, dietary === opt.value && styles.optionIconWrapActive]}>
                  <Ionicons name={opt.icon as any} size={22} color={dietary === opt.value ? '#fff' : Theme.colors.primary} />
                </View>
                <Text style={[styles.optionLabel, dietary === opt.value && styles.optionLabelActive]}>{opt.label}</Text>
                <Text style={styles.optionDesc}>{opt.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={styles.sectionLabel}>过敏食物（可多选）</Text>
            <View style={styles.chipGrid}>
              {ALLERGY_OPTIONS.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, allergies.includes(item) && styles.chipActive]}
                  onPress={() => toggleAllergy(item)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, allergies.includes(item) && styles.chipTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>健康状况（可多选）</Text>
            <View style={styles.conditionGrid}>
              {HEALTH_CONDITIONS.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.conditionCard, conditions.includes(item.value) && styles.conditionCardActive]}
                  onPress={() => toggleCondition(item.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.conditionLeft}>
                    <View style={[styles.checkbox, conditions.includes(item.value) && styles.checkboxActive]}>
                      {conditions.includes(item.value) && <Ionicons name="checkmark" size={12} color="#fff" />}
                    </View>
                    <Text style={[styles.conditionLabel, conditions.includes(item.value) && styles.conditionLabelActive]}>
                      {item.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.sectionLabel}>运动频率</Text>
            <View style={styles.optionGrid}>
              {EXERCISE_FREQ_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.freqCard, exerciseFreq === opt.value && styles.freqCardActive]}
                  onPress={() => setExerciseFreq(opt.value)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.freqIconWrap, exerciseFreq === opt.value && styles.freqIconWrapActive]}>
                    <Ionicons
                      name={opt.icon as any}
                      size={20}
                      color={exerciseFreq === opt.value ? '#fff' : Theme.colors.info}
                    />
                  </View>
                  <Text style={[styles.freqLabel, exerciseFreq === opt.value && styles.freqLabelActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>喜欢的运动（可多选）</Text>
            <View style={styles.chipGrid}>
              {EXERCISE_TYPES.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, exerciseTypes.includes(item) && styles.chipActive]}
                  onPress={() => toggleExerciseType(item)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, exerciseTypes.includes(item) && styles.chipTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.sectionLabel}>烹饪水平</Text>
            <View style={styles.optionGrid}>
              {COOKING_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.optionCard, cookingAbility === opt.value && styles.optionCardActive]}
                  onPress={() => setCookingAbility(opt.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionLabel, cookingAbility === opt.value && styles.optionLabelActive]}>{opt.label}</Text>
                  <Text style={styles.optionDesc}>{opt.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>备餐时间</Text>
            <View style={styles.optionGrid}>
              {PREP_TIME_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.optionCard, mealPrepTime === opt.value && styles.optionCardActive]}
                  onPress={() => setMealPrepTime(opt.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionLabel, mealPrepTime === opt.value && styles.optionLabelActive]}>{opt.label}</Text>
                  <Text style={styles.optionDesc}>{opt.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {step === STEPS.length - 1 ? '完成' : '下一步'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const stepDescriptions = [
  '选择你的日常饮食方式，以便推荐适合的食谱',
  '告知过敏食物和健康状况，确保推荐安全无虞',
  '了解你的运动频率和偏好，推荐合适的运动方案',
  '根据烹饪水平和备餐时间，推荐易操作的食谱',
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerBack: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Theme.colors.text.primary,
  },
  headerSkip: {
    fontSize: 15,
    color: Theme.colors.text.tertiary,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#F0F0F5',
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Theme.colors.primary,
    borderRadius: 2,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  bodyContent: {
    paddingBottom: 100,
  },
  stepLabel: {
    fontSize: 13,
    color: Theme.colors.primary,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Theme.colors.text.primary,
    marginBottom: 6,
  },
  stepSub: {
    fontSize: 14,
    color: Theme.colors.text.tertiary,
    lineHeight: 20,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.text.primary,
    marginBottom: 12,
  },

  // 选项卡片网格
  optionGrid: {
    gap: 10,
  },
  optionCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F0F0F5',
    backgroundColor: '#FAFBFE',
  },
  optionCardActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: `${Theme.colors.primary}08`,
  },
  optionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${Theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionIconWrapActive: {
    backgroundColor: Theme.colors.primary,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.text.primary,
    marginBottom: 2,
  },
  optionLabelActive: {
    color: Theme.colors.primary,
  },
  optionDesc: {
    fontSize: 12,
    color: Theme.colors.text.tertiary,
  },

  // 标签选择
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E8E8F0',
    backgroundColor: '#FAFBFE',
  },
  chipActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: `${Theme.colors.primary}12`,
  },
  chipText: {
    fontSize: 13,
    color: Theme.colors.text.secondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Theme.colors.primary,
  },

  // 健康条件
  conditionGrid: {
    gap: 8,
  },
  conditionCard: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F5',
    backgroundColor: '#FAFBFE',
  },
  conditionCardActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: `${Theme.colors.primary}08`,
  },
  conditionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D0D0D8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  conditionLabel: {
    fontSize: 15,
    color: Theme.colors.text.primary,
    fontWeight: '500',
  },
  conditionLabelActive: {
    fontWeight: '700',
  },

  // 运动频率
  freqCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F0F0F5',
    backgroundColor: '#FAFBFE',
  },
  freqCardActive: {
    borderColor: Theme.colors.info,
    backgroundColor: `${Theme.colors.info}08`,
  },
  freqIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${Theme.colors.info}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  freqIconWrapActive: {
    backgroundColor: Theme.colors.info,
  },
  freqLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Theme.colors.text.primary,
  },
  freqLabelActive: {
    color: Theme.colors.info,
  },

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F5',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
