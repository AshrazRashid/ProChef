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
import { LayoutDashboard, Calendar, Utensils, ChefHat, Scan, ChevronRight } from 'lucide-react-native';
import { Colors } from '../constants/theme';
const { width } = Dimensions.get('window');

export const DashboardScreen = ({ navigation }: any) => {
  const nutrients = [
    { label: 'PROTEIN', current: '140g', target: '180g', percent: 77, color: '#426D45' },
    { label: 'CARBS', current: '220g', target: '250g', percent: 88, color: '#FFB74D' },
    { label: 'FATS', current: '60g', target: '70g', percent: 85, color: '#4FC3F7' },
  ];
  const recentWins = [
    { name: 'Mediterranean Salmon Bowl', time: '25m', cals: '540 kcal', image: require('../assets/images/MediterraneanSalmonBowl.png') },
    { name: 'Mediterranean Salmon Bowl', time: '25m', cals: '540 kcal', image: require('../assets/images/MediterraneanSalmonBowl.png') },
    { name: 'Spinach & Feta Omelette', time: '12m', cals: '320 kcal', image: require('../assets/images/SpinachOmelette.png') },
    { name: 'Quinoa Salad', time: '15m', cals: '410 kcal', image: require('../assets/images/QuinoaSalad.png') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
           <Image source={require('../assets/images/avatar.png')} style={styles.avatar} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.todayTitle}>Today's Intake</Text>
        <Text style={styles.todaySub}>You're maintaining a steady kinetic rhythm.</Text>
        {/* Calorie Donut */}
        <View style={styles.donutCard}>
           <View style={styles.donutOuter}>
              <View style={styles.donutInner}>
                 <Text style={styles.donutValue}>1840</Text>
                 <Text style={styles.donutLabel}>kcal Consumed</Text>
              </View>
           </View>
           <View style={styles.goalRow}>
              <Text style={styles.goalText}>Goal: <Text style={[styles.goalText, {color: '#426D45'}]}>2,200 kcal</Text></Text>
              <Text style={styles.goalText}>Left: <Text style={[styles.goalText, {color: '#FFB74D'}]}>360 kcal</Text></Text>
           </View>
        </View>
        {/* Nutrient Precision */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitle}>Nutrient Precision</Text>
           <Text style={styles.sectionSubtitle}>DAILY TARGETS</Text>
        </View>
        <View style={styles.nutrientCard}>
           {nutrients.map((n, i) => (
             <View key={i} style={styles.nutrientRow}>
                <View style={styles.nutrientLabelRow}>
                   <View style={[styles.dot, { backgroundColor: n.color }]} />
                   <Text style={styles.nutrientLabel}>{n.label}</Text>
                   <Text style={styles.nutrientValue}>{n.current} <Text style={{color: '#BBB'}}>/ {n.target}</Text></Text>
                </View>
                <View style={styles.progressBar}>
                   <View style={[styles.progressFill, { width: `${n.percent}%`, backgroundColor: n.color }]} />
                </View>
             </View>
           ))}
        </View>
        {/* Weight Trends */}
        <View style={styles.weightCard}>
           <View style={styles.weightHeader}>
              <View>
                 <Text style={styles.weightTitle}>Weight Trends</Text>
                 <Text style={styles.weightSub}>Last 7 Days</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                 <Text style={styles.currentWeight}>77.2 <Text style={styles.weightUnit}>KG</Text></Text>
                 <Text style={styles.weightChange}>📉 -0.8KG</Text>
              </View>
           </View>
           {/* Simple Line Representation */}
           <View style={styles.chartContainer}>
              <View style={styles.chartLine} />
              <View style={styles.chartFill} />
              <View style={[styles.chartPoint, { left: '10%', bottom: '40%' }]} />
              <View style={[styles.chartPoint, { left: '40%', bottom: '50%' }]} />
              <View style={[styles.chartPoint, { left: '70%', bottom: '30%' }]} />
              <View style={[styles.chartPoint, { right: 0, bottom: '45%' }]} />
           </View>
           <View style={styles.chartLabels}>
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => <Text key={d} style={styles.chartLabelText}>{d}</Text>)}
           </View>
        </View>
        {/* Recent Kitchen Wins */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitle}>Recent Kitchen Wins</Text>
           <TouchableOpacity><Text style={styles.viewJournal}>View Journal</Text></TouchableOpacity>
        </View>
        {recentWins.map((win, idx) => (
           <View key={idx} style={styles.winCard}>
              <View style={styles.winImageContainer}>
                 <Image source={win.image} style={styles.winImage} />
              </View>
              <View style={styles.winInfo}>
                 <Text style={styles.winName}>{win.name}</Text>
                 <View style={styles.winStats}>
                    <Utensils size={12} color="#999" />
                    <Text style={styles.winStatText}>{win.time}</Text>
                    <View style={styles.statDivider} />
                    <LayoutDashboard size={12} color="#999" />
                    <Text style={styles.winStatText}>{win.cals}</Text>
                 </View>
              </View>
              <ChevronRight size={18} color="#EEE" />
           </View>
        ))}
      </ScrollView>
      {/* Floating Action Scan */}
      <TouchableOpacity 
        style={styles.scanFab}
        onPress={() => navigation.navigate('CameraScan')}
      >
         <Scan color={Colors.white} size={28} />
         <Text style={styles.scanFabText}>Scan</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF' },
  headerTitle: { color: Colors.primary, fontSize: 18, fontFamily: 'Inter-Bold' },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  todayTitle: { fontSize: 20, color: '#1A1A1A', fontFamily: 'Inter-Bold', marginTop: 24 },
  todaySub: { fontSize: 13, color: '#999', fontFamily: 'Inter-Regular', marginTop: 4, marginBottom: 24 },
  donutCard: { backgroundColor: '#FFF', borderRadius: 40, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  donutOuter: { width: 160, height: 160, borderRadius: 80, borderWidth: 12, borderColor: '#426D45', justifyContent: 'center', alignItems: 'center' },
  donutInner: { alignItems: 'center' },
  donutValue: { fontSize: 36, color: Colors.primary, fontFamily: 'Inter-Bold' },
  donutLabel: { fontSize: 10, color: '#999', fontFamily: 'Inter-Medium', marginTop: 4 },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 24 },
  goalText: { fontSize: 12, color: '#999', fontFamily: 'Inter-Bold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 32, marginBottom: 16 },
  sectionTitle: { fontSize: 18, color: Colors.primary, fontFamily: 'Inter-Bold' },
  sectionSubtitle: { fontSize: 10, color: '#999', fontFamily: 'Inter-Bold' },
  nutrientCard: { backgroundColor: '#FFF', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: '#EEE' },
  nutrientRow: { marginBottom: 20 },
  nutrientLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  nutrientLabel: { flex: 1, fontSize: 12, color: '#666', fontFamily: 'Inter-Bold' },
  nutrientValue: { fontSize: 12, color: '#1A1A1A', fontFamily: 'Inter-Bold' },
  progressBar: { height: 6, backgroundColor: '#F5F5F5', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  weightCard: { backgroundColor: '#FFF', borderRadius: 32, padding: 24, marginTop: 24, borderWidth: 1, borderColor: '#EEE' },
  weightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  weightTitle: { fontSize: 16, color: Colors.primary, fontFamily: 'Inter-Bold' },
  weightSub: { fontSize: 10, color: '#999', fontFamily: 'Inter-Medium' },
  currentWeight: { fontSize: 24, color: Colors.primary, fontFamily: 'Inter-Bold' },
  weightUnit: { fontSize: 12, color: '#999' },
  weightChange: { fontSize: 12, color: '#426D45', fontFamily: 'Inter-Bold', marginTop: 4 },
  chartContainer: { height: 80, justifyContent: 'center', marginVertical: 20 },
  chartLine: { height: 2, backgroundColor: 'rgba(66, 109, 69, 0.2)', width: '100%' },
  chartFill: { height: 40, backgroundColor: 'rgba(66, 109, 69, 0.05)', position: 'absolute', bottom: 0, width: '100%' },
  chartPoint: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: '#426D45', borderWidth: 2, borderColor: '#FFF' },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  chartLabelText: { fontSize: 9, color: '#CCC', fontFamily: 'Inter-Bold' },
  viewJournal: { fontSize: 12, color: '#426D45', fontFamily: 'Inter-Bold' },
  winCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 24, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#EEE' },
  winImageContainer: { width: 56, height: 56, borderRadius: 16, overflow: 'hidden' },
  winImage: { width: '100%', height: '100%' },
  winInfo: { flex: 1, marginLeft: 16 },
  winName: { fontSize: 14, color: Colors.primary, fontFamily: 'Inter-Bold', marginBottom: 4 },
  winStats: { flexDirection: 'row', alignItems: 'center' },
  winStatText: { fontSize: 11, color: '#999', fontFamily: 'Inter-Regular', marginLeft: 6 },
  statDivider: { width: 1, height: 10, backgroundColor: '#EEE', marginHorizontal: 10 },
  scanFab: { position: 'absolute', bottom: 100, right: 20, backgroundColor: '#426D45', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  scanFabText: { color: Colors.white, fontSize: 14, fontFamily: 'Inter-Bold', marginLeft: 10 },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EEE', paddingBottom: 20 },
  tabItem: { alignItems: 'center' },
  tabActive: { borderTopWidth: 2, borderTopColor: Colors.primary, paddingTop: 6 },
  tabLabel: { fontSize: 8, color: '#999', fontFamily: 'Inter-Bold', marginTop: 4 },
});
