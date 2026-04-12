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
import { ChevronLeft, Timer, ChevronRight, Zap } from 'lucide-react-native';
import { Colors } from '../constants/theme';
const { width } = Dimensions.get('window');

export const ExpirationAlertScreen = ({ navigation }: any) => {
  const suggestedMeals = [
    {
      title: 'Spinach & Feta Omelette',
      desc: 'A fluffy three-egg omelette stuffed with sautéed baby spinach and creamy Greek...',
      time: '12 MIN',
      badges: ['BREAKFAST', 'LOW CARB'],
      image: require('../assets/images/SpinachOmelette.png'),
    },
    {
      title: 'Green Power Smoothie',
      desc: 'Blend spinach with green apple, ginger and coconut water for an instant vitality boost.',
      time: '',
      badges: ['SNACK', 'VEGAN'],
      specialBadge: 'HIGH ENERGY',
      image: require('../assets/images/GreenPowerSmoothie.png'),
    }
  ];
  const alsoExpiring = [
    { name: 'Greek Yogurt', timeLeft: '4 DAYS LEFT', icon: require('../assets/icons/egg.png') },
    { name: 'Almond Milk', timeLeft: '6 DAYS LEFT', icon: require('../assets/icons/herb.png') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Main')} style={styles.backButton}>
          <ChevronLeft color={Colors.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expiration Alert</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Warning Card */}
        <View style={styles.warningCard}>
           <View style={styles.iconCircle}>
              <Timer size={24} color="#E57373" />
           </View>
           <View style={styles.warningTextContent}>
              <Text style={styles.warningLabel}>EXPIRATION ALERT</Text>
              <Text style={styles.warningMain}>Your spinach expires in 2 days</Text>
              <Text style={styles.warningSub}>Save money and reduce waste by using your 500g bag of Baby Spinach today.</Text>
           </View>
        </View>
        {/* Suggested Meals */}
        <View style={styles.sectionHeader}>
           <View>
              <Text style={styles.sectionTitle}>Suggested Meals</Text>
              <Text style={styles.sectionSubtitle}>Hand-picked recipes for your spinach</Text>
           </View>
           <View style={styles.recipeIconCircle}><Zap size={16} color={Colors.primary} /></View>
        </View>
        {suggestedMeals.map((meal, idx) => (
           <View key={idx} style={styles.mealCard}>
              <View style={styles.imageContainer}>
                 <Image source={meal.image} style={styles.mealImage} />
                 {meal.time ? (
                    <View style={styles.timeBadge}>
                       <Timer size={12} color="#FFF" />
                       <Text style={styles.timeText}>{meal.time}</Text>
                    </View>
                 ) : null}
                 {meal.specialBadge ? (
                    <View style={styles.specialBadge}>
                       <Zap size={12} color="#FFF" />
                       <Text style={styles.specialBadgeText}>{meal.specialBadge}</Text>
                    </View>
                 ) : null}
              </View>
              <View style={styles.cardContent}>
                 <View style={styles.badgeRow}>
                    {meal.badges.map(b => (
                       <View key={b} style={styles.badge}><Text style={styles.badgeText}>{b}</Text></View>
                    ))}
                 </View>
                 <Text style={styles.mealTitle}>{meal.title}</Text>
                 <Text style={styles.mealDesc}>{meal.desc}</Text>
                 <TouchableOpacity 
                   style={styles.cookNowBtn}
                   onPress={() => navigation.navigate('Cooking')}
                 >
                    <Text style={styles.cookNowText}>Cook Now</Text>
                 </TouchableOpacity>
              </View>
           </View>
        ))}
        {/* Also Expiring Soon */}
        <Text style={styles.expiringTitle}>Also Expiring Soon</Text>
        <View style={styles.expiringList}>
           {alsoExpiring.map((item, idx) => (
             <TouchableOpacity key={idx} style={styles.expiringItem}>
                <View style={styles.itemIconCircle}><Image source={item.icon} style={styles.itemIcon} /></View>
                <View style={styles.itemInfo}>
                   <Text style={styles.itemName}>{item.name}</Text>
                   <Text style={styles.itemDays}>{item.timeLeft}</Text>
                </View>
                <ChevronRight size={20} color="#CCC" />
             </TouchableOpacity>
           ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { padding: 4, marginRight: 10 },
  headerTitle: { color: Colors.primary, fontSize: 18, fontFamily: 'Inter-Bold' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  warningCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, flexDirection: 'row', marginTop: 20, borderWidth: 1, borderColor: '#EEE' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  warningTextContent: { flex: 1 },
  warningLabel: { color: '#999', fontSize: 10, fontFamily: 'Inter-Bold', letterSpacing: 1, marginBottom: 4 },
  warningMain: { color: Colors.primary, fontSize: 16, fontFamily: 'Inter-Bold', marginBottom: 6 },
  warningSub: { color: '#666', fontSize: 12, fontFamily: 'Inter-Regular', lineHeight: 18 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, marginBottom: 20 },
  sectionTitle: { color: Colors.primary, fontSize: 18, fontFamily: 'Inter-Bold' },
  sectionSubtitle: { color: '#999', fontSize: 12, fontFamily: 'Inter-Regular' },
  recipeIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  mealCard: { backgroundColor: '#FFF', borderRadius: 32, overflow: 'hidden', marginBottom: 24, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  imageContainer: { height: 180, width: '100%' },
  mealImage: { width: '100%', height: '100%' },
  timeBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  timeText: { color: '#FFF', fontSize: 10, fontFamily: 'Inter-Bold', marginLeft: 6 },
  specialBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.8)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  specialBadgeText: { color: '#FFF', fontSize: 10, fontFamily: 'Inter-Bold', marginLeft: 6 },
  cardContent: { padding: 20 },
  badgeRow: { flexDirection: 'row', marginBottom: 12 },
  badge: { backgroundColor: '#F5F5F5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginRight: 8 },
  badgeText: { color: '#426D45', fontSize: 8, fontFamily: 'Inter-Bold' },
  mealTitle: { color: Colors.primary, fontSize: 20, fontFamily: 'Inter-Bold', marginBottom: 8 },
  mealDesc: { color: '#999', fontSize: 13, fontFamily: 'Inter-Regular', lineHeight: 20, marginBottom: 20 },
  cookNowBtn: { backgroundColor: '#426D45', height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  cookNowText: { color: '#FFF', fontSize: 16, fontFamily: 'Inter-Bold' },
  expiringTitle: { color: Colors.primary, fontSize: 18, fontFamily: 'Inter-Bold', marginTop: 10, marginBottom: 20 },
  expiringList: { backgroundColor: '#FFF', borderRadius: 24, padding: 16 },
  expiringItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  itemIconCircle: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F9F9F9', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  itemIcon: { width: 24, height: 24, tintColor: Colors.primary },
  itemInfo: { flex: 1 },
  itemName: { color: Colors.primary, fontSize: 14, fontFamily: 'Inter-Bold' },
  itemDays: { color: '#999', fontSize: 10, fontFamily: 'Inter-Medium', marginTop: 2 },
});
