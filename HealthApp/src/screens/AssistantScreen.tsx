import React, { useState, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAudioRecorder, requestRecordingPermissionsAsync, setAudioModeAsync, RecordingPresets } from 'expo-audio';
import { useNavigation } from '@react-navigation/native';
import { useNutritionStore } from '../store/nutritionStore';
import { sendMessage, Message, UsageInfo } from '../services/aiAssistantService';
import { api } from '../services/api';
import { detectRegion } from '../config/env';
import { logger } from '../utils/logger';

export const AssistantScreen: React.FC = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '你好！我是你的AI健康助手。有什么关于饮食和运动的问题想问我吗？我可以帮你制定饮食计划、分析食物营养、推荐运动方案等。',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [totalUsage, setTotalUsage] = useState<UsageInfo>({ promptTokens: 0, completionTokens: 0, totalTokens: 0 });
  const MODEL_NAME = 'DeepSeek Chat';
  const scrollRef = useRef<ScrollView>(null);

  const user = useNutritionStore((s) => s.user);
  const dailyNutrition = useNutritionStore((s) => s.dailyNutrition);
  const calculateDailyGoals = useNutritionStore((s) => s.calculateDailyGoals);

  const userContext = useMemo(() => {
    if (!user) return null;
    const goals = calculateDailyGoals();
    return {
      goal: user.goal,
      activityLevel: user.activityLevel,
      dailyCalories: dailyNutrition.calories,
      dailyProtein: dailyNutrition.protein,
      dailyCarbs: dailyNutrition.carbs,
      dailyFat: dailyNutrition.fat,
      targetCalories: goals.calories,
      targetProtein: goals.protein,
      targetCarbs: goals.carbs,
      targetFat: goals.fat,
    };
  }, [user, dailyNutrition]);

  const quickQuestions = useMemo(() => {
    if (!user) {
      return ['今天我应该吃什么？', '如何快速减脂？', '运动前吃什么好？', '晚餐食谱推荐'];
    }
    switch (user.goal) {
      case 'lose':
        return ['今天怎么吃能控制热量？', '低卡饱腹的食物有哪些？', '减脂期运动计划', '晚上饿了怎么办？'];
      case 'gain':
        return ['增肌期怎么吃？', '高蛋白食物推荐', '训练后吃什么恢复快？', '增肌训练计划'];
      default:
        return ['今天均衡饮食怎么安排？', '蛋白质怎么补充够？', '一周运动计划', '健康零食推荐'];
    }
  }, [user]);

  const historyForApi = useMemo(
    () => messages.slice(0, -1).map(m => ({ role: m.role, content: m.content }) as Message),
    [messages],
  );

  const handleSend = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    // 检查 AI 对话次数限制
    const region = detectRegion();
    const usageRes = await api.usage.increment('ai_chat_per_day', region);
    if (!usageRes.success) {
      setMessages(prev => [...prev,
        { role: 'user' as const, content: trimmed },
        { role: 'assistant' as const, content: '😅 今日 AI 对话次数已达上限，明天再来吧！开通会员可享无限次对话。' },
      ]);
      setInputText('');
      return;
    }

    const userMessage: Message = { role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    const reply = await sendMessage(trimmed, historyForApi, userContext);
    const assistantMessage: Message = { role: 'assistant', content: reply.content };
    setMessages(prev => {
      const updated = [...prev, assistantMessage];
      return updated.length > 22 ? updated.slice(-22) : updated;
    });
    if (reply.usage) {
      setTotalUsage(prev => ({
        promptTokens: prev.promptTokens + reply.usage!.promptTokens,
        completionTokens: prev.completionTokens + reply.usage!.completionTokens,
        totalTokens: prev.totalTokens + reply.usage!.totalTokens,
      }));
    }
    setIsLoading(false);
  }, [isLoading, historyForApi, userContext]);

  const handleQuickQuestion = (question: string) => {
    handleSend(question);
  };

  // ── Voice Recording ──

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const startRecording = async () => {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) return;

      await setAudioModeAsync({ allowsRecording: true });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
    } catch (err) {
      logger.warn('Failed to start recording:', err);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      await audioRecorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
      const uri = audioRecorder.uri;

      if (uri) {
        handleSend('请分析我的运动情况');
      }
    } catch (err) {
      logger.warn('Failed to stop recording:', err);
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>AI健康助手</Text>
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>在线</Text>
            </View>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd()}
        >
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageContainer,
                message.role === 'user' ? styles.userMessage : styles.assistantMessage,
              ]}
            >
              {message.role === 'assistant' && (
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Ionicons name="medical" size={20} color="#fff" />
                  </View>
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.role === 'user' && styles.userMessageText,
                  ]}
                >
                  {message.content}
                </Text>
              </View>
            </View>
          ))}
          {isLoading && (
            <View style={[styles.messageContainer, styles.assistantMessage]}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Ionicons name="medical" size={20} color="#fff" />
                </View>
              </View>
              <View style={[styles.messageBubble, styles.assistantBubble]}>
                <View style={styles.typingIndicator}>
                  <View style={[styles.typingDot, styles.typingDot1]} />
                  <View style={[styles.typingDot, styles.typingDot2]} />
                  <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.quickQuestions}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {quickQuestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickQuestionChip, isLoading && styles.quickQuestionChipDisabled]}
                onPress={() => handleQuickQuestion(question)}
                disabled={isLoading}
              >
                <Text style={styles.quickQuestionText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.infoBar}>
          <Text style={styles.infoBarText}>
            {MODEL_NAME} · 本对话 Tokens: {totalUsage.totalTokens.toLocaleString()}
            {'  '}上下文: {messages.length} 条
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={[styles.micButton, isRecording && styles.micButtonActive]}
            onPress={toggleRecording}
          >
            <Ionicons
              name={isRecording ? 'mic' : 'mic-outline'}
              size={24}
              color={isRecording ? '#fff' : '#666'}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="输入您的问题..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={() => handleSend(inputText)}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  onlineText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  userMessageText: {
    color: '#fff',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.6,
  },
  typingDot3: {
    opacity: 0.8,
  },
  quickQuestions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  quickQuestionChip: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginRight: 10,
  },
  quickQuestionChipDisabled: {
    opacity: 0.5,
  },
  quickQuestionText: {
    fontSize: 14,
    color: '#666',
  },
  infoBar: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  infoBarText: {
    fontSize: 12,
    color: '#8888aa',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonActive: {
    backgroundColor: '#FF5722',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});
