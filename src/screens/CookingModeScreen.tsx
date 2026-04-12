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
import { ChevronLeft, Clock, Flame, Utensils, Zap, Leaf, ShoppingBag, ArrowRight } from 'lucide-react-native';
import { Colors } from '../constants/theme';
const { width } = Dimensions.get('window');

export const CookingModeScreen = ({ navigation }: any) => {
  const ingredients = [
    { group: 'PROTEIN', items: [{ name: 'Chicken breast', weight: '200g' }, { name: 'Eggs', weight: '2 units' }], icon: <Zap size={16} color={Colors.primary} /> },
    { group: 'VEGETABLES', items: [{ name: 'Spinach', weight: '' }, { name: 'Onion', weight: '' }], icon: <Leaf size={16} color={Colors.primary} /> },
    { group: 'BASE', items: [{ name: 'Whole-wheat Tortilla', weight: '' }], icon: <Utensils size={16} color={Colors.primary} /> },
  ];
  const steps = [
    { 
      number: '01', 
      label: 'PREPARATION', 
      title: 'Prepare Ingredients', 
      desc: 'Slice the <Text style={styles.boldText}>chicken</Text> into thin strips. Wash and roughly chop the <Text style={styles.boldText}>spinach</Text>. Thinly slice the <Text style={styles.boldText}>onion</Text> for quick searing.',
      tip: 'Cutting chicken evenly ensures all pieces cook at the same time and stay juicy.'
    },
    { 
      number: '02', 
      label: 'COOKING', 
      title: 'Cook Chicken', 
      desc: 'Heat a non-stick pan over medium-high heat. Add the chicken strips and cook until golden brown, about 6-8 minutes.',
      suggestion: 'Add a pinch of paprika for extra flavor'
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={Colors.primary} size={28} />
        </TouchableOpacity>
        <View>
           <Text style={styles.headerTitle}>Chicken Protein Wrap</Text>
           <Text style={styles.headerSubtitle}>Start Cooking</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Image */}
        <View style={styles.imageContainer}>
           <Image source={require('../assets/images/ProteinBowl.png')} style={styles.mainImage} />
           <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>EASY</Text>
           </View>
        </View>
        {/* Quick Stats */}
        <View style={styles.statsRow}>
           <View style={styles.statBox}>
              <Clock size={16} color={Colors.primary} />
              <Text style={styles.statDetail}>20 mins</Text>
           </View>
        </View>
        <View style={styles.nutritionGrid}>
           <View style={styles.nutBox}><Text style={styles.nutLabel}>CAL</Text><Text style={styles.nutVal}>420</Text></View>
           <View style={styles.nutBox}><Text style={styles.nutLabel}>PROT</Text><Text style={styles.nutVal}>45g</Text></View>
           <View style={styles.nutBox}><Text style={styles.nutLabel}>CARBS</Text><Text style={styles.nutVal}>30g</Text></View>
           <View style={styles.nutBox}><Text style={styles.nutLabel}>FAT</Text><Text style={styles.nutVal}>15g</Text></View>
        </View>
        {/* Ingredients Grouped */}
        <Text style={styles.sectionTitle}>Ingredients</Text>
        {ingredients.map((group, idx) => (
           <View key={idx} style={styles.ingredientGroup}>
              <View style={styles.groupHeader}>
                 {group.icon}
                 <Text style={styles.groupName}>{group.group}</Text>
              </View>
              {group.items.map((item, i) => (
                 <View key={i} style={styles.ingredientItem}>
                    <View style={styles.itemBullet} />
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.weight ? <Text style={styles.itemWeight}>{item.weight}</Text> : null}
                    <View style={styles.checkCircle} />
                 </View>
              ))}
           </View>
        ))}
        {/* Step by Step */}
        <Text style={styles.sectionTitle}>Step-by-Step</Text>
        {steps.map((step, idx) => (
           <View key={idx} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                 <Text style={styles.stepNumber}>{step.number}</Text>
                 <View style={styles.stepLabelBadge}>
                    <Text style={styles.stepLabelText}>{step.label}</Text>
                 </View>
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
              {step.tip && (
                <View style={styles.tipBox}>
                   <Flame size={16} color="#426D45" />
                   <View style={styles.tipTextContent}>
                      <Text style={styles.tipTitle}>CHEF TIP</Text>
                      <Text style={styles.tipDesc}>{step.tip}</Text>
                   </View>
                </View>
              )}
              {step.suggestion && (
                 <View style={styles.suggestionBox}>
                   <Zap size={16} color="#426D45" />
                   <Text style={styles.suggestionText}>Chef Suggestion: {step.suggestion}</Text>
                 </View>
              )}
           </View>
        ))}
        {/* Needed Ingredients */}
        <View style={styles.neededSection}>
           <View style={styles.neededHeader}>
              <ShoppingBag size={20} color={Colors.primary} />
              <Text style={styles.neededTitle}>Needed Ingredients</Text>
           </View>
           <View style={[styles.neededItem, { backgroundColor: '#F9F9F9' }]}>
              <View style={styles.itemIconCircle}>
                 <Image source={require('../assets/icons/onion.png')} style={styles.itemIcon} resizeMode="contain" />
              </View>
              <View style={styles.itemInfo}>
                 <Text style={styles.neededName}>Garlic</Text>
                 <Text style={styles.neededSub}>2 cloves required</Text>
              </View>
              <TouchableOpacity style={styles.plusBtn}>
                 <ArrowRight size={16} color={Colors.primary} />
              </TouchableOpacity>
           </View>
           <View style={[styles.neededItem, styles.premiumItem]}>
              <View style={[styles.itemIconCircle, { backgroundColor: '#426D45' }]}>
                 <Image source={require('../assets/icons/egg.png')} style={[styles.itemIcon, { tintColor: '#FFF' }]} resizeMode="contain" />
              </View>
              <View style={styles.itemInfo}>
                 <Text style={styles.neededName}>Parmesan</Text>
                 <Text style={styles.neededSub}>50g finely grated</Text>
              </View>
              <TouchableOpacity style={styles.plusBtn}>
                 <ArrowRight size={16} color={Colors.primary} />
              </TouchableOpacity>
           </View>
        </View>
        {/* Footer Buttons */}
        <View style={styles.footer}>
           <TouchableOpacity 
             style={styles.primaryBtn}
             onPress={() => navigation.navigate('ShoppingList')}
           >
              <Text style={styles.primaryBtnText}>Add to Shopping List</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Welcome')}>
              <Text style={styles.secondaryBtnText}>Continue Anyway</Text>
           </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
// ... styles remain the same (statDetail fix)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF' },
  backButton: { padding: 4, marginRight: 10 },
  headerTitle: { color: Colors.primary, fontSize: 16, fontFamily: 'Inter-Bold' },
  headerSubtitle: { color: '#999', fontSize: 10, fontFamily: 'Inter-Regular' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  imageContainer: { marginTop: 20, borderRadius: 32, overflow: 'hidden', height: 280 },
  mainImage: { width: '100%', height: '100%' },
  difficultyBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  difficultyText: { color: Colors.white, fontSize: 8, fontFamily: 'Inter-Bold' },
  statsRow: { marginTop: 20, backgroundColor: '#FFF', padding: 12, borderRadius: 20, alignSelf: 'flex-start' },
  statBox: { flexDirection: 'row', alignItems: 'center' },
  statDetail: { color: '#666', fontSize: 12, fontFamily: 'Inter-Bold', marginLeft: 8 },
  nutritionGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  nutBox: { backgroundColor: '#FFF', padding: 12, borderRadius: 16, width: (width - 72) / 4, alignItems: 'center' },
  nutLabel: { color: '#999', fontSize: 8, fontFamily: 'Inter-Bold', marginBottom: 4 },
  nutVal: { color: Colors.primary, fontSize: 14, fontFamily: 'Inter-Bold' },
  sectionTitle: { color: Colors.primary, fontSize: 18, fontFamily: 'Inter-Bold', marginVertical: 24 },
  ingredientGroup: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 16 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  groupName: { color: Colors.primary, fontSize: 12, fontFamily: 'Inter-Bold', marginLeft: 8, letterSpacing: 1 },
  ingredientItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  itemBullet: { width: 14, height: 14, borderRadius: 4, borderWidth: 1, borderColor: '#EEE', marginRight: 12 },
  itemName: { flex: 1, color: '#1A1A1A', fontSize: 14, fontFamily: 'Inter-Medium' },
  itemWeight: { color: '#999', fontSize: 12, marginRight: 12 },
  checkCircle: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#F5F5F5' },
  stepCard: { backgroundColor: '#FFF', borderRadius: 32, padding: 24, marginBottom: 16 },
  stepHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  stepNumber: { color: '#EEE', fontSize: 40, fontFamily: 'Inter-Bold' },
  stepLabelBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  stepLabelText: { color: '#426D45', fontSize: 8, fontFamily: 'Inter-Bold' },
  stepTitle: { color: '#1A1A1A', fontSize: 18, fontFamily: 'Inter-Bold', marginBottom: 12 },
  stepDesc: { color: '#666', fontSize: 14, fontFamily: 'Inter-Regular', lineHeight: 22, marginBottom: 20 },
  boldText: { fontFamily: 'Inter-Bold', color: '#426D45' },
  tipBox: { backgroundColor: '#F9F9F9', borderRadius: 16, padding: 16, flexDirection: 'row' },
  tipTextContent: { marginLeft: 12, flex: 1 },
  tipTitle: { color: '#426D45', fontSize: 10, fontFamily: 'Inter-Bold', marginBottom: 4 },
  tipDesc: { color: '#666', fontSize: 12, fontFamily: 'Inter-Regular', lineHeight: 18 },
  suggestionBox: { flexDirection: 'row', alignItems: 'center', marginTop: 16, backgroundColor: 'rgba(66, 109, 69, 0.05)', padding: 12, borderRadius: 12 },
  suggestionText: { color: '#426D45', fontSize: 12, fontFamily: 'Inter-Medium', marginLeft: 8 },
  neededSection: { backgroundColor: '#FFF', borderRadius: 32, padding: 24, marginVertical: 24 },
  neededHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  neededTitle: { color: Colors.primary, fontSize: 16, fontFamily: 'Inter-Bold', marginLeft: 10 },
  neededItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 16 },
  premiumItem: { borderWidth: 1, borderColor: '#426D45', backgroundColor: '#FFF' },
  itemIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  itemIcon: { width: 28, height: 28 },
  itemInfo: { flex: 1, marginLeft: 16 },
  neededName: { color: '#1A1A1A', fontSize: 16, fontFamily: 'Inter-Bold' },
  neededSub: { color: '#999', fontSize: 12, fontFamily: 'Inter-Regular' },
  plusBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  footer: { marginTop: 10 },
  primaryBtn: { backgroundColor: Colors.primary, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  primaryBtnText: { color: Colors.white, fontSize: 16, fontFamily: 'Inter-Bold' },
  secondaryBtn: { backgroundColor: '#333', height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  secondaryBtnText: { color: Colors.white, fontSize: 16, fontFamily: 'Inter-Bold' },
});
