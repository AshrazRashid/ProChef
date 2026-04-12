import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  Dimensions,
  Switch
} from 'react-native';
import { ChevronLeft, Filter, Clock, ChefHat, Plus } from 'lucide-react-native';
import { Colors } from '../constants/theme';

const { width } = Dimensions.get('window');

export const MealsScreen = ({ navigation }: any) => {
  const [isMacroImpactEnabled, setIsMacroImpactEnabled] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');

  const meals = [
    {
      id: '1',
      title: 'Glazed Salmon & Quinoa Power Bowl',
      desc: 'Based on your 2,400 kcal target, this meal provides optimal protein density while using up the remaining avocado in your fridge.',
      cals: 540,
      prot: '42g',
      carb: '35g',
      fat: '22g',
      time: '15m',
      difficulty: 'Easy',
      match: '100% MATCH',
      image: require('../assests/images/MediterraneanSalmonBowl.png'),
      isLarge: true
    },
    {
      id: '2',
      title: 'Seared Tofu & Lime Street Tacos',
      cals: 420,
      prot: '28g',
      carb: '45g',
      time: '12m',
      difficulty: 'Low',
      match: '100% MATCH',
      image: require('../assests/images/ProteinBowl.png')
    },
    {
      id: '3',
      title: 'Wild Basil Pesto Pasta',
      cals: 610,
      prot: '14g',
      carb: '78g',
      time: '20m',
      difficulty: 'Med',
      match: '95% MATCH',
      image: require('../assests/images/GreenPowerSmoothie.png')
    },
    {
      id: '4',
      title: 'Garden Harvest Chickpea Salad',
      cals: 340,
      prot: '18g',
      carb: '42g',
      time: '10m',
      difficulty: 'Low',
      match: '100% MATCH',
      image: require('../assests/images/QuinoaSalad.png')
    },
    {
      id: '5',
      title: 'Healing Ginger Miso Broth',
      cals: 180,
      prot: '9g',
      carb: '22g',
      time: '8m',
      difficulty: 'Easy',
      match: '100% MATCH',
      image: require('../assests/images/LemonChicken.png')
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={Colors.white} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meals You Can Make</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter color={Colors.secondary} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {['All', 'High Protein', 'Low Calorie', 'Keto', 'Vegan'].map((filter) => (
            <TouchableOpacity 
              key={filter} 
              onPress={() => setSelectedFilter(filter)}
              style={[styles.chip, selectedFilter === filter && styles.chipActive]}
            >
              <Text style={[styles.chipText, selectedFilter === filter && styles.chipTextActive]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Macro Switch Section */}
        <View style={styles.macroHeader}>
          <View>
             <Text style={styles.macroTitlePrimary}>RECOMMENDED FOR</Text>
             <Text style={styles.macroTitleSecondary}>YOU</Text>
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Show Macro {'\n'}Impact</Text>
            <Switch 
              value={isMacroImpactEnabled}
              onValueChange={setIsMacroImpactEnabled}
              trackColor={{ false: '#333', true: Colors.secondary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        {/* Meals List */}
        {meals.map((meal) => (
          <TouchableOpacity 
            key={meal.id} 
            style={meal.isLarge ? styles.largeCard : styles.smallCard}
            onPress={() => navigation.navigate('RecipeDetails')}
          >
            <View style={meal.isLarge ? styles.imageContainerLarge : styles.imageContainerSmall}>
              <Image source={meal.image} style={styles.image} />
              <View style={styles.matchBadge}>
                {meal.isLarge && <Image source={require('../assests/icons/tick.png')} style={styles.matchIcon} />}
                <Text style={styles.matchText}>{meal.match}</Text>
              </View>
            </View>
            
            <View style={styles.cardContent}>
              {meal.isLarge && (
                <View style={styles.pillLabel}>
                  <Text style={styles.pillText}>BEST MATCH FOR YOUR GOAL</Text>
                </View>
              )}
              <Text style={meal.isLarge ? styles.largeTitle : styles.smallTitle}>{meal.title}</Text>
              {meal.isLarge && <Text style={styles.largeDesc}>{meal.desc}</Text>}
              
              {/* Nutrition */}
              <View style={styles.nutritionRow}>
                {meal.isLarge ? (
                  <View style={styles.nutritionGrid}>
                    <View style={styles.nutritionItem}><Text style={styles.nutVal}>540</Text><Text style={styles.nutLab}>CALS</Text></View>
                    <View style={styles.nutritionItem}><Text style={styles.nutVal}>42g</Text><Text style={styles.nutLab}>PROT</Text></View>
                    <View style={styles.nutritionItem}><Text style={styles.nutVal}>35g</Text><Text style={styles.nutLab}>CARB</Text></View>
                    <View style={styles.nutritionItem}><Text style={styles.nutVal}>22g</Text><Text style={styles.nutLab}>FAT</Text></View>
                  </View>
                ) : (
                   <View style={styles.statsRow}>
                      <View><Text style={styles.statLabel}>ENERGY</Text><Text style={styles.statValue}>{meal.cals} kcal</Text></View>
                      <View><Text style={styles.statLabel}>PROTEIN</Text><Text style={styles.statValue}>{meal.prot}</Text></View>
                      <View><Text style={styles.statLabel}>CARBS</Text><Text style={styles.statValue}>{meal.carb}</Text></View>
                   </View>
                )}
              </View>

              {/* Meta */}
              <View style={styles.metaRow}>
                <View style={styles.metaItem}><Clock size={14} color="#666" /><Text style={styles.metaText}>{meal.time}</Text></View>
                <View style={styles.metaItem}><ChefHat size={14} color="#666" /><Text style={styles.metaText}>{meal.difficulty}</Text></View>
                {meal.isLarge ? (
                   <View style={styles.addButton}><Plus color={Colors.white} size={20} /></View>
                ) : (
                   <Text style={styles.viewRecipeText}>View Recipe →</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* The "Update Meal" button from the design */}
        <TouchableOpacity 
          style={styles.bottomButton}
          onPress={() => navigation.navigate('MealDiscovery')}
        >
          <Text style={styles.bottomButtonText}>Update Meal</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
  backButton: { padding: 4 },
  headerTitle: { color: Colors.white, fontSize: 18, fontFamily: 'Inter-Bold' },
  filterButton: { padding: 8, backgroundColor: '#1A1A1A', borderRadius: 8 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  chipScroll: { marginVertical: 15 },
  chip: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, backgroundColor: '#1A1A1A', marginRight: 10 },
  chipActive: { backgroundColor: Colors.secondary },
  chipText: { color: '#666', fontSize: 14, fontFamily: 'Inter-Medium' },
  chipTextActive: { color: Colors.background, fontFamily: 'Inter-Bold' },
  macroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  macroTitlePrimary: { color: Colors.white, fontSize: 14, fontFamily: 'Inter-Bold', letterSpacing: 1 },
  macroTitleSecondary: { color: Colors.white, fontSize: 14, fontFamily: 'Inter-Bold', letterSpacing: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center' },
  switchLabel: { color: '#666', fontSize: 10, fontFamily: 'Inter-Bold', textAlign: 'right', marginRight: 10 },
  largeCard: { backgroundColor: '#1A1A1A', borderRadius: 32, overflow: 'hidden', marginBottom: 24, borderWidth: 1, borderColor: '#333' },
  smallCard: { backgroundColor: '#1A1A1A', borderRadius: 24, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: '#333' },
  imageContainerLarge: { height: 280, width: '100%' },
  imageContainerSmall: { height: 180, width: '100%' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  matchBadge: { position: 'absolute', top: 20, left: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  matchIcon: { width: 14, height: 14, marginRight: 6, tintColor: Colors.secondary },
  matchText: { color: Colors.background, fontSize: 10, fontFamily: 'Inter-Bold' },
  cardContent: { padding: 24 },
  pillLabel: { alignSelf: 'flex-start', backgroundColor: 'rgba(66, 109, 69, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  pillText: { color: Colors.secondary, fontSize: 8, fontFamily: 'Inter-Bold' },
  largeTitle: { color: Colors.white, fontSize: 22, fontFamily: 'Inter-Bold', marginBottom: 12 },
  smallTitle: { color: Colors.white, fontSize: 18, fontFamily: 'Inter-Bold', marginBottom: 16 },
  largeDesc: { color: Colors.textSecondary, fontSize: 12, fontFamily: 'Inter-Regular', lineHeight: 18, marginBottom: 20 },
  nutritionRow: { marginBottom: 20 },
  nutritionGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  nutritionItem: { alignItems: 'center' },
  nutVal: { color: Colors.secondary, fontSize: 20, fontFamily: 'Inter-Bold' },
  nutLab: { color: '#666', fontSize: 10, fontFamily: 'Inter-Bold' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { color: '#666', fontSize: 8, fontFamily: 'Inter-Bold', marginBottom: 4 },
  statValue: { color: Colors.white, fontSize: 14, fontFamily: 'Inter-Bold' },
  metaRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#262626', paddingTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  metaText: { color: '#666', fontSize: 12, fontFamily: 'Inter-Medium', marginLeft: 6 },
  addButton: { marginLeft: 'auto', width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center' },
  viewRecipeText: { marginLeft: 'auto', color: Colors.secondary, fontSize: 10, fontFamily: 'Inter-Bold' },
  bottomButton: { backgroundColor: Colors.primary, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  bottomButtonText: { color: Colors.white, fontSize: 18, fontFamily: 'Inter-SemiBold' },
});
