import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFoodChannelStore, RecipePost } from '../store/foodChannelStore';
import { Theme } from '../theme';

const EMOJI_OPTIONS = ['🥗', '🥣', '🥩', '🍜', '🫑', '🍓', '🍳', '🥘', '🍲', '🧁', '🥑', '🍱'];
const CATEGORY_OPTIONS = ['减脂餐', '增肌餐', '健康早餐', '家常菜', '素食', '甜品', '汤品'];
const DIFFICULTY_OPTIONS: Array<{ value: 'easy' | 'medium' | 'hard'; label: string }> = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
];

export const PublishRecipeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { addPost } = useFoodChannelStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🥗');
  const [category, setCategory] = useState('减脂餐');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');
  const [ingredientName, setIngredientName] = useState('');
  const [ingredientAmount, setIngredientAmount] = useState('');
  const [ingredients, setIngredients] = useState<Array<{ name: string; amount: string }>>([]);
  const [stepText, setStepText] = useState('');
  const [stepTip, setStepTip] = useState('');
  const [steps, setSteps] = useState<Array<{ step: number; description: string; tip?: string }>>([]);

  const addIngredient = () => {
    if (!ingredientName.trim() || !ingredientAmount.trim()) return;
    setIngredients([...ingredients, { name: ingredientName.trim(), amount: ingredientAmount.trim() }]);
    setIngredientName('');
    setIngredientAmount('');
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addStep = () => {
    if (!stepText.trim()) return;
    setSteps([...steps, { 
      step: steps.length + 1, 
      description: stepText.trim(),
      ...(stepTip.trim() ? { tip: stepTip.trim() } : {}),
    }]);
    setStepText('');
    setStepTip('');
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    newSteps.forEach((s, i) => { s.step = i + 1; });
    setSteps(newSteps);
  };

  const handlePublish = () => {
    if (!title.trim()) { Alert.alert('提示', '请输入食谱标题'); return; }
    if (!description.trim()) { Alert.alert('提示', '请输入食谱描述'); return; }
    if (ingredients.length === 0) { Alert.alert('提示', '请至少添加一种食材'); return; }
    if (steps.length === 0) { Alert.alert('提示', '请至少添加一个步骤'); return; }

    const newPost: RecipePost = {
      id: `p_${Date.now()}`,
      author: {
        id: 'me',
        name: '我',
        avatar: '😊',
        isVerified: false,
        followers: 0,
        recipes: 1,
      },
      title: title.trim(),
      coverEmoji: selectedEmoji,
      coverImage: '',
      isMemberOnly: false,
      description: description.trim(),
      category,
      tags: [category],
      difficulty,
      cookTime: parseInt(cookTime) || 15,
      servings: parseInt(servings) || 1,
      ingredients,
      steps,
      nutrition: {
        calories: parseInt(calories) || 0,
        protein: parseInt(protein) || 0,
        fat: parseInt(fat) || 0,
        carbs: parseInt(carbs) || 0,
      },
      stats: { likes: 0, collections: 0, comments: 0, views: 0 },
      isLiked: false,
      isCollected: false,
      createdAt: new Date().toISOString().split('T')[0],
    };

    addPost(newPost);
    Alert.alert('发布成功', '您的食谱已发布到美食频道！', [
      { text: '好的', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={Theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>发布食谱</Text>
        <TouchableOpacity onPress={handlePublish}>
          <LinearGradient
            colors={Theme.colors.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.publishNavButton}
          >
            <Text style={styles.publishNavText}>发布</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>封面图标</Text>
          <View style={styles.emojiRow}>
            {EMOJI_OPTIONS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[styles.emojiOption, selectedEmoji === emoji && styles.emojiOptionActive]}
                onPress={() => setSelectedEmoji(emoji)}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>食谱标题</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="给你的食谱起个名字"
            placeholderTextColor={Theme.colors.text.light}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>食谱描述</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="介绍一下这道菜的特色和口感"
            placeholderTextColor={Theme.colors.text.light}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>分类</Text>
          <View style={styles.chipRow}>
            {CATEGORY_OPTIONS.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, category === cat && styles.chipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>难度</Text>
          <View style={styles.chipRow}>
            {DIFFICULTY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.chip, difficulty === opt.value && styles.chipActive]}
                onPress={() => setDifficulty(opt.value)}
              >
                <Text style={[styles.chipText, difficulty === opt.value && styles.chipTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.rowSection}>
          <View style={styles.halfSection}>
            <Text style={styles.sectionLabel}>烹饪时间(分钟)</Text>
            <TextInput
              style={styles.textInput}
              value={cookTime}
              onChangeText={setCookTime}
              placeholder="15"
              placeholderTextColor={Theme.colors.text.light}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfSection}>
            <Text style={styles.sectionLabel}>份量(人份)</Text>
            <TextInput
              style={styles.textInput}
              value={servings}
              onChangeText={setServings}
              placeholder="1"
              placeholderTextColor={Theme.colors.text.light}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>营养成分</Text>
          <View style={styles.nutritionInputs}>
            <View style={styles.nutritionInputItem}>
              <Text style={styles.nutritionInputLabel}>热量(千卡)</Text>
              <TextInput
                style={styles.nutritionInput}
                value={calories}
                onChangeText={setCalories}
                placeholder="0"
                placeholderTextColor={Theme.colors.text.light}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.nutritionInputItem}>
              <Text style={styles.nutritionInputLabel}>蛋白质(g)</Text>
              <TextInput
                style={styles.nutritionInput}
                value={protein}
                onChangeText={setProtein}
                placeholder="0"
                placeholderTextColor={Theme.colors.text.light}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.nutritionInputItem}>
              <Text style={styles.nutritionInputLabel}>碳水(g)</Text>
              <TextInput
                style={styles.nutritionInput}
                value={carbs}
                onChangeText={setCarbs}
                placeholder="0"
                placeholderTextColor={Theme.colors.text.light}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.nutritionInputItem}>
              <Text style={styles.nutritionInputLabel}>脂肪(g)</Text>
              <TextInput
                style={styles.nutritionInput}
                value={fat}
                onChangeText={setFat}
                placeholder="0"
                placeholderTextColor={Theme.colors.text.light}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>食材清单</Text>
          <View style={styles.ingredientInputRow}>
            <TextInput
              style={[styles.textInput, { flex: 1 }]}
              value={ingredientName}
              onChangeText={setIngredientName}
              placeholder="食材名称"
              placeholderTextColor={Theme.colors.text.light}
            />
            <TextInput
              style={[styles.textInput, { width: 80 }]}
              value={ingredientAmount}
              onChangeText={setIngredientAmount}
              placeholder="用量"
              placeholderTextColor={Theme.colors.text.light}
            />
            <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
              <Ionicons name="add-circle" size={32} color={Theme.colors.primary} />
            </TouchableOpacity>
          </View>
          {ingredients.map((item, index) => (
            <View key={index} style={styles.ingredientAdded}>
              <View style={styles.ingredientDot} />
              <Text style={styles.ingredientAddedName}>{item.name}</Text>
              <Text style={styles.ingredientAddedAmount}>{item.amount}</Text>
              <TouchableOpacity onPress={() => removeIngredient(index)}>
                <Ionicons name="close-circle" size={18} color={Theme.colors.text.light} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>烹饪步骤</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={stepText}
            onChangeText={setStepText}
            placeholder="描述这一步的操作"
            placeholderTextColor={Theme.colors.text.light}
            multiline
          />
          <TextInput
            style={[styles.textInput, { marginTop: 8 }]}
            value={stepTip}
            onChangeText={setStepTip}
            placeholder="小贴士（可选）"
            placeholderTextColor={Theme.colors.text.light}
          />
          <TouchableOpacity style={styles.addStepButton} onPress={addStep}>
            <Text style={styles.addStepText}>+ 添加步骤</Text>
          </TouchableOpacity>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepAdded}>
              <View style={styles.stepNumberSmall}>
                <Text style={styles.stepNumberSmallText}>{step.step}</Text>
              </View>
              <Text style={styles.stepAddedText} numberOfLines={2}>{step.description}</Text>
              <TouchableOpacity onPress={() => removeStep(index)}>
                <Ionicons name="close-circle" size={18} color={Theme.colors.text.light} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.publishButton} onPress={handlePublish} activeOpacity={0.8}>
          <LinearGradient
            colors={Theme.colors.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.publishGradient}
          >
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={styles.publishButtonText}>发布食谱</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5FA',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
  },
  publishNavButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: Theme.borderRadius.full,
  },
  publishNavText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '700',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
  },
  rowSection: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.xl,
    gap: Theme.spacing.md,
  },
  halfSection: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
  },
  sectionLabel: {
    fontSize: Theme.fontSize.md,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  textInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.primary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  emojiOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiOptionActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: '#F0F9F0',
  },
  emojiText: {
    fontSize: 24,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F5F7FA',
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: '#F0F9F0',
    borderColor: Theme.colors.primary,
  },
  chipText: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.secondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  nutritionInputs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
  },
  nutritionInputItem: {
    width: '47%',
  },
  nutritionInputLabel: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.text.tertiary,
    marginBottom: 6,
  },
  nutritionInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.primary,
  },
  ingredientInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ingredientAdded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5FA',
  },
  ingredientDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.primary,
  },
  ingredientAddedName: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.primary,
  },
  ingredientAddedAmount: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.text.tertiary,
    marginRight: Theme.spacing.sm,
  },
  addStepButton: {
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
  },
  addStepText: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  stepAdded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5FA',
  },
  stepNumberSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberSmallText: {
    fontSize: Theme.fontSize.xs,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepAddedText: {
    flex: 1,
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.text.primary,
  },
  publishButton: {
    marginHorizontal: Theme.spacing.xl,
    marginTop: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
  },
  publishGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: Theme.spacing.sm,
  },
  publishButtonText: {
    fontSize: Theme.fontSize.lg,
    fontWeight: 'bold',
    color: '#fff',
  },
});
