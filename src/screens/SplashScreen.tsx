import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../constants/theme';
import { ChefHat } from 'lucide-react-native';

export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.9);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconContainer}>
          <ChefHat color={Colors.white} size={64} fill={Colors.white} />
        </View>
        <Text style={styles.logoText}>ProChef<Text style={styles.logoAccent}>AI</Text></Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  logoText: {
    color: Colors.white,
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    letterSpacing: -1,
  },
  logoAccent: {
    backgroundColor: Colors.white,
    color: Colors.background,
    paddingHorizontal: 6,
    marginLeft: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
