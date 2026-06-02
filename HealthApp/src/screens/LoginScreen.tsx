import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, borderRadius, spacing } from '../constants/theme';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';

type LoginTab = 'email' | 'phone';

type LoginNavigationProp = NativeStackNavigationProp<{
  MainTabs: undefined;
  Register: undefined;
}>;

const TABS: { key: LoginTab; label: string }[] = [
  { key: 'email', label: '邮箱登录' },
  { key: 'phone', label: '手机登录' },
];

export default function LoginScreen() {
  const navigation = useNavigation<LoginNavigationProp>();

  // Tab state
  const [activeTab, setActiveTab] = useState<LoginTab>('email');

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailLoggingIn, setIsEmailLoggingIn] = useState(false);

  // Phone form state
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [isPhoneLoggingIn, setIsPhoneLoggingIn] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startCountdown = useCallback(() => {
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSetActiveTab = useCallback((tab: LoginTab) => {
    setActiveTab(tab);
    Keyboard.dismiss();
  }, []);

  // ---- Email Login ----

  const handleEmailLogin = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert('提示', '请输入邮箱地址');
      return;
    }
    if (!password) {
      Alert.alert('提示', '请输入密码');
      return;
    }

    setIsEmailLoggingIn(true);
    try {
      const res = await api.auth.login({ email: trimmedEmail, password });
      if (res.success && res.data) {
        useAuthStore.getState().setAuth(res.data.user, {
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        });
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      } else {
        Alert.alert('登录失败', res.error || '邮箱或密码错误');
      }
    } catch {
      Alert.alert('登录失败', '网络异常，请稍后重试');
    } finally {
      setIsEmailLoggingIn(false);
    }
  }, [email, password, navigation]);

  // ---- Phone Login ----

  const handleSendSms = useCallback(async () => {
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      Alert.alert('提示', '请输入手机号码');
      return;
    }
    if (!/^1\d{10}$/.test(trimmedPhone)) {
      Alert.alert('提示', '请输入正确的11位手机号码');
      return;
    }

    setIsSendingSms(true);
    try {
      const res = await api.auth.sendSms({ phone: trimmedPhone });
      if (res.success) {
        startCountdown();
        Alert.alert('提示', '验证码已发送至您的手机');
      } else {
        Alert.alert('发送失败', res.error || '验证码发送失败，请稍后重试');
      }
    } catch {
      Alert.alert('发送失败', '网络异常，请稍后重试');
    } finally {
      setIsSendingSms(false);
    }
  }, [phone, startCountdown]);

  const handlePhoneLogin = useCallback(async () => {
    const trimmedPhone = phone.trim();
    const trimmedCode = smsCode.trim();
    if (!trimmedPhone) {
      Alert.alert('提示', '请输入手机号码');
      return;
    }
    if (!trimmedCode) {
      Alert.alert('提示', '请输入验证码');
      return;
    }

    setIsPhoneLoggingIn(true);
    try {
      const res = await api.auth.loginWithPhone({ phone: trimmedPhone, code: trimmedCode });
      if (res.success && res.data) {
        useAuthStore.getState().setAuth(res.data.user, {
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        });
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      } else {
        Alert.alert('登录失败', res.error || '验证码错误或已过期');
      }
    } catch {
      Alert.alert('登录失败', '网络异常，请稍后重试');
    } finally {
      setIsPhoneLoggingIn(false);
    }
  }, [phone, smsCode, navigation]);

  // ---- Render Helpers ----

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, isActive && styles.tabItemActive]}
            onPress={() => handleSetActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderEmailTab = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputGroup}>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="mail-outline"
            size={20}
            color={colors.textTertiary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="请输入邮箱地址"
            placeholderTextColor={colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={colors.textTertiary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="请输入密码"
            placeholderTextColor={colors.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            returnKeyType="done"
            onSubmitEditing={handleEmailLogin}
          />
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.eyeButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, isEmailLoggingIn && styles.buttonDisabled]}
        onPress={handleEmailLogin}
        disabled={isEmailLoggingIn}
        activeOpacity={0.8}
      >
        {isEmailLoggingIn ? (
          <ActivityIndicator color={colors.surface} size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>登录</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkRow}
        onPress={() => navigation.navigate('Register')}
        activeOpacity={0.7}
      >
        <Text style={styles.linkText}>还没有账号？</Text>
        <Text style={styles.linkTextAccent}>立即注册</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPhoneTab = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputGroup}>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="phone-portrait-outline"
            size={20}
            color={colors.textTertiary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="请输入手机号码"
            placeholderTextColor={colors.textTertiary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={11}
            returnKeyType="next"
          />
        </View>

        <View style={styles.smsRow}>
          <TextInput
            style={[styles.input, styles.smsInput]}
            placeholder="请输入验证码"
            placeholderTextColor={colors.textTertiary}
            value={smsCode}
            onChangeText={setSmsCode}
            keyboardType="number-pad"
            maxLength={6}
            returnKeyType="done"
            onSubmitEditing={handlePhoneLogin}
          />
          <TouchableOpacity
            style={[
              styles.smsButton,
              (countdown > 0 || isSendingSms) && styles.smsButtonDisabled,
            ]}
            onPress={handleSendSms}
            disabled={countdown > 0 || isSendingSms}
            activeOpacity={0.8}
          >
            {isSendingSms ? (
              <ActivityIndicator color={colors.surface} size="small" />
            ) : (
              <Text
                style={[
                  styles.smsButtonText,
                  countdown > 0 && styles.smsButtonTextDisabled,
                ]}
              >
                {countdown > 0 ? `${countdown}s` : '发送验证码'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, isPhoneLoggingIn && styles.buttonDisabled]}
        onPress={handlePhoneLogin}
        disabled={isPhoneLoggingIn}
        activeOpacity={0.8}
      >
        {isPhoneLoggingIn ? (
          <ActivityIndicator color={colors.surface} size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>登录</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // ---- Main Render ----

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="leaf-outline" size={36} color={colors.surface} />
              </View>
            </View>
            <Text style={styles.appName}>健康管理</Text>
            <Text style={styles.tagline}>记录每一天，健康更简单</Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            {renderTabBar()}

            <View style={styles.cardBody}>
              {activeTab === 'email' && renderEmailTab()}
              {activeTab === 'phone' && renderPhoneTab()}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },

  // ---- Header ----
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  appName: {
    ...typography.hero,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
  },

  // ---- Card ----
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },

  // ---- Tab Bar ----
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  tabItem: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: colors.primary,
    backgroundColor: colors.surface,
  },
  tabLabel: {
    ...typography.bodyBold,
    color: colors.textTertiary,
  },
  tabLabelActive: {
    color: colors.primary,
  },

  // ---- Card Body ----
  cardBody: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },

  // ---- Form ----
  formContainer: {
    gap: spacing.xxl,
  },
  inputGroup: {
    gap: spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    height: 50,
  },
  inputIcon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    height: '100%',
  },
  eyeButton: {
    paddingLeft: spacing.sm,
  },

  // ---- SMS Row ----
  smsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  smsInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    height: 50,
  },
  smsButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 110,
  },
  smsButtonDisabled: {
    backgroundColor: colors.primaryLight,
  },
  smsButtonText: {
    ...typography.bodyBold,
    color: colors.surface,
  },
  smsButtonTextDisabled: {
    color: colors.surface,
  },

  // ---- Primary Button ----
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    ...typography.bodyBold,
    color: colors.surface,
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },

  // ---- Link Row ----
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    ...typography.body,
    color: colors.textTertiary,
  },
  linkTextAccent: {
    ...typography.bodyBold,
    color: colors.primary,
    marginLeft: spacing.xs,
  },

});
