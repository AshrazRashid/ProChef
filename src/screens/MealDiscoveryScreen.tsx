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
import { ChevronLeft, Filter, RotateCcw, Edit3, Bookmark } from 'lucide-react-native';
import { Colors } from '../constants/theme';

const { width } = Dimensions.get('window');

export const MealDiscoveryScreen = ({ navigation }: any) => {
  const [isMacroImpactEnabled, setIsMacroImpactEnabled] = useState(true);

  const meals = [
    {
      id: '1',
      title: 'Glazed Salmon & Quinoa Power Bowl',
      desc: 'This meal optimizes your fat loss goal by pairing high-quality protein with slow-digesting complex carbs to keep you satiated longer.',
      cals: 540,
      prot: '42g',
      carb: '35g',
      fat: '22g',
      match: '100% MATCH',
      image: require('../assests/images/MediterraneanSalmonBowl.png'),
    },
    {
      id: '2',
      title: 'Seared Tofu & Lime Street Tacos',
      cals: 420,
      prot: '28g',
      carb: '45g',
      match: '100% MATCH',
      image: require('../assests/images/ProteinBowl.png'),
    },
    {
      id: '3',
      title: 'Wild Basil Pesto Pasta',
      cals: 380,
      prot: '12g',
      carb: '52g',
      match: '95% MATCH',
      image: require('../assests/images/GreenPowerSmoothie.png'),
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={Colors.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meal You Can Make</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter color="#333" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* AI Insight Box */}
        <View style={styles.aiBox}>
           <View style={styles.aiHeader}>
              <Image source={require('../assests/icons/creation.png')} style={styles.aiIcon} />
              <Text style={styles.aiBoxTitle}>AI INSIGHT</Text>
           </View>
           <Text style={styles.aiBoxDesc}>
              Based on your ingredients <Text style={styles.ingredientText}>(chicken, spinach, eggs)</Text> and your goal <Text style={styles.goalText}>(Fat Loss)</Text>, we found 12 meals for you.
           </Text>
           <View style={styles.aiButtons}>
              <TouchableOpacity style={styles.regenerateBtn}>
                 <RotateCcw size={14} color={Colors.white} />
                 <Text style={styles.regenerateText}>Regenerate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editListBtn}>
                 <Edit3 size={14} color={Colors.primary} />
                 <Text style={styles.editListText}>Edit List</Text>
              </TouchableOpacity>
           </View>
        </View>

        {/* Options Row */}
        <View style={styles.optionsRow}>
           <View style={styles.switchRow}>
              <Switch 
                value={isMacroImpactEnabled}
                onValueChange={setIsMacroImpactEnabled}
                trackColor={{ false: '#DDD', true: Colors.primary }}
              />
              <Text style={styles.switchLabel}>Show Macro Impact</Text>
           </View>
           <TouchableOpacity style={styles.sortBtn}>
              <Text style={styles.sortText}>Sort ⌵</Text>
           </TouchableOpacity>
        </View>

        {/* List of meals */}
        <TouchableOpacity style={styles.mainCard}>
           <View style={styles.imageContainer}>
              <Image source={meals[0].image} style={styles.mainImage} />
              <View style={styles.matchBadge}>
                <Text style={styles.matchText}>{meals[0].match}</Text>
              </View>
           </View>
           <View style={styles.cardInfo}>
              <View style={styles.pillLabel}>
                <Text style={styles.pillText}>BEST MATCH FOR YOUR GOAL</Text>
              </View>
              <Text style={styles.mainTitle}>{meals[0].title}</Text>
              <Text style={styles.mainDesc}>{meals[0].desc}</Text>
              <View style={styles.nutritionGrid}>
                {['Cals', 'Prot', 'Carb', 'Fat'].map((label, i) => (
                  <View key={label} style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>{label}</Text>
                    <Text style={styles.nutritionValue}>{[540, '42g', '35g', '22g'][i]}</Text>
                  </View>
                ))}
              </View>
           </View>
        </TouchableOpacity>

        {meals.slice(1).map(meal => (
           <TouchableOpacity key={meal.id} style={styles.horizontalCard}>
              <Image source={meal.image} style={styles.horizontalImage} />
              <View style={styles.horizontalContent}>
                 <View style={styles.horizontalHeader}>
                    <Text style={styles.horizontalMatch}>{meal.match}</Text>
                    <Bookmark size={16} color="#333" />
                 </View>
                 <Text style={styles.horizontalTitle}>{meal.title}</Text>
                 <View style={styles.horizontalStats}>
                    <Text style={styles.statVal}>{meal.cals}</Text><Text style={styles.statLabel}> CALS</Text>
                    <View style={styles.divider} />
                    <Text style={styles.statVal}>{meal.prot}</Text><Text style={styles.statLabel}> PROTEIN</Text>
                    <View style={styles.divider} />
                    <Text style={styles.statVal}>{meal.carb}</Text><Text style={styles.statLabel}> CARBS</Text>
                 </View>
              </View>
           </TouchableOpacity>
        ))}

        <TouchableOpacity 
          style={styles.viewOtherBtn}
          onPress={() => navigation.navigate('PremiumAccess')}
        >
           <Text style={styles.viewOtherText}>View 9 Other Meals</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF' },
  backButton: { padding: 4 },
  headerTitle: { color: Colors.primary, fontSize: 18, fontFamily: 'Inter-Bold' },
  filterButton: { padding: 8 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  aiBox: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginTop: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#EEE' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  aiIcon: { width: 20, height: 20, marginRight: 8, tintColor: Colors.primary },
  aiBoxTitle: { color: '#999', fontSize: 10, fontFamily: 'Inter-Bold', letterSpacing: 1 },
  aiBoxDesc: { color: '#333', fontSize: 14, fontFamily: 'Inter-Regular', lineHeight: 22, marginBottom: 20 },
  ingredientText: { color: Colors.primary, fontFamily: 'Inter-Bold' },
  goalText: { color: Colors.primary, fontFamily: 'Inter-Bold' },
  aiButtons: { flexDirection: 'row' },
  regenerateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10 },
  regenerateText: { color: Colors.white, fontSize: 12, fontFamily: 'Inter-Bold', marginLeft: 6 },
  editListBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#EEE' },
  editListText: { color: Colors.primary, fontSize: 12, fontFamily: 'Inter-Bold', marginLeft: 6 },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 16 },
  switchRow: { flexDirection: 'row', alignItems: 'center' },
  switchLabel: { color: '#666', fontSize: 12, fontFamily: 'Inter-SemiBold', marginLeft: 8 },
  sortBtn: { flexDirection: 'row', alignItems: 'center' },
  sortText: { color: '#666', fontSize: 12, fontFamily: 'Inter-Medium' },
  mainCard: { backgroundColor: '#FFF', borderRadius: 32, overflow: 'hidden', marginBottom: 20, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#EEE' },
  imageContainer: { height: 240, width: '100%' },
  mainImage: { width: '100%', height: '100%' },
  matchBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  matchText: { color: Colors.white, fontSize: 10, fontFamily: 'Inter-Bold' },
  cardInfo: { padding: 20 },
  pillLabel: { alignSelf: 'flex-start', backgroundColor: 'rgba(66, 109, 69, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  pillText: { color: Colors.primary, fontSize: 8, fontFamily: 'Inter-Bold' },
  mainTitle: { color: '#1A1A1A', fontSize: 20, fontFamily: 'Inter-Bold', marginBottom: 8 },
  mainDesc: { color: '#666', fontSize: 13, fontFamily: 'Inter-Regular', lineHeight: 20, marginBottom: 20 },
  nutritionGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  nutritionItem: { alignItems: 'flex-start', backgroundColor: '#F9F9F9', padding: 10, borderRadius: 12, width: (width - 120) / 4 },
  nutritionLabel: { color: '#999', fontSize: 8, fontFamily: 'Inter-Bold', marginBottom: 4 },
  nutritionValue: { color: Colors.primary, fontSize: 14, fontFamily: 'Inter-Bold' },
  horizontalCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 12, flexDirection: 'row', marginBottom: 16, borderWidth: 1, borderColor: '#EEE' },
  horizontalImage: { width: 100, height: 100, borderRadius: 20 },
  horizontalContent: { flex: 1, paddingLeft: 16, justifyContent: 'space-between' },
  horizontalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  horizontalMatch: { color: Colors.primary, fontSize: 10, fontFamily: 'Inter-Bold' },
  horizontalTitle: { color: '#1A1A1A', fontSize: 15, fontFamily: 'Inter-Bold' },
  horizontalStats: { flexDirection: 'row', alignItems: 'center' },
  divider: { width: 1, height: 12, backgroundColor: '#EEE', marginHorizontal: 10 },
  statVal: { color: '#1A1A1A', fontSize: 12, fontFamily: 'Inter-Bold' },
  statLabel: { color: '#999', fontSize: 8 },
  viewOtherBtn: { backgroundColor: Colors.primary, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  viewOtherText: { color: Colors.white, fontSize: 16, fontFamily: 'Inter-Bold' },
});
