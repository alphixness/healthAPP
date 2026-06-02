import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, TextInput, FlatList, Modal, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useNutritionStore, FoodLog } from '../store/nutritionStore';
import { searchFoods, FoodItem } from '../store/foodDatabase';
import { foodRecognitionEngine } from '../services/foodRecognitionService';
import { api } from '../services/api';
import { ENV, detectRegion } from '../config/env';

interface RecognizedFood {
  food: FoodItem;
  quantity: number;
}

const MEAL_TYPES = [
  { key: 'breakfast' as const, label: '早餐', icon: '🌅' },
  { key: 'lunch' as const, label: '午餐', icon: '☀️' },
  { key: 'dinner' as const, label: '晚餐', icon: '🌙' },
  { key: 'snack' as const, label: '零食', icon: '🍿' },
];

const QUICK_AMOUNTS = [50, 100, 150, 200, 300];

export const CameraScreen: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recognizedFoods, setRecognizedFoods] = useState<RecognizedFood[]>([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>(() => {
    const hour = new Date().getHours();
    if (hour < 10) return 'breakfast';
    if (hour < 14) return 'lunch';
    if (hour < 18) return 'snack';
    return 'dinner';
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const successOpacity = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef<CameraView>(null);
  const navigation = useNavigation();
  const addMealRecord = useNutritionStore((state) => state.addMealRecord);

  useEffect(() => {
    if (showSuccess) {
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      const timer = setTimeout(() => {
        navigation.goBack();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const analyzeFood = async (imageData: string, userInput?: string) => {
    setIsAnalyzing(true);

    try {
      // 检查食物识别次数限制
      const region = detectRegion();
      const usageRes = await api.usage.increment('food_scans_per_day', region);
      if (!usageRes.success) {
        Alert.alert('今日次数已达上限', '开通会员可享无限次食物识别。');
        setIsAnalyzing(false);
        return;
      }

      const response = await foodRecognitionEngine.recognizeFood(imageData, userInput);

      if (response.source === 'empty') {
        if (ENV.IS_MOCK_MODE) {
          Alert.alert(
            '需要配置 API 密钥',
            '请在 .env 文件中设置 EXPO_PUBLIC_OPENAI_API_KEY 或 EXPO_PUBLIC_BAIDU_API_KEY + EXPO_PUBLIC_BAIDU_SECRET_KEY，或在输入框中手动输入食物名称。',
            [{ text: '知道了' }],
          );
        } else {
          Alert.alert('未识别到食物', '请重新拍照，确保食物清晰可见');
        }
        setIsAnalyzing(false);
        return;
      }

      const foods: RecognizedFood[] = response.results.map(result => ({
        food: result.food,
        quantity: result.food.servingSize.default,
      }));

      setRecognizedFoods(foods);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '食物识别出错，请重试';
      Alert.alert('识别失败', message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.4 });
        if (photo) {
          setImageUri(photo.uri);
          await analyzeFood(photo.base64 || photo.uri);
        }
      } catch (error) {
        Alert.alert('拍照失败', '请重试');
      }
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.3,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      await analyzeFood(asset.base64 || asset.uri);
    }
  };

  const handleRetake = () => {
    setImageUri(null);
    setRecognizedFoods([]);
    setShowSuccess(false);
  };

  const handleConfirm = () => {
    const today = new Date().toISOString().split('T')[0];

    const foodLogs: FoodLog[] = recognizedFoods.map((item, index) => ({
      id: `${Date.now()}-${index}`,
      foodName: item.food.name,
      quantity: item.quantity,
      calories: Math.round(item.food.nutrition.calories * item.quantity / 100),
      protein: Math.round(item.food.nutrition.protein * item.quantity / 100 * 10) / 10,
      carbs: Math.round(item.food.nutrition.carbs * item.quantity / 100 * 10) / 10,
      fat: Math.round(item.food.nutrition.fat * item.quantity / 100 * 10) / 10,
      imageUrl: imageUri || undefined,
      createdAt: new Date().toISOString(),
    }));

    const newRecord = {
      id: `meal-${Date.now()}`,
      userId: 'user-1',
      recordDate: today,
      mealType,
      foods: foodLogs,
    };

    addMealRecord(newRecord);
    setShowSuccess(true);
  };

  const handleAddFood = (food: FoodItem) => {
    setRecognizedFoods([...recognizedFoods, { food, quantity: food.servingSize.default }]);
    setShowSearchModal(false);
    setSearchQuery('');
  };

  const handleRemoveFood = (index: number) => {
    const newFoods = recognizedFoods.filter((_, i) => i !== index);
    setRecognizedFoods(newFoods);
  };

  const handleStartEditQuantity = (index: number) => {
    setEditingIndex(index);
    setEditQuantity(String(recognizedFoods[index].quantity));
  };

  const handleConfirmQuantity = () => {
    if (editingIndex === null) return;
    const qty = parseInt(editQuantity, 10);
    if (isNaN(qty) || qty <= 0) return;
    const newFoods = recognizedFoods.map((item, i) =>
      i === editingIndex ? { ...item, quantity: qty } : item
    );
    setRecognizedFoods(newFoods);
    setEditingIndex(null);
  };

  const getTotalNutrition = () => {
    return recognizedFoods.reduce(
      (acc, item) => ({
        calories: acc.calories + Math.round(item.food.nutrition.calories * item.quantity / 100),
        protein: acc.protein + Math.round(item.food.nutrition.protein * item.quantity / 100 * 10) / 10,
        carbs: acc.carbs + Math.round(item.food.nutrition.carbs * item.quantity / 100 * 10) / 10,
        fat: acc.fat + Math.round(item.food.nutrition.fat * item.quantity / 100 * 10) / 10,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  if (showSuccess) {
    return (
      <View style={styles.successContainer}>
        <Animated.View style={[styles.successContent, { opacity: successOpacity }]}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={48} color="#fff" />
          </View>
          <Text style={styles.successTitle}>已添加到记录</Text>
          <Text style={styles.successSubtitle}>
            {MEAL_TYPES.find(m => m.key === mealType)?.icon} {MEAL_TYPES.find(m => m.key === mealType)?.label} · {getTotalNutrition().calories}千卡
          </Text>
        </Animated.View>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="camera-outline" size={64} color="#ccc" />
        <Text style={styles.permissionText}>需要相机权限才能拍照识别食物</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>授权相机权限</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (imageUri) {
    const total = getTotalNutrition();

    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          <View style={styles.resultContainer}>
            {/* Meal Type Selector */}
            <View style={styles.mealTypeRow}>
              {MEAL_TYPES.map((mt) => (
                <TouchableOpacity
                  key={mt.key}
                  style={[styles.mealTypeChip, mealType === mt.key && styles.mealTypeChipActive]}
                  onPress={() => setMealType(mt.key)}
                >
                  <Text style={styles.mealTypeChipIcon}>{mt.icon}</Text>
                  <Text style={[styles.mealTypeChipLabel, mealType === mt.key && styles.mealTypeChipLabelActive]}>
                    {mt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {isAnalyzing ? (
              <View style={styles.analyzingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.analyzingText}>
                  {ENV.IS_MOCK_MODE ? '手动模式 — 请输入食物名称搜索' : 'AI 正在识别食物...'}
                </Text>
                <Text style={styles.analyzingSubText}>
                  {ENV.IS_MOCK_MODE
                    ? '配置 API Key 后可启用拍照自动识别'
                    : '使用百度 AI 菜品识别分析中'}
                </Text>
              </View>
            ) : recognizedFoods.length === 0 ? (
              <View style={styles.analyzingContainer}>
                <Ionicons name="scan-outline" size={48} color="#ccc" />
                <Text style={styles.analyzingText}>拍照或从相册选择图片</Text>
                <Text style={styles.analyzingSubText}>自动识别食物并分析营养成分</Text>
              </View>
            ) : (
              <>
                {recognizedFoods.map((item, index) => (
                  <View key={index} style={styles.foodCard}>
                    <View style={styles.foodHeader}>
                      <View style={styles.foodTitleRow}>
                        <Text style={styles.foodIcon}>{item.food.icon}</Text>
                        <Text style={styles.foodName}>{item.food.name}</Text>
                        {item.food.id.startsWith('api-') && (
                          <View style={styles.estBadge}>
                            <Text style={styles.estBadgeText}>估算</Text>
                          </View>
                        )}
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveFood(index)}>
                        <Ionicons name="close-circle" size={24} color="#999" />
                      </TouchableOpacity>
                    </View>

                    {/* Editable Quantity */}
                    <TouchableOpacity style={styles.quantityRow} onPress={() => handleStartEditQuantity(index)}>
                      <Ionicons name="scale-outline" size={16} color="#666" />
                      <Text style={styles.quantityLabel}>份量 </Text>
                      <Text style={styles.quantityValue}>{item.quantity}g</Text>
                      <Ionicons name="chevron-forward" size={14} color="#aaa" />
                    </TouchableOpacity>

                    <View style={styles.nutrientBar}>
                      <View style={[styles.nutrientChip, { backgroundColor: '#FFF3E0' }]}>
                        <Text style={[styles.nutrientChipValue, { color: '#E65100' }]}>
                          {Math.round(item.food.nutrition.calories * item.quantity / 100)}
                        </Text>
                        <Text style={[styles.nutrientChipLabel, { color: '#E65100' }]}>千卡</Text>
                      </View>
                      <View style={[styles.nutrientChip, { backgroundColor: '#E8F5E9' }]}>
                        <Text style={[styles.nutrientChipValue, { color: '#2E7D32' }]}>
                          {Math.round(item.food.nutrition.protein * item.quantity / 100 * 10) / 10}g
                        </Text>
                        <Text style={[styles.nutrientChipLabel, { color: '#2E7D32' }]}>蛋白质</Text>
                      </View>
                      <View style={[styles.nutrientChip, { backgroundColor: '#E3F2FD' }]}>
                        <Text style={[styles.nutrientChipValue, { color: '#1565C0' }]}>
                          {Math.round(item.food.nutrition.carbs * item.quantity / 100 * 10) / 10}g
                        </Text>
                        <Text style={[styles.nutrientChipLabel, { color: '#1565C0' }]}>碳水</Text>
                      </View>
                      <View style={[styles.nutrientChip, { backgroundColor: '#FCE4EC' }]}>
                        <Text style={[styles.nutrientChipValue, { color: '#C62828' }]}>
                          {Math.round(item.food.nutrition.fat * item.quantity / 100 * 10) / 10}g
                        </Text>
                        <Text style={[styles.nutrientChipLabel, { color: '#C62828' }]}>脂肪</Text>
                      </View>
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.addFoodButton}
                  onPress={() => setShowSearchModal(true)}
                >
                  <Ionicons name="add-circle" size={24} color="#4CAF50" />
                  <Text style={styles.addFoodText}>添加更多食物</Text>
                </TouchableOpacity>

                <View style={styles.totalCard}>
                  <Text style={styles.totalTitle}>总计</Text>
                  <Text style={styles.totalCalories}>{total.calories}</Text>
                  <Text style={styles.totalUnit}>千卡</Text>
                  <View style={styles.totalMacros}>
                    <View style={styles.totalMacroItem}>
                      <Text style={styles.totalMacroValue}>{total.protein}g</Text>
                      <Text style={styles.totalMacroLabel}>蛋白质</Text>
                    </View>
                    <View style={styles.totalMacroDivider} />
                    <View style={styles.totalMacroItem}>
                      <Text style={styles.totalMacroValue}>{total.carbs}g</Text>
                      <Text style={styles.totalMacroLabel}>碳水</Text>
                    </View>
                    <View style={styles.totalMacroDivider} />
                    <View style={styles.totalMacroItem}>
                      <Text style={styles.totalMacroValue}>{total.fat}g</Text>
                      <Text style={styles.totalMacroLabel}>脂肪</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
                    <Ionicons name="refresh" size={20} color="#666" />
                    <Text style={styles.retakeText}>重新拍摄</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.confirmText}>添加到记录</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </ScrollView>

        {/* Quantity Edit Modal */}
        <Modal visible={editingIndex !== null} transparent animationType="fade">
          <TouchableOpacity style={styles.qtyOverlay} activeOpacity={1} onPress={() => setEditingIndex(null)}>
            <View style={styles.qtyModal}>
              <Text style={styles.qtyTitle}>调整份量</Text>
              {editingIndex !== null && (
                <Text style={styles.qtyFoodName}>
                  {recognizedFoods[editingIndex]?.food.icon} {recognizedFoods[editingIndex]?.food.name}
                </Text>
              )}
              <View style={styles.qtyInputRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setEditQuantity(String(Math.max(10, parseInt(editQuantity || '0', 10) - 10)))}
                >
                  <Ionicons name="remove" size={24} color="#333" />
                </TouchableOpacity>
                <TextInput
                  style={styles.qtyInput}
                  value={editQuantity}
                  onChangeText={setEditQuantity}
                  keyboardType="number-pad"
                  selectTextOnFocus
                />
                <Text style={styles.qtyUnit}>g</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setEditQuantity(String(parseInt(editQuantity || '0', 10) + 10))}
                >
                  <Ionicons name="add" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <View style={styles.qtyQuickRow}>
                {QUICK_AMOUNTS.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.qtyQuickBtn, parseInt(editQuantity || '0', 10) === amt && styles.qtyQuickBtnActive]}
                    onPress={() => setEditQuantity(String(amt))}
                  >
                    <Text style={[styles.qtyQuickText, parseInt(editQuantity || '0', 10) === amt && styles.qtyQuickTextActive]}>
                      {amt}g
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.qtyConfirmBtn} onPress={handleConfirmQuantity}>
                <Text style={styles.qtyConfirmText}>确定</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Food Search Modal */}
        <Modal
          visible={showSearchModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>搜索食物</Text>
              <TouchableOpacity onPress={() => setShowSearchModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="搜索食物名称..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />

            <FlatList
              data={searchQuery ? searchFoods(searchQuery) : []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchResultItem}
                  onPress={() => handleAddFood(item)}
                >
                  <Text style={styles.searchResultIcon}>{item.icon}</Text>
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultName}>{item.name}</Text>
                    <Text style={styles.searchResultDetail}>
                      {item.nutrition.calories}千卡/100g · {item.servingSize.description}
                    </Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={22} color="#4CAF50" />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {searchQuery ? '未找到相关食物' : '输入食物名称搜索'}
                </Text>
              }
            />
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      >
        <View style={styles.cameraOverlay}>
          <View style={styles.scanFrame} />
        </View>

        <View style={styles.cameraControls}>
          <TouchableOpacity style={styles.galleryButton} onPress={handlePickImage}>
            <Ionicons name="images" size={28} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureButton} onPress={handleTakePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <View style={styles.placeholder} />
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  permissionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scanFrame: {
    width: 280,
    height: 280,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
  },
  placeholder: {
    width: 50,
    height: 50,
  },
  resultContainer: {
    flex: 1,
    padding: 20,
  },
  mealTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  mealTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 4,
  },
  mealTypeChipActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  mealTypeChipIcon: {
    fontSize: 14,
  },
  mealTypeChipLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  mealTypeChipLabelActive: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  analyzingContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 20,
  },
  analyzingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  analyzingSubText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  foodCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  foodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  estBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  estBadgeText: {
    fontSize: 10,
    color: '#E65100',
    fontWeight: '700',
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 4,
  },
  quantityLabel: {
    fontSize: 13,
    color: '#666',
  },
  quantityValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginRight: 4,
  },
  nutrientBar: {
    flexDirection: 'row',
    gap: 8,
  },
  nutrientChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  nutrientChipValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  nutrientChipLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  addFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  addFoodText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 8,
  },
  totalCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 24,
    marginVertical: 16,
    alignItems: 'center',
  },
  totalTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  totalCalories: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalUnit: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  totalMacros: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
  },
  totalMacroItem: {
    flex: 1,
    alignItems: 'center',
  },
  totalMacroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  totalMacroLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  totalMacroDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  retakeText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    gap: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#4CAF50',
  },
  // Quantity Modal
  qtyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  qtyModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  qtyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  qtyFoodName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  qtyInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyInput: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    minWidth: 80,
    paddingVertical: 4,
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  qtyUnit: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  qtyQuickRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  qtyQuickBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  qtyQuickBtnActive: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  qtyQuickText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  qtyQuickTextActive: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  qtyConfirmBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 24,
  },
  qtyConfirmText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },
  // Search Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  searchInput: {
    margin: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  searchResultDetail: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
});
