import { SafeAreaView } from "react-native-safe-area-context";
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  Dimensions
} from 'react-native';
import { LayoutDashboard, Calendar, Utensils, ChefHat, Plus, ShoppingCart, ChevronRight } from 'lucide-react-native';
import { Colors } from '../constants/theme';
const { width } = Dimensions.get('window');

export const MealPlannerScreen = ({ navigation }: any) => {
  const [selectedIdx, setSelectedIdx] = React.useState(0);
  const macros = [
    { label: 'PROTEIN', val: '160g', percent: 40, color: '#426D45' },
    { label: 'CARBS', val: '220g', percent: 35, color: '#FFB74D' },
    { label: 'FATS', val: '65g', percent: 25, color: '#4FC3F7' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meal Planner</Text>
        <Image source={require('../assets/images/avatar.png')} style={styles.avatar} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Weekly Goal Card */}
        <View style={styles.goalCard}>
           <Text style={styles.goalLabel}>WEEKLY GOAL</Text>
           <Text style={styles.goalValue}>2,100</Text>
           <Text style={styles.goalUnit}>kcal / day avg</Text>
           <View style={styles.macroRow}>
              {macros.map((m, i) => (
                <View key={i} style={styles.macroItem}>
                   <View style={styles.donutPlaceholder}>
                      <View style={[styles.donutInner, { borderColor: m.color, borderTopWidth: 4, borderRightWidth: 4 }]} />
                      <Text style={styles.macroPercent}>{m.percent}%</Text>
                   </View>
                   <Text style={styles.macroLabel}>{m.label}</Text>
                   <Text style={styles.macroVal}>{m.val}</Text>
                </View>
              ))}
           </View>
        </View>
        {/* Weekly Schedule */}
        <View style={styles.scheduleHeader}>
           <Text style={styles.scheduleTitle}>Weekly Schedule</Text>
           <TouchableOpacity style={styles.autoBtn}>
              <Text style={styles.autoBtnText}>Auto Generated Plan</Text>
           </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
           {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
             <TouchableOpacity 
               key={idx} 
               style={[styles.dateCard, selectedIdx === idx && styles.dateCardActive]}
               onPress={() => setSelectedIdx(idx)}
             >
                <Text style={[styles.dayText, selectedIdx === idx && styles.dayTextActive]}>{day}</Text>
                <Text style={[styles.dateText, selectedIdx === idx && styles.dateTextActive]}>OCT {23 + idx}</Text>
             </TouchableOpacity>
           ))}
        </ScrollView>
        {/* Meal Blocks */}
        <View style={styles.mealBlock}>
           <Text style={styles.blockLabel}>BREAKFAST</Text>
           <TouchableOpacity style={styles.mealCard}>
              <Image source={require('../assets/images/SpinachOmelette.png')} style={styles.mealThumb} />
              <View style={styles.mealInfo}>
                 <Text style={styles.mealName}>Spinach Omelette</Text>
                 <Text style={styles.mealCals}>320 kcal</Text>
              </View>
              <ChevronRight size={18} color="#CCC" />
           </TouchableOpacity>
        </View>
        <View style={styles.mealBlock}>
           <Text style={styles.blockLabel}>LUNCH</Text>
           <TouchableOpacity style={styles.addBlock}>
              <View style={styles.plusCircle}><Plus size={20} color={Colors.primary} /></View>
           </TouchableOpacity>
        </View>
        <View style={styles.mealBlock}>
           <Text style={styles.blockLabel}>DINNER</Text>
           <TouchableOpacity style={styles.mealCard}>
              <Image source={require('../assets/images/MediterraneanSalmonBowl.png')} style={styles.mealThumb} />
              <View style={styles.mealInfo}>
                 <Text style={styles.mealName}>Salmon Bowl</Text>
                 <Text style={styles.mealCals}>540 kcal</Text>
              </View>
              <ChevronRight size={18} color="#CCC" />
           </TouchableOpacity>
        </View>
        {/* Grocery List Banner */}
        <View style={styles.groceryBanner}>
           <View style={styles.groceryContent}>
              <Text style={styles.groceryTitle}>Grocery List</Text>
              <Text style={styles.groceryDesc}>We've compiled 24 items based on your weekly meal plan.</Text>
              <TouchableOpacity 
                style={styles.viewChecklistBtn}
                onPress={() => navigation.navigate('ShoppingList')}
              >
                 <Text style={styles.viewChecklistText}>View Checklist</Text>
              </TouchableOpacity>
           </View>
           <ShoppingCart size={80} color="rgba(66, 109, 69, 0.05)" style={styles.cartIcon} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF' },
  headerTitle: { color: Colors.primary, fontSize: 18, fontFamily: 'Inter-Bold' },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  goalCard: { backgroundColor: '#FFF', borderRadius: 32, padding: 24, alignItems: 'center', marginTop: 24, borderWidth: 1, borderColor: '#EEE' },
  goalLabel: { fontSize: 8, color: '#999', fontFamily: 'Inter-Bold', letterSpacing: 1, marginBottom: 8 },
  goalValue: { fontSize: 32, color: Colors.primary, fontFamily: 'Inter-Bold' },
  goalUnit: { fontSize: 12, color: '#999', fontFamily: 'Inter-Medium', marginBottom: 24 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 24 },
  macroItem: { alignItems: 'center', flex: 1 },
  donutPlaceholder: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  donutInner: { position: 'absolute', width: '100%', height: '100%', borderRadius: 22, borderLeftWidth: 4, borderBottomWidth: 4, transform: [{ rotate: '45deg' }] },
  macroPercent: { fontSize: 12, fontFamily: 'Inter-Bold', color: '#333' },
  macroLabel: { fontSize: 8, color: '#999', fontFamily: 'Inter-Bold', marginBottom: 4 },
  macroVal: { fontSize: 13, color: '#1A1A1A', fontFamily: 'Inter-Bold' },
  scheduleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, marginBottom: 20 },
  scheduleTitle: { color: Colors.primary, fontSize: 18, fontFamily: 'Inter-Bold' },
  autoBtn: { backgroundColor: '#426D45', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  autoBtnText: { color: '#FFF', fontSize: 10, fontFamily: 'Inter-Bold' },
  dateScroll: { marginBottom: 24 },
  dateCard: { backgroundColor: '#FFF', width: (width - 60) / 4, height: 64, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#EEE' },
  dateCardActive: { backgroundColor: Colors.primary },
  dayText: { color: Colors.primary, fontSize: 12, fontFamily: 'Inter-Bold' },
  dateText: { color: '#999', fontSize: 8, fontFamily: 'Inter-Bold', marginTop: 4 },
  dayTextActive: { color: '#FFF' },
  dateTextActive: { color: 'rgba(255,255,255,0.7)' },
  mealBlock: { marginBottom: 20 },
  blockLabel: { color: '#999', fontSize: 8, fontFamily: 'Inter-Bold', letterSpacing: 1, marginBottom: 8 },
  mealCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  mealThumb: { width: 44, height: 44, borderRadius: 12 },
  mealInfo: { flex: 1, marginLeft: 16 },
  mealName: { color: Colors.primary, fontSize: 14, fontFamily: 'Inter-Bold' },
  mealCals: { color: '#999', fontSize: 12, fontFamily: 'Inter-Regular', marginTop: 2 },
  addBlock: { backgroundColor: '#FFF', borderRadius: 20, height: 60, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#EEE' },
  plusCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F9F9F9', justifyContent: 'center', alignItems: 'center' },
  groceryBanner: { backgroundColor: '#FFF', borderRadius: 32, padding: 24, marginTop: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#EEE' },
  groceryContent: { flex: 1, zIndex: 1 },
  groceryTitle: { color: Colors.primary, fontSize: 18, fontFamily: 'Inter-Bold', marginBottom: 8 },
  groceryDesc: { color: '#999', fontSize: 12, fontFamily: 'Inter-Regular', lineHeight: 18, marginBottom: 20, width: '70%' },
  viewChecklistBtn: { backgroundColor: '#426D45', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, alignSelf: 'flex-start' },
  viewChecklistText: { color: '#FFF', fontSize: 14, fontFamily: 'Inter-Bold' },
  cartIcon: { position: 'absolute', right: -20, bottom: -20 },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EEE', paddingBottom: 20 },
  tabItem: { alignItems: 'center' },
  tabActive: { borderTopWidth: 2, borderTopColor: Colors.primary, paddingTop: 6 },
  tabLabel: { fontSize: 8, color: '#999', fontFamily: 'Inter-Bold', marginTop: 4 },
});
