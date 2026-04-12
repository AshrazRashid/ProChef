import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  Dimensions
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { Colors } from '../constants/theme';
const { width } = Dimensions.get('window');

export const GoalSetupScreen = ({ navigation }: any) => {
  const [selectedGoal, setSelectedGoal] = useState('fat_loss');
  const goals = [
    { id: 'fat_loss', title: 'Fat Loss', icon: require('../assets/icons/drop.png') },
    { id: 'muscle_gain', title: 'Muscle Gain', icon: require('../assets/icons/dumbell.png') },
    { id: 'maintenance', title: 'Maintenance', icon: require('../assets/icons/maintenance.png') },
    { id: 'healthy_eating', title: 'Healthy Eating', icon: require('../assets/icons/eating.png') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={Colors.white} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goal Setup</Text>
        <Text style={styles.stepText}>Step 1 of 3</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '33%' }]} />
          </View>
        </View>
        {/* Intro */}
        <View style={styles.introContainer}>
          <Text style={styles.introTitle}>
            Tell us about <Text style={styles.introTitleAccent}>yourself</Text>.
          </Text>
          <Text style={styles.introSubtitle}>
            Your metrics help us calculate the perfect nutrition plan for your bioluminescent vitality.
          </Text>
        </View>
        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>CURRENT WEIGHT</Text>
            <View style={styles.metricValueContainer}>
              <Text style={styles.metricValue}>72</Text>
              <Text style={styles.metricUnit}>kg</Text>
            </View>
          </View>
          <View style={[styles.metricBox, styles.metricBoxActive]}>
            <Text style={styles.metricLabelActive}>TARGET WEIGHT</Text>
            <View style={styles.metricValueContainer}>
              <Text style={styles.metricValue}>68</Text>
              <Text style={styles.metricUnit}>lb</Text>
            </View>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>HEIGHT</Text>
            <View style={styles.metricValueContainer}>
              <Text style={styles.metricValue}>178</Text>
              <Text style={styles.metricUnit}>cm</Text>
            </View>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>AGE</Text>
            <View style={styles.metricValueContainer}>
              <Text style={styles.metricValue}>28</Text>
              <Text style={styles.metricUnit}>yrs</Text>
            </View>
          </View>
        </View>
        {/* Goal Selection */}
        <View style={styles.goalSection}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalSectionTitle}>Choose Primary Goal</Text>
            <Text style={styles.selectOneText}>SELECT ONE</Text>
          </View>
          <View style={styles.goalsGrid}>
            {goals.map((goal) => (
              <TouchableOpacity 
                key={goal.id}
                onPress={() => setSelectedGoal(goal.id)}
                style={[
                  styles.goalCard, 
                  selectedGoal === goal.id && styles.goalCardActive
                ]}
              >
                <Image 
                  source={goal.icon} 
                  style={[styles.goalIcon, { tintColor: selectedGoal === goal.id ? Colors.white : Colors.secondary }]} 
                  resizeMode="contain"
                />
                <Text style={styles.goalTitle}>{goal.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('AboutYourself')}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  stepText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  progressContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#1A1A1A',
    borderRadius: 2,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  introContainer: {
    marginBottom: 30,
  },
  introTitle: {
    color: Colors.white,
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 10,
  },
  introTitleAccent: {
    color: Colors.secondary,
  },
  introSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  metricBox: {
    width: (width - 64) / 2,
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  metricBoxActive: {
    borderColor: Colors.primary,
    backgroundColor: '#1A1A1A',
  },
  metricLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  metricLabelActive: {
    color: Colors.secondary,
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    color: Colors.white,
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginRight: 4,
  },
  metricUnit: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  goalSection: {
    marginBottom: 30,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  goalSectionTitle: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  selectOneText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  goalCard: {
    width: (width - 64) / 2,
    aspectRatio: 1.1,
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  goalCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  goalIcon: {
    width: 44, // Increased from 32
    height: 44, // Increased from 32
    marginBottom: 12,
  },
  goalTitle: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
});
