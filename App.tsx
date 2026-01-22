import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppNavigator } from './src/navigation';
import { useAuthStore, usePlayerStatsStore } from './src/store';
import { colors, typography } from './src/utils/theme';
import './src/i18n';

// Loading Screen Component
const LoadingScreen: React.FC = () => (
  <View style={styles.loadingContainer}>
    <LinearGradient colors={colors.gradients.ocean} style={styles.loadingGradient}>
      <Text style={styles.loadingLogo}>🦐</Text>
      <Text style={styles.loadingTitle}>SeaFood Quest</Text>
      <ActivityIndicator color={colors.neutral.white} size="large" style={styles.spinner} />
    </LinearGradient>
  </View>
);

// Main App Component
export default function App() {
  const [isReady, setIsReady] = useState(false);
  const restaurant = useAuthStore((state) => state.restaurant);
  const initializeStats = usePlayerStatsStore((state) => state.initializeStats);

  useEffect(() => {
    // Simulate app initialization
    const initializeApp = async () => {
      // Wait for stores to hydrate
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Initialize player stats if authenticated
      if (restaurant?.id) {
        initializeStats(restaurant.id);
      }

      setIsReady(true);
    };

    initializeApp();
  }, [restaurant?.id]);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogo: {
    fontSize: 80,
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '700',
    color: colors.neutral.white,
    marginBottom: 32,
  },
  spinner: {
    marginTop: 16,
  },
});
