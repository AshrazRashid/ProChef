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
import { ChevronLeft, Filter, Zap, Heart, Utensils, ChefHat, AlertCircle } from 'lucide-react-native';
import { Colors } from '../constants/theme';
import { apiJson } from '../api/client';
import { useAuth } from '../context/AuthContext';
const { width } = Dimensions.get('window');

type RecItem = {
  recipeId: string;
  score: number;
  recipe: {
    id: string;
    title: string;
    prepMinutes: number;
    cookMinutes: number;
    caloriesPerServing: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
  };
};

export const MealRecommendationsScreen = ({ navigation }: any) => {
  const { hasPro } = useAuth();
  const [showImpact, setShowImpact] = useState(true);
  const [items, setItems] = useState<RecItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!hasPro) {
      navigation.replace("PremiumAccess");
      return;
    }
    setLoading(true);
    try {
      const res = await apiJson<{ items: RecItem[] }>("/recommendations/meals", {
        method: "POST",
        body: JSON.stringify({ limit: 20 })
      });
      setItems(res.items ?? []);
    } catch (e: unknown) {
      const status = e && typeof e === "object" && "status" in e ? (e as { status: number }).status : 0;
      if (status === 402) {
        navigation.replace("PremiumAccess");
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [hasPro, navigation]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const top = items[0];
  const rest = items.slice(1);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={Colors.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meal Recommendations</Text>
        <TouchableOpacity style={styles.filterBtn}>
           <Filter color={Colors.primary} size={20} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Category Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
           {['ALL', 'HIGH PROTEIN', 'LOW CALORIE'].map((chip, idx) => (
             <TouchableOpacity key={idx} style={[styles.chip, idx === 0 && styles.chipActive]}>
                <Text style={[styles.chipText, idx === 0 && styles.chipTextActive]}>{chip}</Text>
             </TouchableOpacity>
           ))}
        </ScrollView>
        {/* Macro Visualizer Header */}
        <View style={styles.macroHeader}>
           <Text style={styles.macroTitle}>Macro Visualizer</Text>
           <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>SHOW IMPACT</Text>
              <Switch 
                value={showImpact}
                onValueChange={setShowImpact}
                trackColor={{ false: '#EEE', true: Colors.primary }}
              />
           </View>
        </View>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading pantry-based recipes…</Text>
          </View>
        ) : null}
        {/* Main Recommendation Card */}
        {top ? (
        <TouchableOpacity 
          style={styles.mainCard}
          onPress={() => navigation.navigate("RecipeDetails", { recipeId: top.recipe.id })}
        >
           <View style={styles.imageContainer}>
              <Image source={require('../assets/images/LemonChicken.png')} style={styles.mainImage} />
              <View style={styles.badgesCol}>
                 <View style={styles.badgeLabel}><Text style={styles.badgeTextSmall}>PANTRY MATCH</Text></View>
                 <View style={[styles.badgeLabel, { backgroundColor: Colors.primary }]}><Text style={styles.badgeTextSmall}>{Math.round(top.score * 100)}% SCORE</Text></View>
              </View>
              <TouchableOpacity style={styles.heartBtn}><Heart size={20} color="#333" /></TouchableOpacity>
           </View>
           <View style={styles.cardInfo}>
              <View style={styles.cardHeader}>
                 <Text style={styles.mainTitle}>{top.recipe.title}</Text>
                 <View style={styles.timeRow}><Image source={require('../assets/icons/tick.png')} style={styles.timeIcon} /><Text style={styles.timeText}>{top.recipe.prepMinutes + top.recipe.cookMinutes} min</Text></View>
              </View>
              <View style={styles.nutritionGrid}>
                 {[
                   { l: 'CALS', v: top.recipe.caloriesPerServing != null ? String(top.recipe.caloriesPerServing) : "—", c: '#E8F5E9' },
                   { l: 'PROT', v: top.recipe.proteinG != null ? `${Math.round(top.recipe.proteinG)}g` : "—", c: '#F5F5F5' },
                   { l: 'CARB', v: top.recipe.carbsG != null ? `${Math.round(top.recipe.carbsG)}g` : "—", c: '#F5F5F5' },
                   { l: 'FAT', v: top.recipe.fatG != null ? `${Math.round(top.recipe.fatG)}g` : "—", c: '#F5F5F5' }
                 ].map((n, i) => (
                   <View key={i} style={[styles.nutBox, { backgroundColor: n.c }]}>
                      <Text style={styles.nutLabel}>{n.l}</Text>
                      <Text style={styles.nutValue}>{n.v}</Text>
                   </View>
                 ))}
              </View>
              <View style={styles.actionRow}>
                 <TouchableOpacity style={styles.viewRecipeBtn} onPress={() => navigation.navigate("RecipeDetails", { recipeId: top.recipe.id })}><Text style={styles.viewRecipeText}>View Recipe</Text></TouchableOpacity>
                 <TouchableOpacity style={styles.flashBtn}><Zap size={20} color={Colors.primary} /></TouchableOpacity>
              </View>
           </View>
        </TouchableOpacity>
        ) : !loading ? (
          <Text style={styles.emptyText}>Add ingredients from a scan, then refresh recommendations.</Text>
        ) : null}
        {/* Best Match Banner */}
        <TouchableOpacity style={styles.bannerCard} disabled={!rest[0]} onPress={() => rest[0] && navigation.navigate("RecipeDetails", { recipeId: rest[0].recipe.id })}>
           <View style={styles.bannerContent}>
              <View style={styles.bannerHeader}>
                 <ChefHat size={16} color={Colors.white} />
                 <Text style={styles.bannerHeaderText}>NEXT BEST MATCH</Text>
              </View>
              <Text style={styles.bannerTitle}>{rest[0]?.recipe.title ?? "—"}</Text>
              <Text style={styles.bannerDesc}>Ranked from your pantry overlap (V1 pantry matching).</Text>
              <View style={styles.bannerStats}>
                 <View>
                    <Text style={styles.bannerStatLabel}>SCORE</Text>
                    <Text style={styles.bannerStatValue}>{rest[0] ? Math.round(rest[0].score * 100) : 0}%</Text>
                 </View>
                 <View style={{ marginLeft: 30 }}>
                    <Text style={styles.bannerStatLabel}>CALS</Text>
                    <Text style={styles.bannerStatValue}>{rest[0]?.recipe.caloriesPerServing ?? "—"}</Text>
                 </View>
                 <TouchableOpacity style={styles.getStartedBtn}><Text style={styles.getStartedText}>Get Started</Text></TouchableOpacity>
              </View>
           </View>
           <View style={styles.bannerImageContainer}>
              <Image source={require('../assets/images/QuinoaSalad.png')} style={styles.bannerImage} />
           </View>
        </TouchableOpacity>
        {rest.slice(1).map((row) => (
        <TouchableOpacity key={row.recipeId} style={styles.listCard} onPress={() => navigation.navigate("RecipeDetails", { recipeId: row.recipe.id })}>
           <Image source={require('../assets/images/SpinachAndOmelette.png')} style={styles.listImage} />
           <View style={styles.listContent}>
              <Text style={styles.listTitle}>{row.recipe.title}</Text>
              <View style={styles.warningRow}>
                 <AlertCircle size={14} color="#FF9800" />
                 <Text style={styles.warningText}>SCORE {Math.round(row.score * 100)}%</Text>
              </View>
              <View style={styles.listFooter}>
                 <Text style={styles.listInfo}>{row.recipe.prepMinutes + row.recipe.cookMinutes} min</Text>
                 <TouchableOpacity onPress={() => navigation.navigate("RecipeDetails", { recipeId: row.recipe.id })}><Text style={styles.subsText}>OPEN</Text></TouchableOpacity>
              </View>
           </View>
        </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF' },
  backButton: { padding: 4 },
  headerTitle: { color: Colors.primary, fontSize: 18, fontFamily: 'Inter-Bold' },
  filterBtn: { padding: 8 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  chipScroll: { marginVertical: 20 },
  chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: '#FFF', marginRight: 10, borderWidth: 1, borderColor: '#EEE' },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { color: '#666', fontSize: 13, fontFamily: 'Inter-Bold' },
  chipTextActive: { color: '#FFF' },
  macroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  macroTitle: { color: '#666', fontSize: 15, fontFamily: 'Inter-Bold' },
  switchRow: { flexDirection: 'row', alignItems: 'center' },
  switchLabel: { color: '#666', fontSize: 10, fontFamily: 'Inter-Bold', marginRight: 10 },
  mainCard: { backgroundColor: '#FFF', borderRadius: 32, overflow: 'hidden', marginBottom: 24, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  imageContainer: { height: 240, width: '100%' },
  mainImage: { width: '100%', height: '100%' },
  badgesCol: { position: 'absolute', top: 16, left: 16 },
  badgeLabel: { backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  badgeTextSmall: { color: '#FFF', fontSize: 10, fontFamily: 'Inter-Bold' },
  heartBtn: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(255,255,255,0.6)', padding: 10, borderRadius: 24 },
  cardInfo: { padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  mainTitle: { flex: 1, fontSize: 20, color: Colors.primary, fontFamily: 'Inter-Bold', marginRight: 20 },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeIcon: { width: 14, height: 14, marginRight: 6, tintColor: '#999' },
  timeText: { color: '#999', fontSize: 12, fontFamily: 'Inter-Medium' },
  nutritionGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  nutBox: { width: (width - 110) / 4, padding: 12, borderRadius: 16, alignItems: 'center' },
  nutLabel: { fontSize: 8, color: '#999', fontFamily: 'Inter-Bold', marginBottom: 4 },
  nutValue: { fontSize: 16, color: Colors.primary, fontFamily: 'Inter-Bold' },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  viewRecipeBtn: { flex: 1, backgroundColor: '#426D45', height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  viewRecipeText: { color: '#FFF', fontSize: 16, fontFamily: 'Inter-Bold' },
  flashBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  bannerCard: { backgroundColor: '#0D0D0D', borderRadius: 32, padding: 24, flexDirection: 'row', marginBottom: 24, overflow: 'hidden' },
  bannerContent: { flex: 1 },
  bannerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  bannerHeaderText: { color: Colors.secondary, fontSize: 10, fontFamily: 'Inter-Bold', marginLeft: 10 },
  bannerTitle: { color: '#FFF', fontSize: 18, fontFamily: 'Inter-Bold', marginBottom: 8 },
  bannerDesc: { color: '#999', fontSize: 12, fontFamily: 'Inter-Regular', lineHeight: 18, marginBottom: 20 },
  bannerStats: { flexDirection: 'row', alignItems: 'flex-end' },
  bannerStatLabel: { color: '#666', fontSize: 8, fontFamily: 'Inter-Bold', marginBottom: 4 },
  bannerStatValue: { color: '#FFF', fontSize: 18, fontFamily: 'Inter-Bold' },
  getStartedBtn: { marginLeft: 'auto', backgroundColor: '#426D45', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  getStartedText: { color: '#FFF', fontSize: 12, fontFamily: 'Inter-Bold' },
  bannerImageContainer: { width: 80, height: 80, marginLeft: 16 },
  bannerImage: { width: '100%', height: '100%', borderRadius: 16 },
  listCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 24, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#EEE' },
  listImage: { width: 80, height: 80, borderRadius: 16 },
  listContent: { flex: 1, marginLeft: 16, justifyContent: 'space-between' },
  listTitle: { color: Colors.primary, fontSize: 16, fontFamily: 'Inter-Bold' },
  warningRow: { flexDirection: 'row', alignItems: 'center' },
  warningText: { color: '#FF9800', fontSize: 10, fontFamily: 'Inter-Bold', marginLeft: 6 },
  listFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listInfo: { color: '#999', fontSize: 12, fontFamily: 'Inter-Regular' },
  subsText: { color: '#426D45', fontSize: 12, fontFamily: 'Inter-Bold' },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EEE', paddingBottom: 20 },
  tabItem: { alignItems: 'center' },
  tabActive: { borderTopWidth: 2, borderTopColor: Colors.primary, paddingTop: 6 },
  tabLabel: { fontSize: 8, color: '#999', fontFamily: 'Inter-Bold', marginTop: 4 },
  loadingBox: { paddingVertical: 40, alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#666', fontFamily: 'Inter-Regular', fontSize: 13 },
  emptyText: { color: '#666', fontFamily: 'Inter-Regular', fontSize: 14, marginBottom: 16 },
});
