import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { CloudSync } from './src/components/CloudSync';
import { initSentry } from './src/services/sentryService';
import { useAppUpdate } from './src/hooks/useAppUpdate';
import { useAuthStore } from './src/store/authStore';

initSentry();

function AppContent() {
  useAppUpdate();
  const [ready, setReady] = useState(false);
  const loadAuth = useAuthStore((s) => s.loadAuth);

  useEffect(() => {
    loadAuth().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={splashStyles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={splashStyles.text}>健康星球</Text>
      </View>
    );
  }

  return (
    <CloudSync>
      <AppNavigator />
    </CloudSync>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AppContent />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    gap: 16,
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
});
