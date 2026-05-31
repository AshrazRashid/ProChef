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
  Switch,
  ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, Filter, Clock, ChefHat, Plus } from 'lucide-react-native';
import { Colors } from '../constants/theme';
import { apiJson } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  RecipeListItem,
  recipePlaceholderImage,
  matchLabel,
  totalMinutes,
  formatDifficulty,
  matchPercent
} from '../api/recipes';

const { width } = Dimensions.get('window');

type MealCard = RecipeListItem & { isLarge?: boolean };

export const MealsScreen = ({ navigation }: any) => {
  const { hasPro } = useAuth();
  const [isMacroImpactEnabled, setIsMacroImpactEnabled] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [meals, setMeals] = useState<MealCard[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!hasPro) {
      navigation.replace('PremiumAccess');
      return;
    }
    setLoading(true);
    try {
      const res = await apiJson<{ items: RecipeListItem[] }>('/recipes', { method: 'GET' });
      const sorted = [...(res.items ?? [])].sort((a, b) => matchPercent(b) - matchPercent(a));
      setMeals(
        sorted.map((item, idx) => ({
          ...item,
          isLarge: idx === 0 && sorted.length > 0
        }))
      );
    } catch (e: unknown) {
      const status = e && typeof e === 'object' && 'status' in e ? (e as { status: number }).status : 0;
      if (status === 402) {
        navigation.replace('PremiumAccess');
      }
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, [hasPro, navigation]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={Colors.white} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meals You Can Make</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter color={Colors.secondary} size={20} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {['All', 'High Protein', 'Low Calorie', 'Keto', 'Vegan'].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={[styles.chip, selectedFilter === filter && styles.chipActive]}
            >
              <Text style={[styles.chipText, selectedFilter === filter && styles.chipTextActive]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.macroHeader}>
          <View>
            <Text style={styles.macroTitlePrimary}>RECOMMENDED FOR</Text>
            <Text style={styles.macroTitleSecondary}>YOU</Text>
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Show Macro {'\n'}Impact</Text>
            <Switch
              value={isMacroImpactEnabled}
              onValueChange={setIsMacroImpactEnabled}
              trackColor={{ false: '#333', true: Colors.secondary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.secondary} />
            <Text style={styles.loadingText}>Loading recipes from your pantry…</Text>
          </View>
        ) : null}
        {meals.map((meal) => (
          <TouchableOpacity
            key={meal.id}
            style={meal.isLarge ? styles.largeCard : styles.smallCard}
            onPress={() => navigation.navigate('RecipeDetails', { recipeId: meal.id })}
          >
            <View style={meal.isLarge ? styles.imageContainerLarge : styles.imageContainerSmall}>
              <Image source={recipePlaceholderImage(meal.title)} style={styles.image} />
              <View style={styles.matchBadge}>
                {meal.isLarge ? (
                  <Image source={require('../assets/icons/tick.png')} style={styles.matchIcon} />
                ) : null}
                <Text style={styles.matchText}>{matchLabel(meal)}</Text>
              </View>
            </View>
            <View style={styles.cardContent}>
              {meal.isLarge ? (
                <View style={styles.pillLabel}>
                  <Text style={styles.pillText}>BEST MATCH FOR YOUR GOAL</Text>
                </View>
              ) : null}
              <Text style={meal.isLarge ? styles.largeTitle : styles.smallTitle}>{meal.title}</Text>
              {meal.isLarge ? (
                <Text style={styles.largeDesc}>
                  {meal.description || 'A pantry-friendly meal matched to what you have on hand.'}
                </Text>
              ) : null}
              {isMacroImpactEnabled ? (
                <View style={styles.nutritionRow}>
                  {meal.isLarge ? (
                    <View style={styles.nutritionGrid}>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutVal}>{meal.caloriesPerServing ?? '—'}</Text>
                        <Text style={styles.nutLab}>CALS</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutVal}>
                          {meal.proteinG != null ? `${Math.round(meal.proteinG)}g` : '—'}
                        </Text>
                        <Text style={styles.nutLab}>PROT</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutVal}>
                          {meal.carbsG != null ? `${Math.round(meal.carbsG)}g` : '—'}
                        </Text>
                        <Text style={styles.nutLab}>CARB</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutVal}>
                          {meal.fatG != null ? `${Math.round(meal.fatG)}g` : '—'}
                        </Text>
                        <Text style={styles.nutLab}>FAT</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.statsRow}>
                      <View>
                        <Text style={styles.statLabel}>ENERGY</Text>
                        <Text style={styles.statValue}>{meal.caloriesPerServing ?? '—'} kcal</Text>
                      </View>
                      <View>
                        <Text style={styles.statLabel}>PROTEIN</Text>
                        <Text style={styles.statValue}>
                          {meal.proteinG != null ? `${Math.round(meal.proteinG)}g` : '—'}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.statLabel}>CARBS</Text>
                        <Text style={styles.statValue}>
                          {meal.carbsG != null ? `${Math.round(meal.carbsG)}g` : '—'}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ) : null}
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Clock size={14} color="#666" />
                  <Text style={styles.metaText}>{totalMinutes(meal)}m</Text>
                </View>
                <View style={styles.metaItem}>
                  <ChefHat size={14} color="#666" />
                  <Text style={styles.metaText}>{formatDifficulty(meal.difficulty)}</Text>
                </View>
                {meal.isLarge ? (
                  <View style={styles.addButton}>
                    <Plus color={Colors.white} size={20} />
                  </View>
                ) : (
                  <Text style={styles.viewRecipeText}>View Recipe →</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {!loading && meals.length === 0 ? (
          <Text style={styles.emptyText}>No recipes found. Add items to your pantry first.</Text>
        ) : null}
        <TouchableOpacity style={styles.bottomButton} onPress={() => navigation.navigate('MealDiscovery')}>
          <Text style={styles.bottomButtonText}>Update Meal</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
  backButton: { padding: 4 },
  headerTitle: { color: Colors.white, fontSize: 18, fontFamily: 'Inter-Bold' },
  filterButton: { padding: 8, backgroundColor: '#1A1A1A', borderRadius: 8 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  chipScroll: { marginVertical: 15 },
  chip: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, backgroundColor: '#1A1A1A', marginRight: 10 },
  chipActive: { backgroundColor: Colors.secondary },
  chipText: { color: '#666', fontSize: 14, fontFamily: 'Inter-Medium' },
  chipTextActive: { color: Colors.background, fontFamily: 'Inter-Bold' },
  macroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  macroTitlePrimary: { color: Colors.white, fontSize: 14, fontFamily: 'Inter-Bold', letterSpacing: 1 },
  macroTitleSecondary: { color: Colors.white, fontSize: 14, fontFamily: 'Inter-Bold', letterSpacing: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center' },
  switchLabel: { color: '#666', fontSize: 10, fontFamily: 'Inter-Bold', textAlign: 'right', marginRight: 10 },
  loadingBox: { paddingVertical: 40, alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#666', fontFamily: 'Inter-Regular', fontSize: 13 },
  emptyText: { color: '#666', fontFamily: 'Inter-Regular', fontSize: 14, marginBottom: 16 },
  largeCard: { backgroundColor: '#1A1A1A', borderRadius: 32, overflow: 'hidden', marginBottom: 24, borderWidth: 1, borderColor: '#333' },
  smallCard: { backgroundColor: '#1A1A1A', borderRadius: 24, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: '#333' },
  imageContainerLarge: { height: 280, width: '100%' },
  imageContainerSmall: { height: 180, width: '100%' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  matchBadge: { position: 'absolute', top: 20, left: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  matchIcon: { width: 14, height: 14, marginRight: 6, tintColor: Colors.secondary },
  matchText: { color: Colors.background, fontSize: 10, fontFamily: 'Inter-Bold' },
  cardContent: { padding: 24 },
  pillLabel: { alignSelf: 'flex-start', backgroundColor: 'rgba(66, 109, 69, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  pillText: { color: Colors.secondary, fontSize: 8, fontFamily: 'Inter-Bold' },
  largeTitle: { color: Colors.white, fontSize: 22, fontFamily: 'Inter-Bold', marginBottom: 12 },
  smallTitle: { color: Colors.white, fontSize: 18, fontFamily: 'Inter-Bold', marginBottom: 16 },
  largeDesc: { color: Colors.textSecondary, fontSize: 12, fontFamily: 'Inter-Regular', lineHeight: 18, marginBottom: 20 },
  nutritionRow: { marginBottom: 20 },
  nutritionGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  nutritionItem: { alignItems: 'center' },
  nutVal: { color: Colors.secondary, fontSize: 20, fontFamily: 'Inter-Bold' },
  nutLab: { color: '#666', fontSize: 10, fontFamily: 'Inter-Bold' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { color: '#666', fontSize: 8, fontFamily: 'Inter-Bold', marginBottom: 4 },
  statValue: { color: Colors.white, fontSize: 14, fontFamily: 'Inter-Bold' },
  metaRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#262626', paddingTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  metaText: { color: '#666', fontSize: 12, fontFamily: 'Inter-Medium', marginLeft: 6 },
  addButton: { marginLeft: 'auto', width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center' },
  viewRecipeText: { marginLeft: 'auto', color: Colors.secondary, fontSize: 10, fontFamily: 'Inter-Bold' },
  bottomButton: { backgroundColor: Colors.primary, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  bottomButtonText: { color: Colors.white, fontSize: 18, fontFamily: 'Inter-SemiBold' },
});
