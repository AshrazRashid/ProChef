import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Dimensions,
  ImageBackground,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { ChevronLeft, Clock, Flame, Star, Users, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '../constants/theme';
import { apiJson } from '../api/client';
const { width } = Dimensions.get('window');

type RecipeApi = {
  id: string;
  title: string;
  description: string;
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  caloriesPerServing: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  ingredients: { quantity: number; unit: string; optional: boolean; ingredient: { name: string } }[];
};

export const RecipeDetailsScreen = ({ navigation }: any) => {
  const route = useRoute<any>();
  const recipeId: string | undefined = route.params?.recipeId;
  const [recipe, setRecipe] = useState<RecipeApi | null>(null);
  const [loading, setLoading] = useState(false);
  const [logging, setLogging] = useState(false);

  const load = useCallback(async () => {
    if (!recipeId) {
      return;
    }
    setLoading(true);
    try {
      const r = await apiJson<RecipeApi>(`/recipes/${recipeId}`, { method: "GET" });
      setRecipe(r);
    } catch {
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    void load();
  }, [load]);

  const nutrition = recipe
    ? [
        { label: 'PROTEIN', value: recipe.proteinG != null ? `${Math.round(recipe.proteinG)}g` : '—', color: '#E8F5E9', barColor: '#426D45' },
        { label: 'CARBS', value: recipe.carbsG != null ? `${Math.round(recipe.carbsG)}g` : '—', color: '#FFF3E0', barColor: '#FF9800' },
        { label: 'FATS', value: recipe.fatG != null ? `${Math.round(recipe.fatG)}g` : '—', color: '#E3F2FD', barColor: '#2196F3' },
        { label: 'CALORIES', value: recipe.caloriesPerServing != null ? `${recipe.caloriesPerServing}` : '—', color: '#F3E5F5', barColor: '#9C27B0' },
      ]
    : [
    { label: 'PROTEIN', value: '32g', color: '#E8F5E9', barColor: '#426D45' },
    { label: 'CARBS', value: '45g', color: '#FFF3E0', barColor: '#FF9800' },
    { label: 'FATS', value: '22g', color: '#E3F2FD', barColor: '#2196F3' },
    { label: 'FIBER', value: '8g', color: '#F3E5F5', barColor: '#9C27B0' },
  ];

  const ingredients =
    recipe?.ingredients?.map((ri) => ({
      name: ri.ingredient.name,
      amount: `${ri.quantity} ${ri.unit}`,
      icon: require('../assets/icons/organic.png')
    })) ?? [
    { name: 'Fresh Salmon Fillets', amount: '2 pieces', icon: require('../assets/icons/salmonFillets.png') },
    { name: 'Organic Quinoa', amount: '1 cup', icon: require('../assets/icons/organic.png') },
    { name: 'Cucumber & Cherry Tomatoes', amount: '2 cups', icon: require('../assets/icons/herb.png') },
    { name: 'Lemon Herb Tahini', amount: '3 tbsp', icon: require('../assets/icons/eating.png') },
  ];

  const preparation = recipe
    ? [{ title: 'Recipe', desc: recipe.description || 'Follow packaging for best results.' }]
    : [
    { title: 'Prepare Quinoa Base', desc: 'Rinse the quinoa and cook in water or vegetable broth for 15 minutes until fluffy. Season with a pinch of sea salt.' },
    { title: 'Sear the Salmon', desc: 'Season salmon with lemon zest and pepper. Sear in a hot skillet for 4 minutes per side until the skin is crispy and the interior is tender.' },
    { title: 'Assemble the Bowl', desc: 'Divide quinoa into bowls. Top with sliced cucumbers, tomatoes, and the salmon fillet. Drizzle generously with tahini dressing.' },
  ];

  const title = recipe?.title ?? 'Recipe';
  const totalMin = recipe ? recipe.prepMinutes + recipe.cookMinutes : 25;
  const cals = recipe?.caloriesPerServing ?? 540;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Image */}
        <ImageBackground 
          source={require('../assets/images/MediterraneanSalmonBowl.png')} 
          style={styles.heroImage}
        >
          <SafeAreaView>
            <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Main')} style={styles.backButton}>
              <ChevronLeft color={Colors.white} size={28} />
            </TouchableOpacity>
          </SafeAreaView>
          <View style={styles.heroOverlay}>
             <View style={styles.typeBadge}>
               <Text style={styles.typeText}>MEDITERRANEAN</Text>
             </View>
             <Text style={styles.recipeTitle}>{title}</Text>
          </View>
        </ImageBackground>
        <View style={styles.content}>
           {loading ? (
             <View style={{ paddingVertical: 24, alignItems: 'center' }}>
               <ActivityIndicator color={Colors.primary} />
             </View>
           ) : null}
           {/* Quick Stats Row */}
           <View style={styles.statsRow}>
              <View style={styles.statBox}>
                 <Clock color={Colors.primary} size={20} />
                 <Text style={styles.statValue}>{totalMin}m</Text>
                 <Text style={styles.statLabel}>TOTAL TIME</Text>
              </View>
              <View style={styles.statBox}>
                 <Flame color={Colors.primary} size={20} />
                 <Text style={styles.statValue}>{cals}</Text>
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
              <Text style={styles.servingText}>{recipe?.servings ?? 2} Servings</Text>
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
           style={[styles.variationsButton, { marginBottom: 10 }]}
           disabled={!recipe || logging}
           onPress={async () => {
             if (!recipe) {
               return;
             }
             setLogging(true);
             try {
               await apiJson("/tracking/meal-logs", {
                 method: "POST",
                 body: JSON.stringify({
                   recipeId: recipe.id,
                   label: recipe.title,
                   calories: recipe.caloriesPerServing ?? 0,
                   proteinG: recipe.proteinG ?? 0,
                   carbG: recipe.carbsG ?? 0,
                   fatG: recipe.fatG ?? 0
                 })
               });
               Alert.alert("Logged", "Meal added to today’s diary.");
             } catch (e: unknown) {
               const msg =
                 e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Could not log";
               Alert.alert("Meal log", msg);
             } finally {
               setLogging(false);
             }
           }}
         >
            <Text style={styles.variationsText}>{logging ? "Saving…" : "Log to today"}</Text>
         </TouchableOpacity>
         <TouchableOpacity 
           style={styles.variationsButton}
           onPress={() => navigation.navigate('CustomMeal')}
         >
            <Text style={styles.variationsText}>Meal Variations</Text>
         </TouchableOpacity>
         <TouchableOpacity 
           style={styles.cookingButton}
           onPress={() => navigation.navigate('Cooking')}
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
