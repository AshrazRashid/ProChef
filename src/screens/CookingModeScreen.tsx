import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, Clock, Flame, Utensils, Zap, Leaf, ShoppingBag, ArrowRight } from 'lucide-react-native';
import { Colors } from '../constants/theme';
import { apiJson } from '../api/client';
import {
  RecipeDetail,
  RecipeListItem,
  buildCookingSteps,
  groupIngredientsByCategory,
  recipePlaceholderImage,
  totalMinutes,
  formatDifficulty,
  matchPercent
} from '../api/recipes';

const { width } = Dimensions.get('window');

function categoryIcon(group: string) {
  const g = group.toUpperCase();
  if (g.includes('PROTEIN') || g.includes('MEAT') || g.includes('DAIRY') || g.includes('SEAFOOD')) {
    return <Zap size={16} color={Colors.primary} />;
  }
  if (g.includes('VEGETABLE') || g.includes('FRUIT') || g.includes('HERB') || g.includes('PRODUCE')) {
    return <Leaf size={16} color={Colors.primary} />;
  }
  return <Utensils size={16} color={Colors.primary} />;
}

function getMissingIngredients(
  recipe: RecipeDetail,
  pantryIngredientIds: Set<string> | null
): { name: string; weight: string }[] {
  const required = recipe.ingredients.filter((ri) => !ri.optional);
  if (!recipe.pantryMatch || pantryIngredientIds === null) {
    return required.map((ri) => ({
      name: ri.ingredient.name,
      weight: `${ri.quantity} ${ri.unit}`
    }));
  }
  return required
    .filter((ri) => !pantryIngredientIds.has(ri.ingredient.id))
    .map((ri) => ({
      name: ri.ingredient.name,
      weight: `${ri.quantity} ${ri.unit}`
    }));
}

export const CookingModeScreen = ({ navigation }: any) => {
  const route = useRoute<any>();
  const routeRecipeId: string | undefined = route.params?.recipeId;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [recipeList, setRecipeList] = useState<RecipeListItem[]>([]);
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [pantryIds, setPantryIds] = useState<Set<string> | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingRecipe, setLoadingRecipe] = useState(false);

  const effectiveId = routeRecipeId ?? selectedId;

  const loadList = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await apiJson<{ items: RecipeListItem[] }>('/recipes', { method: 'GET' });
      setRecipeList(res.items ?? []);
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Could not load recipes';
      Alert.alert('Recipes', msg);
      setRecipeList([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadRecipe = useCallback(async (id: string) => {
    setLoadingRecipe(true);
    try {
      const [r, pantryRes] = await Promise.all([
        apiJson<RecipeDetail>(`/recipes/${id}`, { method: 'GET' }),
        apiJson<{ items: { ingredientId: string }[] }>('/pantry/items', { method: 'GET' }).catch(() => null)
      ]);
      setRecipe(r);
      if (pantryRes?.items) {
        setPantryIds(new Set(pantryRes.items.map((p) => p.ingredientId)));
      } else {
        setPantryIds(null);
      }
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Could not load recipe';
      Alert.alert('Recipe', msg);
      setRecipe(null);
      setPantryIds(null);
    } finally {
      setLoadingRecipe(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (effectiveId) {
        void loadRecipe(effectiveId);
      } else {
        setRecipe(null);
        void loadList();
      }
    }, [effectiveId, loadRecipe, loadList])
  );

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Main');
    }
  };

  if (!effectiveId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <ChevronLeft color={Colors.primary} size={28} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Cooking Mode</Text>
            <Text style={styles.headerSubtitle}>Pick a recipe</Text>
          </View>
        </View>
        {loadingList ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.pickerContent}>
            {recipeList.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.pickerRow}
                onPress={() => setSelectedId(item.id)}
              >
                <Image source={recipePlaceholderImage(item.title)} style={styles.pickerThumb} />
                <View style={styles.pickerInfo}>
                  <Text style={styles.pickerTitle}>{item.title}</Text>
                  <Text style={styles.pickerMeta}>
                    {totalMinutes(item)} mins · {formatDifficulty(item.difficulty)} · {matchPercent(item)}% match
                  </Text>
                </View>
                <ArrowRight size={18} color={Colors.primary} />
              </TouchableOpacity>
            ))}
            {!loadingList && recipeList.length === 0 ? (
              <Text style={styles.emptyText}>No recipes available.</Text>
            ) : null}
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }

  if (loadingRecipe || !recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <ChevronLeft color={Colors.primary} size={28} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Start Cooking</Text>
            <Text style={styles.headerSubtitle}>Loading…</Text>
          </View>
        </View>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const ingredientGroups = groupIngredientsByCategory(recipe.ingredients);
  const steps = buildCookingSteps(recipe);
  const missing = getMissingIngredients(recipe, pantryIds);
  const mins = totalMinutes(recipe);
  const diffLabel = formatDifficulty(recipe.difficulty).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <ChevronLeft color={Colors.primary} size={28} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{recipe.title}</Text>
          <Text style={styles.headerSubtitle}>Start Cooking</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={recipePlaceholderImage(recipe.title)} style={styles.mainImage} />
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{diffLabel}</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Clock size={16} color={Colors.primary} />
            <Text style={styles.statDetail}>{mins} mins</Text>
          </View>
        </View>
        <View style={styles.nutritionGrid}>
          <View style={styles.nutBox}>
            <Text style={styles.nutLabel}>CAL</Text>
            <Text style={styles.nutVal}>{recipe.caloriesPerServing ?? '—'}</Text>
          </View>
          <View style={styles.nutBox}>
            <Text style={styles.nutLabel}>PROT</Text>
            <Text style={styles.nutVal}>{recipe.proteinG != null ? `${Math.round(recipe.proteinG)}g` : '—'}</Text>
          </View>
          <View style={styles.nutBox}>
            <Text style={styles.nutLabel}>CARBS</Text>
            <Text style={styles.nutVal}>{recipe.carbsG != null ? `${Math.round(recipe.carbsG)}g` : '—'}</Text>
          </View>
          <View style={styles.nutBox}>
            <Text style={styles.nutLabel}>FAT</Text>
            <Text style={styles.nutVal}>{recipe.fatG != null ? `${Math.round(recipe.fatG)}g` : '—'}</Text>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        {ingredientGroups.map((group, idx) => (
          <View key={idx} style={styles.ingredientGroup}>
            <View style={styles.groupHeader}>
              {categoryIcon(group.group)}
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
            {step.tip ? (
              <View style={styles.tipBox}>
                <Flame size={16} color="#426D45" />
                <View style={styles.tipTextContent}>
                  <Text style={styles.tipTitle}>CHEF TIP</Text>
                  <Text style={styles.tipDesc}>{step.tip}</Text>
                </View>
              </View>
            ) : null}
          </View>
        ))}
        {missing.length > 0 ? (
          <View style={styles.neededSection}>
            <View style={styles.neededHeader}>
              <ShoppingBag size={20} color={Colors.primary} />
              <View style={styles.neededHeaderText}>
                <Text style={styles.neededTitle}>Needed Ingredients</Text>
                {recipe.pantryMatch ? (
                  <Text style={styles.neededSubtitle}>
                    {recipe.pantryMatch.missingCount} missing from your pantry
                  </Text>
                ) : null}
              </View>
            </View>
            {missing.map((item, idx) => (
              <View
                key={idx}
                style={[styles.neededItem, idx % 2 === 1 ? styles.premiumItem : { backgroundColor: '#F9F9F9' }]}
              >
                <View style={[styles.itemIconCircle, idx % 2 === 1 ? { backgroundColor: '#426D45' } : undefined]}>
                  <Image
                    source={require('../assets/icons/organic.png')}
                    style={[styles.itemIcon, idx % 2 === 1 ? { tintColor: '#FFF' } : undefined]}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.neededName}>{item.name}</Text>
                  <Text style={styles.neededSub}>{item.weight}</Text>
                </View>
                <TouchableOpacity style={styles.plusBtn} onPress={() => navigation.navigate('ShoppingList')}>
                  <ArrowRight size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('ShoppingList')}>
            <Text style={styles.primaryBtnText}>Add to Shopping List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={goBack}>
            <Text style={styles.secondaryBtnText}>Continue Anyway</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF' },
  backButton: { padding: 4, marginRight: 10 },
  headerTitle: { color: Colors.primary, fontSize: 16, fontFamily: 'Inter-Bold' },
  headerSubtitle: { color: '#999', fontSize: 10, fontFamily: 'Inter-Regular' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  pickerContent: { paddingHorizontal: 20, paddingBottom: 40 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 12,
    marginBottom: 12
  },
  pickerThumb: { width: 56, height: 56, borderRadius: 16 },
  pickerInfo: { flex: 1, marginLeft: 12 },
  pickerTitle: { color: '#1A1A1A', fontSize: 15, fontFamily: 'Inter-Bold' },
  pickerMeta: { color: '#999', fontSize: 12, fontFamily: 'Inter-Regular', marginTop: 4 },
  emptyText: { color: '#666', fontSize: 14, fontFamily: 'Inter-Regular', textAlign: 'center', marginTop: 24 },
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
  tipBox: { backgroundColor: '#F9F9F9', borderRadius: 16, padding: 16, flexDirection: 'row' },
  tipTextContent: { marginLeft: 12, flex: 1 },
  tipTitle: { color: '#426D45', fontSize: 10, fontFamily: 'Inter-Bold', marginBottom: 4 },
  tipDesc: { color: '#666', fontSize: 12, fontFamily: 'Inter-Regular', lineHeight: 18 },
  neededSection: { backgroundColor: '#FFF', borderRadius: 32, padding: 24, marginVertical: 24 },
  neededHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  neededHeaderText: { marginLeft: 10, flex: 1 },
  neededTitle: { color: Colors.primary, fontSize: 16, fontFamily: 'Inter-Bold' },
  neededSubtitle: { color: '#999', fontSize: 12, fontFamily: 'Inter-Regular', marginTop: 2 },
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
