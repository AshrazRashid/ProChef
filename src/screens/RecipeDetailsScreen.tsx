import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  Dimensions,
  ImageBackground
} from 'react-native';
import { ChevronLeft, Clock, Flame, Star, Users, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '../constants/theme';

const { width } = Dimensions.get('window');

export const RecipeDetailsScreen = ({ navigation }: any) => {
  const nutrition = [
    { label: 'PROTEIN', value: '32g', color: '#E8F5E9', barColor: '#426D45' },
    { label: 'CARBS', value: '45g', color: '#FFF3E0', barColor: '#FF9800' },
    { label: 'FATS', value: '22g', color: '#E3F2FD', barColor: '#2196F3' },
    { label: 'FIBER', value: '8g', color: '#F3E5F5', barColor: '#9C27B0' },
  ];

  const ingredients = [
    { name: 'Fresh Salmon Fillets', amount: '2 pieces', icon: require('../assests/icons/salmonFillets.png') },
    { name: 'Organic Quinoa', amount: '1 cup', icon: require('../assests/icons/organic.png') },
    { name: 'Cucumber & Cherry Tomatoes', amount: '2 cups', icon: require('../assests/icons/herb.png') },
    { name: 'Lemon Herb Tahini', amount: '3 tbsp', icon: require('../assests/icons/eating.png') },
  ];

  const preparation = [
    { title: 'Prepare Quinoa Base', desc: 'Rinse the quinoa and cook in water or vegetable broth for 15 minutes until fluffy. Season with a pinch of sea salt.' },
    { title: 'Sear the Salmon', desc: 'Season salmon with lemon zest and pepper. Sear in a hot skillet for 4 minutes per side until the skin is crispy and the interior is tender.' },
    { title: 'Assemble the Bowl', desc: 'Divide quinoa into bowls. Top with sliced cucumbers, tomatoes, and the salmon fillet. Drizzle generously with tahini dressing.' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Image */}
        <ImageBackground 
          source={require('../assests/images/MediterraneanSalmonBowl.png')} 
          style={styles.heroImage}
        >
          <SafeAreaView>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <ChevronLeft color={Colors.white} size={28} />
            </TouchableOpacity>
          </SafeAreaView>
          
          <View style={styles.heroOverlay}>
             <View style={styles.typeBadge}>
               <Text style={styles.typeText}>MEDITERRANEAN</Text>
             </View>
             <Text style={styles.recipeTitle}>Mediterranean Salmon Bowl</Text>
          </View>
        </ImageBackground>

        <View style={styles.content}>
           {/* Quick Stats Row */}
           <View style={styles.statsRow}>
              <View style={styles.statBox}>
                 <Clock color={Colors.primary} size={20} />
                 <Text style={styles.statValue}>25m</Text>
                 <Text style={styles.statLabel}>TOTAL TIME</Text>
              </View>
              <View style={styles.statBox}>
                 <Flame color={Colors.primary} size={20} />
                 <Text style={styles.statValue}>540</Text>
                 <Text style={styles.statLabel}>CALORIES</Text>
              </View>
              <View style={styles.statBox}>
                 <Star color={Colors.primary} size={20} fill={Colors.primary} />
                 <Text style={styles.statValue}>4.9</Text>
                 <Text style={styles.statLabel}>RATING</Text>
              </View>
           </View>

           {/* Nutritional Pulse */}
           <Text style={styles.sectionTitle}>Nutritional Pulse</Text>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.nutritionScroll}>
              {nutrition.map((item, index) => (
                <View key={index} style={[styles.nutritionCard, { backgroundColor: item.color }]}>
                   <Text style={styles.nutLabelSmall}>{item.label}</Text>
                   <Text style={styles.nutValueLarge}>{item.value}</Text>
                   <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { backgroundColor: item.barColor, width: '70%' }]} />
                   </View>
                </View>
              ))}
           </ScrollView>

           {/* Ingredients */}
           <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <Text style={styles.servingText}>2 Servings</Text>
           </View>
           
           {ingredients.map((item, index) => (
             <View key={index} style={styles.ingredientItem}>
                <View style={styles.ingredientIconContainer}>
                   <Image source={item.icon} style={styles.ingredientIcon} resizeMode="contain" />
                </View>
                <Text style={styles.ingredientName}>{item.name}</Text>
                <Text style={styles.ingredientAmount}>{item.amount}</Text>
             </View>
           ))}

           {/* Preparation */}
           <Text style={styles.sectionTitle}>Preparation</Text>
           <View style={styles.preparationContainer}>
              {preparation.map((step, index) => (
                <View key={index} style={styles.prepStep}>
                   <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                   </View>
                   <View style={styles.stepTextContent}>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      <Text style={styles.stepDesc}>{step.desc}</Text>
                   </View>
                </View>
              ))}
           </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <SafeAreaView style={styles.footer}>
         <TouchableOpacity 
           style={styles.variationsButton}
           onPress={() => navigation.navigate('CustomMeal')}
         >
            <Text style={styles.variationsText}>Meal Variations</Text>
         </TouchableOpacity>
         <TouchableOpacity 
           style={styles.cookingButton}
           onPress={() => navigation.navigate('CookingMode')}
         >
            <Text style={styles.cookingText}>Start Cooking Mode</Text>
         </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  heroImage: {
    width: '100%',
    height: 380,
    justifyContent: 'space-between',
  },
  backButton: {
    margin: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.0)',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  typeText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  recipeTitle: {
    color: Colors.white,
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  content: {
    padding: 24,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statBox: {
    width: (width - 72) / 3,
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  statValue: {
    color: '#1A1A1A',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginVertical: 4,
  },
  statLabel: {
    color: '#999',
    fontSize: 8,
    fontFamily: 'Inter-Bold',
  },
  sectionTitle: {
    color: Colors.primary,
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  nutritionScroll: {
    marginBottom: 32,
  },
  nutritionCard: {
    width: 90,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
  },
  nutLabelSmall: {
    fontSize: 8,
    fontFamily: 'Inter-Bold',
    color: '#666',
    marginBottom: 4,
  },
  nutValueLarge: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  servingText: {
    color: Colors.primary,
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 16,
  },
  ingredientIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  ingredientIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.white,
  },
  ingredientName: {
    flex: 1,
    color: '#1A1A1A',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  ingredientAmount: {
    color: '#999',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  preparationContainer: {
    paddingBottom: 20,
  },
  prepStep: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#426D45',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  stepTextContent: {
    flex: 1,
  },
  stepTitle: {
    color: '#1A1A1A',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  stepDesc: {
    color: '#666',
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    backgroundColor: '#FFF',
  },
  variationsButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  variationsText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  cookingButton: {
    flex: 1.5,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cookingText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
});
