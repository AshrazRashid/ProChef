import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScanLine, BrainCircuit, ChevronRight } from 'lucide-react-native';
import { Colors } from '../constants/theme';
import { FeatureItem } from '../components/FeatureItem';

const { width } = Dimensions.get('window');

export const WelcomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>ProChef<Text style={styles.logoAccent}>AI</Text></Text>
        </View>

        {/* Hero Visual Block */}
        <View style={styles.heroContainer}>
          <LinearGradient
            colors={['#1a1a1a', '#0d0d0d']}
            style={styles.heroBackground}
          />
          <View style={styles.gridOverlay}>
            {/* Minimalist Grid Pattern */}
            {[...Array(6)].map((_, i) => (
              <View key={`v-${i}`} style={[styles.gridLine, { left: (width * 0.8 / 5) * i }]} />
            ))}
            {[...Array(6)].map((_, i) => (
              <View key={`h-${i}`} style={[styles.gridLineH, { top: (200 / 5) * i }]} />
            ))}
            <ScanLine color="#426D45" size={48} strokeWidth={1} style={styles.scanIcon} />
          </View>
        </View>

        {/* Headline */}
        <View style={styles.headlineContainer}>
          <Text style={styles.headline}>
            Scan. Cook. <Text style={styles.headlineAccent}>Eat Smart.</Text>
          </Text>
          <Text style={styles.subheadline}>
            AI-powered meal planning that starts with what you already have.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresList}>
          <FeatureItem
            icon={<ScanLine color={Colors.white} size={24} />}
            title="Ingredient Scanning"
            description="Instant recognition of labels and produce."
          />
          <FeatureItem
            icon={<BrainCircuit color={Colors.white} size={24} />}
            title="Nutrition AI"
            description="Personalized macros based on your goals."
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    color: Colors.white,
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    letterSpacing: -1,
  },
  logoAccent: {
    backgroundColor: Colors.white,
    color: Colors.background,
    paddingHorizontal: 4,
    marginLeft: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  heroContainer: {
    height: 220,
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  gridOverlay: {
    width: '80%',
    height: '70%',
    position: 'relative',
    borderWidth: 0.5,
    borderColor: 'rgba(66, 109, 69, 0.3)',
  },
  gridLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 0.5,
    backgroundColor: 'rgba(66, 109, 69, 0.2)',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: 'rgba(66, 109, 69, 0.2)',
  },
  scanIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    opacity: 0.8,
  },
  headlineContainer: {
    marginTop: 24,
  },
  headline: {
    color: Colors.white,
    fontSize: 32,
    fontFamily: 'Inter-ExtraBold',
    textAlign: 'center',
    lineHeight: 40,
  },
  headlineAccent: {
    color: Colors.secondary,
  },
  subheadline: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  featuresList: {
    marginTop: 30,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
});
