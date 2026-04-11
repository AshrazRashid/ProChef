import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import * as SplashScreenLib from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { SplashScreen } from './src/screens/SplashScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { Colors } from './src/constants/theme';

// Keep the splash screen visible while we fetch resources
SplashScreenLib.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Inter-ExtraBold': Inter_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      setAppIsReady(true);
      SplashScreenLib.hideAsync();
    }
  }, [fontsLoaded]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
        <WelcomeScreen />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
