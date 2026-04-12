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
import { ChevronLeft, AlertCircle } from 'lucide-react-native';
import { Colors } from '../constants/theme';
const { width } = Dimensions.get('window');

export const DietCustomizationScreen = ({ navigation }: any) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['high_protein']);
  const [restrictions, setRestrictions] = useState<string[]>(['lactose_free']);
  const [allergies, setAllergies] = useState<string[]>([]);
  const dietGoals = [
    { id: 'high_protein', title: 'High Protein', desc: 'Supports muscle growth', icon: require('../assets/icons/protien.png') },
    { id: 'low_calorie', title: 'Low Calorie', desc: 'Weight management', icon: require('../assets/icons/calories.png') },
    { id: 'low_carb', title: 'Low Carb / Keto', desc: 'Fat burning focus', icon: require('../assets/icons/organic.png') },
    { id: 'balanced', title: 'Balanced Diet', desc: 'Sustained energy', icon: require('../assets/icons/creation.png') },
    { id: 'vegan', title: 'Vegan', desc: 'Plant-based only', icon: require('../assets/icons/vegan.png') },
    { id: 'vegetarian', title: 'Vegetarian', desc: 'No meat products', icon: require('../assets/icons/vegetarian.png') },
  ];
  const toggleGoal = (id: string) => {
    if (selectedGoals.includes(id)) {
      setSelectedGoals(selectedGoals.filter(g => g !== id));
    } else {
      setSelectedGoals([...selectedGoals, id]);
    }
  };
  const toggleRestriction = (id: string) => {
    if (restrictions.includes(id)) {
      setRestrictions(restrictions.filter(r => r !== id));
    } else {
      setRestrictions([...restrictions, id]);
    }
  };
  const toggleAllergy = (id: string) => {
    if (allergies.includes(id)) {
      setAllergies(allergies.filter(a => a !== id));
    } else {
      setAllergies([...allergies, id]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={Colors.white} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diet Customization</Text>
        <Text style={styles.stepText}>Step 2 of 3</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.introContainer}>
          <Text style={styles.introTitle}>Customize Your Diet</Text>
          <Text style={styles.introSubtitle}>We'll tailor meals to your needs</Text>
        </View>
        {/* Diet Goals */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>DIET GOALS</Text>
          <Text style={styles.selectText}>SELECT ALL THAT APPLY</Text>
        </View>
        <View style={styles.goalsGrid}>
          {dietGoals.map((goal) => (
            <TouchableOpacity 
              key={goal.id}
              onPress={() => toggleGoal(goal.id)}
              style={[
                styles.goalCard, 
                selectedGoals.includes(goal.id) && styles.goalCardActive
              ]}
            >
              <Image 
                source={goal.icon} 
                style={[styles.goalIcon, { tintColor: selectedGoals.includes(goal.id) ? Colors.white : Colors.secondary }]} 
                resizeMode="contain"
              />
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalDesc}>{goal.desc}</Text>
              {selectedGoals.includes(goal.id) && (
                <View style={styles.checkCircle}>
                  <Image source={require('../assets/icons/tick.png')} style={styles.checkIcon} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
        {/* Dietary Restrictions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>DIETARY RESTRICTIONS</Text>
        </View>
        <View style={styles.tagGrid}>
          {['Gluten-Free', 'Lactose-Free', 'Dairy-Free', 'Halal', 'No Sugar'].map((tag) => {
            const id = tag.toLowerCase().replace(' ', '_');
            const isActive = restrictions.includes(id);
          
  return (
              <TouchableOpacity 
                key={tag}
                onPress={() => toggleRestriction(id)}
                style={[styles.tag, isActive && styles.tagActive]}
              >
                <Text style={[styles.tagText, isActive && styles.tagTextActive]}>{tag}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {/* Allergies */}
        <View style={styles.allergiesSection}>
          <View style={styles.allergyHeader}>
            <Image source={require('../assets/icons/alert.png')} style={styles.alertIcon} />
            <Text style={styles.allergyTitle}>ALLERGIES</Text>
          </View>
          <View style={styles.tagGrid}>
            {['Nuts', 'Shellfish', 'Eggs', 'Soy', 'Dairy'].map((tag) => {
              const id = tag.toLowerCase();
              const isActive = allergies.includes(id);
            
  return (
                <TouchableOpacity 
                  key={tag}
                  onPress={() => toggleAllergy(id)}
                  style={[styles.allergyTag, isActive && styles.allergyTagActive]}
                >
                  <Text style={[styles.allergyTagText, isActive && styles.allergyTagTextActive]}>{tag}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.allergyNotice}>
            We will strictly avoid these ingredients in your meals.
          </Text>
        </View>
        {/* Footer Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('CameraScan')}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('CameraScan')}
          >
            <Text style={styles.secondaryButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>
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
  introContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  introTitle: {
    color: Colors.white,
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  introSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 20,
    marginTop: 10,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    letterSpacing: 1,
  },
  selectText: {
    color: '#4D4D4D',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  goalCard: {
    width: (width - 64) / 2,
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
    position: 'relative',
  },
  goalCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(66, 109, 69, 0.1)',
  },
  goalIcon: {
    width: 32,
    height: 32,
    marginBottom: 12,
  },
  goalTitle: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  goalDesc: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  checkCircle: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    width: 12,
    height: 12,
    tintColor: Colors.white,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  tag: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  tagActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tagText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  tagTextActive: {
    color: Colors.white,
  },
  allergiesSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 32,
    padding: 24,
    marginBottom: 40,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5252',
  },
  allergyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  alertIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: '#FF5252',
  },
  allergyTitle: {
    color: '#FF5252',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    letterSpacing: 1,
  },
  allergyTag: {
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 10,
  },
  allergyTagActive: {
    backgroundColor: '#FF5252',
    borderColor: '#FF5252',
  },
  allergyTagText: {
    color: '#FF5252',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  allergyTagTextActive: {
    color: Colors.white,
  },
  allergyNotice: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    flex: 1.2,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  secondaryButton: {
    backgroundColor: '#EAEAEA',
    flex: 0.8,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1A1A1A',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
});
