import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  Switch,
  Dimensions
} from 'react-native';
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler';
import { ChevronLeft, Edit3, Target, Calculator, Sliders, Calendar, Utensils, ChefHat, Bell, Zap, Key, FileText, Shield, LogOut, Package } from 'lucide-react-native';
import { Colors } from '../constants/theme';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
const { width } = Dimensions.get('window');

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { signOut } = useAuth();
  const [expiryAlerts, setExpiryAlerts] = useState(true);
  const [mealSuggestions, setMealSuggestions] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Main')} 
            style={styles.backButton}
            hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
          >
            <ChevronLeft color={Colors.primary} size={32} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer} pointerEvents="none">
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.userCard}>
             <View style={styles.avatarWrapper}>
               <Image source={require('../assets/images/avatar.png')} style={styles.userAvatar} />
               <TouchableOpacity 
                 style={styles.editBtn}
                 onPress={() => navigation.navigate('EditProfile')}
                 hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                 activeOpacity={0.7}
               >
                 <Edit3 size={16} color={Colors.white} />
               </TouchableOpacity>
             </View>
             <Text style={styles.userName}>Elena Vance</Text>
          </View>
          <View style={styles.goalCard}>
             <View style={styles.goalHeader}>
                <View>
                   <Text style={styles.goalLabel}>ACTIVE GOAL</Text>
                   <Text style={styles.goalTitle}>Fat Loss</Text>
                </View>
                <Target size={24} color="#426D45" />
             </View>
             <View style={styles.weightRow}>
                <View>
                   <Text style={styles.weightVal}>78 <Text style={styles.weightUnit}>Lb</Text></Text>
                   <Text style={styles.weightLabel}>CURRENT</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                   <Text style={styles.weightVal}>70 <Text style={styles.weightUnit}>Lb</Text></Text>
                   <Text style={styles.weightLabel}>TARGET</Text>
                </View>
             </View>
             <View style={styles.goalProgressContainer}>
                <View style={[styles.goalFill, { width: '60%' }]} />
             </View>
             <Text style={styles.progressText}>60% of the way there. Keep going!</Text>
          </View>
          <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>Daily Nutrition Targets</Text>
             <Calculator size={20} color={Colors.primary} />
          </View>
          <View style={styles.targetsGrid}>
             {[
               { l: 'PROTEIN', v: '150g' }, { l: 'CALORIES', v: '2,000' },
               { l: 'CARBS', v: '180g' }, { l: 'FAT', v: '60g' }
             ].map((t, i) => (
               <View key={i} style={styles.targetBox}>
                  <Text style={styles.targetValue}>{t.v}</Text>
                  <Text style={styles.targetLabel}>{t.l}</Text>
               </View>
             ))}
          </View>
          <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>Dietary Preferences</Text>
             <Sliders size={20} color={Colors.primary} />
          </View>
          <View style={styles.chipsRow}>
             {['HIGH PROTEIN', 'LOW CARB', 'GLUTEN-FREE'].map(c => (
               <View key={c} style={styles.chip}><Text style={styles.chipText}>{c}</Text></View>
             ))}
          </View>
          <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>Library</Text>
          </View>
          <View style={styles.libraryRow}>
             <TouchableOpacity style={styles.libCard}>
                <View style={styles.libIconCircle}><Calendar size={24} color="#426D45" /></View>
                <Text style={styles.libText}>Meal Plans</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.libCard}>
                <View style={styles.libIconCircle}><Utensils size={24} color="#426D45" /></View>
                <Text style={styles.libText}>Saved Recipes</Text>
             </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.libWideCard} onPress={() => navigation.navigate("Pantry")}>
             <View style={styles.libIconCircle}><Package size={24} color="#426D45" /></View>
             <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.libText}>Pantry inventory</Text>
                <Text style={styles.libWideSub}>Manage what you have in stock</Text>
             </View>
             <ChevronLeft size={20} color="#CCC" style={{ transform: [{ rotate: '180deg'}] }} />
          </TouchableOpacity>
          <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>Smart Features</Text>
          </View>
          <View style={styles.featuresCard}>
             <View style={styles.featureRow}>
                <View style={[styles.featIcon, { backgroundColor: '#E8F5E9' }]}><Bell size={20} color="#426D45" /></View>
                <View style={styles.featInfo}>
                   <Text style={styles.featTitle}>Expiry Alerts</Text>
                   <Text style={styles.featSub}>Notify before ingredients go bad</Text>
                </View>
                <Switch value={expiryAlerts} onValueChange={setExpiryAlerts} trackColor={{ false: '#EEE', true: Colors.primary }} />
             </View>
             <View style={[styles.featureRow, { borderBottomWidth: 0 }]}>
                <View style={[styles.featIcon, { backgroundColor: '#E8F5E9' }]}><Zap size={20} color="#426D45" /></View>
                <View style={styles.featInfo}>
                   <Text style={styles.featTitle}>AI Meal Suggestions</Text>
                   <Text style={styles.featSub}>Personalized recipes based on pantry</Text>
                </View>
                <Switch value={mealSuggestions} onValueChange={setMealSuggestions} trackColor={{ false: '#EEE', true: Colors.primary }} />
             </View>
          </View>
          <TouchableOpacity style={styles.premiumBanner}>
             <Text style={styles.premiumBadge}>MONTHLY PLAN</Text>
             <Text style={styles.premiumTitle}>Nourish Premium</Text>
             <Text style={styles.premiumDesc}>Unlock detailed macros, offline lists, and priority AI chefs.</Text>
             <View style={styles.upgradeBtn}><Text style={styles.upgradeBtnText}>Upgrade to Yearly</Text></View>
          </TouchableOpacity>
          <Text style={styles.listSectionTitle}>PREFERENCES</Text>
          <TouchableOpacity 
            style={styles.listItem}
            onPress={() => navigation.navigate('Security')}
          >
             <Key size={20} color={Colors.primary} />
             <Text style={styles.listItemText}>Change Password</Text>
             <ChevronLeft size={20} color="#CCC" style={{ transform: [{ rotate: '180deg'}] }} />
          </TouchableOpacity>
          <Text style={styles.listSectionTitle}>SUPPORT</Text>
          <TouchableOpacity style={styles.listItem}>
             <FileText size={20} color={Colors.primary} />
             <Text style={styles.listItemText}>Terms of Service</Text>
             <ChevronLeft size={20} color="#CCC" style={{ transform: [{ rotate: '180deg'}] }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItem}>
             <Shield size={20} color={Colors.primary} />
             <Text style={styles.listItemText}>Privacy & Security</Text>
             <ChevronLeft size={20} color="#CCC" style={{ transform: [{ rotate: '180deg'}] }} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={async () => {
              await signOut();
              navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Welcome" }] }));
            }}
          >
             <LogOut size={20} color="#E57373" />
             <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 8, 
    paddingVertical: 12,
    height: 60,
  },
  backButton: { 
    width: 50, 
    height: 50, 
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 10,
  },
  headerTitleContainer: { 
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerTitle: { color: Colors.primary, fontSize: 18, fontFamily: 'Inter-Bold' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60 },
  userCard: { alignItems: 'center', marginVertical: 32 },
  avatarWrapper: { position: 'relative', width: 100, height: 100 },
  userAvatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#FFF' },
  userName: { color: Colors.primary, fontSize: 24, fontFamily: 'Inter-Bold', marginTop: 16 },
  editBtn: { 
    position: 'absolute', 
    right: 0, 
    bottom: 5, 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    backgroundColor: '#426D45', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 2, 
    borderColor: '#FFF',
    zIndex: 5,
  },
  goalCard: { backgroundColor: '#FFF', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: '#EEE', marginBottom: 32 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  goalLabel: { fontSize: 8, color: '#426D45', fontFamily: 'Inter-Bold', letterSpacing: 1, marginBottom: 4 },
  goalTitle: { fontSize: 22, color: Colors.primary, fontFamily: 'Inter-Bold' },
  weightRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  weightVal: { fontSize: 20, color: Colors.primary, fontFamily: 'Inter-Bold' },
  weightUnit: { fontSize: 12, color: '#999' },
  weightLabel: { fontSize: 8, color: '#999', fontFamily: 'Inter-Bold' },
  goalProgressContainer: { height: 8, backgroundColor: '#F5F5F5', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  goalFill: { height: '100%', backgroundColor: '#426D45', borderRadius: 4 },
  progressText: { fontSize: 12, color: '#666', fontFamily: 'Inter-Medium', textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, color: Colors.primary, fontFamily: 'Inter-Bold' },
  targetsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 32 },
  targetBox: { width: (width - 60) / 2, backgroundColor: '#FFF', padding: 20, borderRadius: 24, marginBottom: 20, borderWidth: 1, borderColor: '#EEE' },
  targetValue: { fontSize: 18, color: Colors.primary, fontFamily: 'Inter-Bold', marginBottom: 4 },
  targetLabel: { fontSize: 8, color: '#999', fontFamily: 'Inter-Bold' },
  chipsRow: { flexDirection: 'row', marginBottom: 32 },
  chip: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginRight: 10 },
  chipText: { color: '#426D45', fontSize: 10, fontFamily: 'Inter-Bold' },
  libraryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  libWideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  libWideSub: { fontSize: 11, color: '#999', fontFamily: 'Inter-Regular', marginTop: 4 },
  libCard: { width: (width - 60) / 2, backgroundColor: '#FFF', paddingVertical: 24, alignItems: 'center', borderRadius: 24, borderWidth: 1, borderColor: '#EEE' },
  libIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F9F9F9', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  libText: { fontSize: 12, color: Colors.primary, fontFamily: 'Inter-Bold' },
  featuresCard: { backgroundColor: '#FFF', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: '#EEE', marginBottom: 32 },
  featureRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  featIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  featInfo: { flex: 1 },
  featTitle: { fontSize: 16, color: Colors.primary, fontFamily: 'Inter-Bold' },
  featSub: { fontSize: 10, color: '#999', fontFamily: 'Inter-Regular' },
  premiumBanner: { backgroundColor: '#0D0D0D', borderRadius: 32, padding: 24, marginBottom: 32 },
  premiumBadge: { alignSelf: 'flex-start', color: '#426D45', fontSize: 8, fontFamily: 'Inter-Bold', letterSpacing: 1, marginBottom: 12 },
  premiumTitle: { fontSize: 20, color: '#FFF', fontFamily: 'Inter-Bold', marginBottom: 8 },
  premiumDesc: { fontSize: 12, color: '#999', fontFamily: 'Inter-Regular', lineHeight: 18, marginBottom: 24 },
  upgradeBtn: { backgroundColor: 'rgba(66, 109, 69, 0.4)', height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#426D45' },
  upgradeBtnText: { color: '#E8F5E9', fontSize: 16, fontFamily: 'Inter-Bold' },
  listSectionTitle: { fontSize: 10, color: '#999', fontFamily: 'Inter-Bold', letterSpacing: 1, marginBottom: 16 },
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 24, marginBottom: 20, borderWidth: 1, borderColor: '#EEE' },
  listItemText: { flex: 1, marginLeft: 16, color: Colors.primary, fontSize: 14, fontFamily: 'Inter-Bold' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFEBEE', padding: 20, borderRadius: 24, justifyContent: 'center', marginTop: 20 },
  logoutText: { color: '#E57373', fontSize: 16, fontFamily: 'Inter-Bold', marginLeft: 12 },
});
