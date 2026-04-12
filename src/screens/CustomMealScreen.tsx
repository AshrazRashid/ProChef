import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  Dimensions,
  PanResponder,
  Animated
} from 'react-native';
import { ChevronLeft, Sliders, ChevronRight } from 'lucide-react-native';
import { Colors } from '../constants/theme';
const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 88; // Accounting for all paddings
const CustomSlider = ({ value, min, max, onChange, color, labels }: any) => {
  const pan = useRef(new Animated.ValueXY()).current;
  // Initialize position based on value
  const initialLeft = ((value - min) / (max - min)) * SLIDER_WIDTH;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        let newLeft = initialLeft + gestureState.dx;
        if (newLeft < 0) newLeft = 0;
        if (newLeft > SLIDER_WIDTH) newLeft = SLIDER_WIDTH;
        const newValue = Math.round(min + (newLeft / SLIDER_WIDTH) * (max - min));
        onChange(newValue);
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
      }
    })
  ).current;
  const leftPercent = ((value - min) / (max - min)) * 100;

  return (
    <View style={styles.sliderGroup}>
      <View style={styles.sliderHeader}>
        <View style={styles.sliderLabelRow}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={styles.sliderLabel}>{labels.title}</Text>
        </View>
        <Text style={[styles.sliderValue, { color }]}>{value} <Text style={styles.sliderUnit}>g</Text></Text>
      </View>
      <View style={styles.sliderTrackContainer}>
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${leftPercent}%`, backgroundColor: color }]} />
        </View>
        <View 
          {...panResponder.panHandlers}
          style={[styles.sliderThumb, { left: `${leftPercent}%` }]} 
        />
      </View>
      <View style={styles.sliderMinMax}>
        <Text style={styles.minMaxText}>{labels.min}</Text>
        <Text style={styles.minMaxText}>{labels.max}</Text>
      </View>
    </View>
  );
};

export const CustomMealScreen = ({ navigation }: any) => {
  const [protein, setProtein] = useState(32);
  const [carbs, setCarbs] = useState(45);
  const [fats, setFats] = useState(22);
  const variations = [
    { title: 'High Protein', desc: 'Extra salmon portion served with ancient grain quinoa blend.', value: '35g Protein', badge: 'BEST FOR MUSCLE', image: require('../assets/images/MediterraneanSalmonBowl.png') },
    { title: 'Low Carb', desc: 'Swap quinoa for cauliflower rice seasoned with fresh herbs.', value: '12g Carbs', badge: 'WEIGHT LOSS', image: require('../assets/images/QuinoaSalad.png') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Main')} style={styles.backButton}>
          <ChevronLeft color={Colors.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Custom Meal</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
           <View style={styles.donutContainer}>
              <View style={styles.donutOuter}>
                 <View style={styles.donutInner}>
                    <Text style={styles.energyLabel}>TOTAL ENERGY</Text>
                    <Text style={styles.energyValue}>542</Text>
                    <Text style={styles.energyUnit}>kcal</Text>
                 </View>
              </View>
           </View>
           <Text style={styles.mealName}>Mediterranean Salmon Bowl</Text>
           <Text style={styles.mealDesc}>Fresh Atlantic salmon, quinoa base, cherry tomatoes, and kalamata olives.</Text>
           <View style={styles.macroRow}>
              <View style={styles.macroItem}><Text style={styles.macroLabel}>PROTEIN</Text><Text style={styles.macroValue}>{protein}g</Text></View>
              <View style={styles.macroItem}><Text style={styles.macroLabel}>CARBS</Text><Text style={styles.macroValue}>{carbs}g</Text></View>
              <View style={styles.macroItem}><Text style={styles.macroLabel}>FATS</Text><Text style={styles.macroValue}>{fats}g</Text></View>
           </View>
        </View>
        <View style={styles.tuneSection}>
           <View style={styles.tuneHeader}>
              <Sliders size={20} color={Colors.primary} />
              <Text style={styles.tuneTitle}>Fine-tune Nutrition</Text>
           </View>
           <CustomSlider 
              value={protein} 
              min={10} max={60} 
              onChange={setProtein} 
              color="#426D45" 
              labels={{ title: 'Protein', min: 'MIN (10G)', max: 'MAX (60G)' }} 
           />
           <CustomSlider 
              value={carbs} 
              min={0} max={100} 
              onChange={setCarbs} 
              color="#FFB74D" 
              labels={{ title: 'Carbohydrates', min: 'LOW CARB', max: 'HIGH CARB' }} 
           />
           <CustomSlider 
              value={fats} 
              min={0} max={50} 
              onChange={setFats} 
              color="#4FC3F7" 
              labels={{ title: 'Healthy Fats', min: 'LEAN', max: 'HEARTY' }} 
           />
        </View>
        <View style={styles.variationsSection}>
           <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommended Variations</Text>
              <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
           </View>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.variationScroll}>
              {variations.map((item, index) => (
                <View key={index} style={styles.variationCard}>
                   <Image source={item.image} style={styles.variationImage} />
                   <View style={styles.variationBadge}><Text style={styles.variationBadgeText}>{item.badge}</Text></View>
                   <View style={styles.variationContent}>
                      <Text style={styles.variationTitle}>{item.title}</Text>
                      <Text style={styles.variationDesc}>{item.desc}</Text>
                      <View style={styles.variationFooter}>
                         <View style={styles.impactCircle}><ChevronRight size={14} color={Colors.primary} /></View>
                         <Text style={styles.variationImpact}>{item.value}</Text>
                      </View>
                   </View>
                </View>
              ))}
           </ScrollView>
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Cooking')}>
           <Text style={styles.primaryButtonText}>Update My Meal</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { padding: 4 },
  headerTitle: { color: Colors.primary, fontSize: 18, fontFamily: 'Inter-Bold', marginLeft: 10 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  summaryCard: { backgroundColor: '#FFF', borderRadius: 40, padding: 32, alignItems: 'center', marginTop: 20, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  donutContainer: { marginBottom: 24 },
  donutOuter: { width: 140, height: 140, borderRadius: 70, borderWidth: 10, borderColor: '#426D45', justifyContent: 'center', alignItems: 'center' },
  donutInner: { alignItems: 'center' },
  energyLabel: { fontSize: 8, color: '#999', fontFamily: 'Inter-Bold', marginBottom: 4 },
  energyValue: { fontSize: 32, color: '#1A1A1A', fontFamily: 'Inter-Bold' },
  energyUnit: { fontSize: 12, color: '#999', fontFamily: 'Inter-Medium' },
  mealName: { fontSize: 18, color: Colors.primary, fontFamily: 'Inter-Bold', marginBottom: 8 },
  mealDesc: { fontSize: 12, color: '#999', fontFamily: 'Inter-Regular', textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  macroRow: { flexDirection: 'row', justifyContent: 'center', width: '100%', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 20 },
  macroItem: { alignItems: 'center', marginHorizontal: 20 },
  macroLabel: { fontSize: 8, color: '#999', fontFamily: 'Inter-Bold', marginBottom: 4 },
  macroValue: { fontSize: 16, color: '#1A1A1A', fontFamily: 'Inter-Bold' },
  tuneSection: { backgroundColor: '#FFF', borderRadius: 32, padding: 24, marginTop: 24, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  tuneHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  tuneTitle: { color: '#1A1A1A', fontSize: 16, fontFamily: 'Inter-Bold', marginLeft: 10 },
  sliderGroup: { marginBottom: 24 },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sliderLabelRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  sliderLabel: { color: '#666', fontSize: 14, fontFamily: 'Inter-Medium' },
  sliderValue: { fontSize: 18, fontFamily: 'Inter-Bold' },
  sliderUnit: { fontSize: 12, color: '#999' },
  sliderTrackContainer: { height: 30, justifyContent: 'center' },
  sliderTrack: { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
  sliderFill: { height: '100%', borderRadius: 4 },
  sliderThumb: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, marginLeft: -12 },
  sliderMinMax: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  minMaxText: { fontSize: 8, color: '#999', fontFamily: 'Inter-Bold' },
  variationsSection: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: Colors.primary, fontSize: 16, fontFamily: 'Inter-Bold' },
  viewAll: { color: Colors.primary, fontSize: 12, fontFamily: 'Inter-SemiBold' },
  variationScroll: { marginLeft: -20, paddingLeft: 20 },
  variationCard: { width: 200, backgroundColor: '#FFF', borderRadius: 24, marginRight: 16, overflow: 'hidden', shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 },
  variationImage: { width: '100%', height: 120 },
  variationBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  variationBadgeText: { color: Colors.white, fontSize: 8, fontFamily: 'Inter-Bold' },
  variationContent: { padding: 16 },
  variationTitle: { color: Colors.primary, fontSize: 14, fontFamily: 'Inter-Bold', marginBottom: 4 },
  variationDesc: { color: '#999', fontSize: 10, fontFamily: 'Inter-Regular', lineHeight: 14, marginBottom: 12 },
  variationFooter: { flexDirection: 'row', alignItems: 'center' },
  impactCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(66, 109, 69, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  variationImpact: { color: Colors.primary, fontSize: 12, fontFamily: 'Inter-Bold' },
  primaryButton: { backgroundColor: Colors.primary, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  primaryButtonText: { color: Colors.white, fontSize: 16, fontFamily: 'Inter-Bold' },
});
