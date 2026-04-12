import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  Image,
  PanResponder,
  Animated
} from 'react-native';
import { Colors } from '../constants/theme';
const { width } = Dimensions.get('window');

export const AboutYourselfScreen = ({ navigation }: any) => {
  const [gender, setGender] = useState('female');
  const [age, setAge] = useState(28);
  const [weight, setWeight] = useState(72.5);
  const [height, setHeight] = useState(178);
  // Height Slider Animation/Logic
  const sliderWidth = width - 108; // Padding and margins
  const heightAnim = useRef(new Animated.Value((178 - 140) / (220 - 140) * sliderWidth)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        let newX = gestureState.moveX - 54; // Adjust for left padding
        if (newX < 0) newX = 0;
        if (newX > sliderWidth) newX = sliderWidth;
        heightAnim.setValue(newX);
        const newHeightReached = Math.round(140 + (newX / sliderWidth) * (220 - 140));
        setHeight(newHeightReached);
      },
    })
  ).current;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>About yourself</Text>
          <Text style={styles.percentageText}>66%</Text>
        </View>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '66%' }]} />
          </View>
        </View>
        <Text style={styles.subtitle}>Help us calculate your perfect nutrition plan.</Text>
        {/* Weight Picker UI (Scrollable Ruler) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>WEIGHT</Text>
            <Text style={styles.sectionValue}>{weight.toFixed(1)} <Text style={styles.sectionUnit}>lb</Text></Text>
          </View>
          <View style={styles.weightPickerContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              snapToInterval={10}
              onScroll={(e) => {
                const offset = e.nativeEvent.contentOffset.x;
                const newWeight = 40 + (offset / 10); // Start from 40lb
                setWeight(newWeight);
              }}
              scrollEventThrottle={16}
            >
              <View style={styles.rulerContainer}>
                {[...Array(200)].map((_, i) => (
                  <View 
                    key={i} 
                    style={[
                      styles.rulerLine, 
                      i % 10 === 0 ? styles.rulerLineLong : styles.rulerLineShort
                    ]} 
                  />
                ))}
              </View>
            </ScrollView>
            <View style={styles.centerIndicator} />
          </View>
        </View>
        {/* Height Slider UI (Functional) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>HEIGHT</Text>
            <Text style={styles.sectionValue}>{height} <Text style={styles.sectionUnit}>cm</Text></Text>
          </View>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack} {...panResponder.panHandlers}>
              <Animated.View style={[styles.sliderFill, { width: heightAnim }]} />
              <Animated.View style={[styles.sliderThumb, { transform: [{ translateX: heightAnim }] }]} />
            </View>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>140 CM</Text>
              <Text style={styles.sliderLabel}>180 CM</Text>
              <Text style={styles.sliderLabel}>220 CM</Text>
            </View>
          </View>
        </View>
        {/* Age & Gender Row */}
        <View style={styles.row}>
          {/* Age Picker */}
          <View style={styles.ageCard}>
            <Text style={styles.smallSectionTitle}>AGE</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity 
                style={styles.counterButton}
                onPress={() => setAge(Math.max(1, age - 1))}
              >
                <Text style={styles.counterButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.ageValue}>{age}</Text>
              <TouchableOpacity 
                style={styles.counterButton}
                onPress={() => setAge(age + 1)}
              >
                <Text style={styles.counterButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Gender Picker */}
          <View style={styles.genderCard}>
            <Text style={styles.smallSectionTitle}>GENDER</Text>
            <TouchableOpacity 
              style={styles.genderOption}
              onPress={() => setGender('female')}
            >
              <View style={styles.genderIconContainer}>
                <Image 
                  source={require('../assets/icons/female.png')} 
                  style={[styles.genderIcon]} 
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>Female</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.genderOption}
              onPress={() => setGender('male')}
            >
              <View style={styles.genderIconContainer}>
                <Image 
                  source={require('../assets/icons/male.png')} 
                  style={[styles.genderIcon]} 
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>Male</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('DietCustomization')}
        >
          <Text style={styles.primaryButtonText}>Save</Text>
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  percentageText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#1A1A1A',
    borderRadius: 3,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 40,
  },
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    letterSpacing: 1,
  },
  sectionValue: {
    color: Colors.secondary,
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    minWidth: 100,
    textAlign: 'right',
  },
  sectionUnit: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  weightPickerContainer: {
    height: 120,
    backgroundColor: '#1A1A1A',
    borderRadius: 60,
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  rulerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: width / 2 - 30,
    height: '100%',
    paddingBottom: 20,
  },
  rulerLine: {
    width: 2,
    backgroundColor: '#333',
    marginHorizontal: 4,
  },
  rulerLineLong: {
    height: 40,
    backgroundColor: '#4D4D4D',
  },
  rulerLineShort: {
    height: 20,
  },
  centerIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    width: 2,
    height: 80,
    backgroundColor: Colors.secondary,
    zIndex: 10,
  },
  sliderContainer: {
    height: 100,
    backgroundColor: '#1A1A1A',
    borderRadius: 50,
    paddingHorizontal: 30,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  sliderTrack: {
    height: 40, // Larger hit area
    justifyContent: 'center',
  },
  sliderFill: {
    height: 8,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  sliderThumb: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    borderWidth: 4,
    borderColor: Colors.accent,
    marginLeft: -16,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  sliderLabel: {
    color: '#4D4D4D',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  ageCard: {
    width: (width - 64) / 1.8,
    backgroundColor: '#1A1A1A',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  genderCard: {
    width: (width - 64) / 2.5,
    backgroundColor: '#1A1A1A',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  smallSectionTitle: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    letterSpacing: 1,
    marginBottom: 20,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    color: Colors.white,
    fontSize: 24,
    fontFamily: 'Inter-Medium',
  },
  ageValue: {
    color: Colors.white,
    fontSize: 32,
    fontFamily: 'Inter-Bold',
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  genderIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  genderIcon: {
    width: '100%',
    height: '100%',
    tintColor: Colors.secondary,
  },
  genderText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  genderTextActive: {
    color: Colors.secondary,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
});
