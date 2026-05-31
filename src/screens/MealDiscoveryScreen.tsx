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
import { ChevronLeft, Filter, RotateCcw, Edit3, Bookmark } from 'lucide-react-native';
import { Colors } from '../constants/theme';
import { apiJson } from '../api/client';
import {
  RecipeListItem,
  recipePlaceholderImage,
  matchLabel,
  totalMinutes,
  formatDifficulty,
  matchPercent
} from '../api/recipes';

const { width } = Dimensions.get('window');

export const MealDiscoveryScreen = ({ navigation }: any) => {
  const [isMacroImpactEnabled, setIsMacroImpactEnabled] = useState(true);
  const [meals, setMeals] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiJson<{ items: RecipeListItem[] }>('/recipes', { method: 'GET' });
      const sorted = [...(res.items ?? [])].sort((a, b) => matchPercent(b) - matchPercent(a));
      setMeals(sorted);
    } catch {
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const top = meals[0];
  const rest = meals.slice(1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={Colors.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meal You Can Make</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter color="#333" size={20} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.aiBox}>
          <View style={styles.aiHeader}>
            <Image source={require('../assets/icons/creation.png')} style={styles.aiIcon} />
            <Text style={styles.aiBoxTitle}>AI INSIGHT</Text>
          </View>
          <Text style={styles.aiBoxDesc}>
            Based on your pantry, we found {meals.length} meal{meals.length === 1 ? '' : 's'} you can make.
          </Text>
          <View style={styles.aiButtons}>
            <TouchableOpacity style={styles.regenerateBtn} onPress={() => void load()}>
              <RotateCcw size={14} color={Colors.white} />
              <Text style={styles.regenerateText}>Regenerate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editListBtn} onPress={() => navigation.navigate('Pantry')}>
              <Edit3 size={14} color={Colors.primary} />
              <Text style={styles.editListText}>Edit List</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.optionsRow}>
          <View style={styles.switchRow}>
            <Switch
              value={isMacroImpactEnabled}
              onValueChange={setIsMacroImpactEnabled}
              trackColor={{ false: '#DDD', true: Colors.primary }}
            />
            <Text style={styles.switchLabel}>Show Macro Impact</Text>
          </View>
        </View>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : null}
        {top ? (
          <TouchableOpacity
            style={styles.mainCard}
            onPress={() => navigation.navigate('RecipeDetails', { recipeId: top.id })}
          >
            <View style={styles.imageContainer}>
              <Image source={recipePlaceholderImage(top.title)} style={styles.mainImage} />
              <View style={styles.matchBadge}>
                <Text style={styles.matchText}>{matchLabel(top)}</Text>
              </View>
            </View>
            <View style={styles.cardInfo}>
              <View style={styles.pillLabel}>
                <Text style={styles.pillText}>BEST MATCH FOR YOUR GOAL</Text>
              </View>
              <Text style={styles.mainTitle}>{top.title}</Text>
              <Text style={styles.mainDesc}>
                {top.description || 'Top pantry match from your available ingredients.'}
              </Text>
              {isMacroImpactEnabled ? (
                <View style={styles.nutritionGrid}>
                  {[
                    { label: 'Cals', value: top.caloriesPerServing != null ? String(top.caloriesPerServing) : '—' },
                    { label: 'Prot', value: top.proteinG != null ? `${Math.round(top.proteinG)}g` : '—' },
                    { label: 'Carb', value: top.carbsG != null ? `${Math.round(top.carbsG)}g` : '—' },
                    { label: 'Fat', value: top.fatG != null ? `${Math.round(top.fatG)}g` : '—' }
                  ].map((n) => (
                    <View key={n.label} style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>{n.label}</Text>
                      <Text style={styles.nutritionValue}>{n.value}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>{totalMinutes(top)} min</Text>
                <Text style={styles.metaText}>{formatDifficulty(top.difficulty)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : !loading ? (
          <Text style={styles.emptyText}>No recipes found. Add pantry items to get started.</Text>
        ) : null}
        {rest.map((meal) => (
          <TouchableOpacity
            key={meal.id}
            style={styles.horizontalCard}
            onPress={() => navigation.navigate('RecipeDetails', { recipeId: meal.id })}
          >
            <Image source={recipePlaceholderImage(meal.title)} style={styles.horizontalImage} />
            <View style={styles.horizontalContent}>
              <View style={styles.horizontalHeader}>
                <Text style={styles.horizontalMatch}>{matchLabel(meal)}</Text>
                <Bookmark size={16} color="#333" />
              </View>
              <Text style={styles.horizontalTitle}>{meal.title}</Text>
              {isMacroImpactEnabled ? (
                <View style={styles.horizontalStats}>
                  <Text style={styles.statVal}>{meal.caloriesPerServing ?? '—'}</Text>
                  <Text style={styles.statLabel}> CALS</Text>
                  <View style={styles.divider} />
                  <Text style={styles.statVal}>
                    {meal.proteinG != null ? `${Math.round(meal.proteinG)}g` : '—'}
                  </Text>
                  <Text style={styles.statLabel}> PROTEIN</Text>
                  <View style={styles.divider} />
                  <Text style={styles.statVal}>
                    {meal.carbsG != null ? `${Math.round(meal.carbsG)}g` : '—'}
                  </Text>
                  <Text style={styles.statLabel}> CARBS</Text>
                </View>
              ) : (
                <Text style={styles.metaText}>
                  {totalMinutes(meal)} min · {formatDifficulty(meal.difficulty)}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
        {rest.length > 0 ? (
          <TouchableOpacity style={styles.viewOtherBtn} onPress={() => navigation.navigate('Meals')}>
            <Text style={styles.viewOtherText}>View All Meals</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF' },
  backButton: { padding: 4 },
  headerTitle: { color: Colors.primary, fontSize: 18, fontFamily: 'Inter-Bold' },
  filterButton: { padding: 8 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  aiBox: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginTop: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#EEE' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  aiIcon: { width: 20, height: 20, marginRight: 8, tintColor: Colors.primary },
  aiBoxTitle: { color: '#999', fontSize: 10, fontFamily: 'Inter-Bold', letterSpacing: 1 },
  aiBoxDesc: { color: '#333', fontSize: 14, fontFamily: 'Inter-Regular', lineHeight: 22, marginBottom: 20 },
  aiButtons: { flexDirection: 'row' },
  regenerateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10 },
  regenerateText: { color: Colors.white, fontSize: 12, fontFamily: 'Inter-Bold', marginLeft: 6 },
  editListBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#EEE' },
  editListText: { color: Colors.primary, fontSize: 12, fontFamily: 'Inter-Bold', marginLeft: 6 },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 16 },
  switchRow: { flexDirection: 'row', alignItems: 'center' },
  switchLabel: { color: '#666', fontSize: 12, fontFamily: 'Inter-SemiBold', marginLeft: 8 },
  loadingBox: { paddingVertical: 32, alignItems: 'center' },
  emptyText: { color: '#666', fontFamily: 'Inter-Regular', fontSize: 14, marginBottom: 16 },
  mainCard: { backgroundColor: '#FFF', borderRadius: 32, overflow: 'hidden', marginBottom: 20, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#EEE' },
  imageContainer: { height: 240, width: '100%' },
  mainImage: { width: '100%', height: '100%' },
  matchBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  matchText: { color: Colors.white, fontSize: 10, fontFamily: 'Inter-Bold' },
  cardInfo: { padding: 20 },
  pillLabel: { alignSelf: 'flex-start', backgroundColor: 'rgba(66, 109, 69, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  pillText: { color: Colors.primary, fontSize: 8, fontFamily: 'Inter-Bold' },
  mainTitle: { color: '#1A1A1A', fontSize: 20, fontFamily: 'Inter-Bold', marginBottom: 8 },
  mainDesc: { color: '#666', fontSize: 13, fontFamily: 'Inter-Regular', lineHeight: 20, marginBottom: 20 },
  nutritionGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  nutritionItem: { alignItems: 'flex-start', backgroundColor: '#F9F9F9', padding: 10, borderRadius: 12, width: (width - 120) / 4 },
  nutritionLabel: { color: '#999', fontSize: 8, fontFamily: 'Inter-Bold', marginBottom: 4 },
  nutritionValue: { color: Colors.primary, fontSize: 14, fontFamily: 'Inter-Bold' },
  metaRow: { flexDirection: 'row', gap: 16 },
  metaText: { color: '#999', fontSize: 12, fontFamily: 'Inter-Medium' },
  horizontalCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 12, flexDirection: 'row', marginBottom: 16, borderWidth: 1, borderColor: '#EEE' },
  horizontalImage: { width: 100, height: 100, borderRadius: 20 },
  horizontalContent: { flex: 1, paddingLeft: 16, justifyContent: 'space-between' },
  horizontalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  horizontalMatch: { color: Colors.primary, fontSize: 10, fontFamily: 'Inter-Bold' },
  horizontalTitle: { color: '#1A1A1A', fontSize: 15, fontFamily: 'Inter-Bold' },
  horizontalStats: { flexDirection: 'row', alignItems: 'center' },
  divider: { width: 1, height: 12, backgroundColor: '#EEE', marginHorizontal: 10 },
  statVal: { color: '#1A1A1A', fontSize: 12, fontFamily: 'Inter-Bold' },
  statLabel: { color: '#999', fontSize: 8 },
  viewOtherBtn: { backgroundColor: Colors.primary, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  viewOtherText: { color: Colors.white, fontSize: 16, fontFamily: 'Inter-Bold' },
});
