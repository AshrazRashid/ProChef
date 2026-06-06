import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useMemo, useState } from "react";
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
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Plus, ShoppingCart, ChevronRight } from "lucide-react-native";
import { Colors } from "../constants/theme";
import { apiJson } from "../api/client";
import {
  formatMonthDay,
  formatShortDay,
  type MealPlan,
  type MealPlanSlot,
  type ShoppingList,
  mondayWeekStartIso,
  planDayDates,
  sameCalendarDay
} from "../api/planning";
import { scanApiErrorMessage } from "../api/scanUpload";

const { width } = Dimensions.get("window");

const SLOT_ORDER = ["breakfast", "lunch", "dinner"];

function recipeThumb(title: string) {
  const t = title.toLowerCase();
  if (t.includes("spinach") && t.includes("omelette")) {
    return require("../assets/images/SpinachOmelette.png");
  }
  if (t.includes("salmon")) {
    return require("../assets/images/MediterraneanSalmonBowl.png");
  }
  if (t.includes("yogurt") || t.includes("parfait")) {
    return require("../assets/images/GreenPowerSmoothie.png");
  }
  if (t.includes("pasta")) {
    return require("../assets/images/SpinachOmelette.png");
  }
  return require("../assets/icons/egg.png");
}

function slotLabel(slotType: string) {
  return slotType.toUpperCase();
}

function MealSlotCard({
  slot,
  onPress
}: {
  slot: MealPlanSlot | undefined;
  onPress: () => void;
}) {
  if (!slot?.recipe) {
    return (
      <View style={styles.addBlock}>
        <View style={styles.plusCircle}>
          <Plus size={20} color={Colors.primary} />
        </View>
      </View>
    );
  }
  const cals = slot.recipe.caloriesPerServing;
  return (
    <TouchableOpacity style={styles.mealCard} onPress={onPress} activeOpacity={0.85}>
      <Image source={recipeThumb(slot.recipe.title)} style={styles.mealThumb} />
      <View style={styles.mealInfo}>
        <Text style={styles.mealName}>{slot.recipe.title}</Text>
        <Text style={styles.mealCals}>{cals != null ? `${cals} kcal` : "—"}</Text>
      </View>
      <ChevronRight size={18} color="#CCC" />
    </TouchableOpacity>
  );
}

type DietProfile = {
  calorieTarget: number;
  proteinG: number;
  carbG: number;
  fatG: number;
};

export const MealPlannerScreen = ({ navigation }: { navigation: { navigate: (name: string, params?: object) => void } }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [shopping, setShopping] = useState<ShoppingList | null>(null);
  const [dietProfile, setDietProfile] = useState<DietProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const dayDates = useMemo(() => {
    if (plan?.weekStartDate) {
      return planDayDates(plan.weekStartDate.slice(0, 10), 7);
    }
    return planDayDates(mondayWeekStartIso(), 7);
  }, [plan?.weekStartDate]);

  const selectedDay = dayDates[selectedIdx] ?? dayDates[0];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, s, userRes] = await Promise.all([
        apiJson<MealPlan | null>("/meal-plans/current", { method: "GET" }),
        apiJson<ShoppingList | null>("/shopping-lists/current", { method: "GET" }),
        apiJson<{ dietProfile: DietProfile | null }>("/me", { method: "GET" }).catch(() => ({ dietProfile: null }))
      ]);
      setPlan(p);
      setShopping(s);
      setDietProfile(userRes?.dietProfile ?? null);
    } catch {
      setPlan(null);
      setShopping(null);
      setDietProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const slotsForDay = useMemo(
    () => plan?.slots.filter((s) => sameCalendarDay(s.date, selectedDay)) ?? [],
    [plan?.slots, selectedDay]
  );

  const slotByType = (type: string) => slotsForDay.find((s) => s.slotType === type);

  const uncheckedCount = shopping?.items.filter((i) => !i.checked).length ?? 0;

  const generatePlan = async () => {
    setGenerating(true);
    try {
      await apiJson<MealPlan>("/meal-plans", {
        method: "POST",
        body: JSON.stringify({
          weekStartDate: mondayWeekStartIso(),
          days: 7,
          slotTypes: ["breakfast", "lunch", "dinner"],
          useRecommendations: true
        })
      });
      await apiJson<ShoppingList>("/shopping-lists/generate", {
        method: "POST",
        body: JSON.stringify({ subtractPantry: true })
      });
      await load();
      setSelectedIdx(0);
    } catch (e: unknown) {
      Alert.alert("Meal plan", scanApiErrorMessage(e, "Could not generate plan"));
    } finally {
      setGenerating(false);
    }
  };

  const openRecipe = (slot: MealPlanSlot | undefined) => {
    if (!slot?.recipe) {
      return;
    }
    navigation.navigate("RecipeDetails", { recipeId: slot.recipe.id });
  };

  const calorieTarget = dietProfile?.calorieTarget ?? 2100;
  const proteinG = dietProfile?.proteinG ?? 160;
  const carbG = dietProfile?.carbG ?? 220;
  const fatG = dietProfile?.fatG ?? 65;

  const totalKcal = (proteinG * 4) + (carbG * 4) + (fatG * 9) || 1;
  const proteinPct = Math.round((proteinG * 4 / totalKcal) * 100);
  const carbPct = Math.round((carbG * 4 / totalKcal) * 100);
  const fatPct = Math.round((fatG * 9 / totalKcal) * 100);

  const macros = useMemo(() => [
    { label: "PROTEIN", val: `${Math.round(proteinG)}g`, percent: proteinPct, color: "#426D45" },
    { label: "CARBS", val: `${Math.round(carbG)}g`, percent: carbPct, color: "#FFB74D" },
    { label: "FATS", val: `${Math.round(fatG)}g`, percent: fatPct, color: "#4FC3F7" }
  ], [proteinG, carbG, fatG, proteinPct, carbPct, fatPct]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meal Planner</Text>
        <Image source={require("../assets/images/avatar.png")} style={styles.avatar} />
      </View>
      {loading && !plan ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.goalCard}>
            <Text style={styles.goalLabel}>WEEKLY GOAL</Text>
            <Text style={styles.goalValue}>{calorieTarget.toLocaleString()}</Text>
            <Text style={styles.goalUnit}>kcal / day avg</Text>
            <View style={styles.macroRow}>
              {macros.map((m, i) => (
                <View key={i} style={styles.macroItem}>
                  <View style={styles.donutPlaceholder}>
                    <View
                      style={[styles.donutInner, { borderColor: m.color, borderTopWidth: 4, borderRightWidth: 4 }]}
                    />
                    <Text style={styles.macroPercent}>{m.percent}%</Text>
                  </View>
                  <Text style={styles.macroLabel}>{m.label}</Text>
                  <Text style={styles.macroVal}>{m.val}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.scheduleHeader}>
            <Text style={styles.scheduleTitle}>Weekly Schedule</Text>
            <TouchableOpacity
              style={styles.autoBtn}
              disabled={generating}
              onPress={() => void generatePlan()}
            >
              {generating ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.autoBtnText}>{plan ? "Regenerate plan" : "Generate plan"}</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            {dayDates.map((iso, idx) => (
              <TouchableOpacity
                key={iso}
                style={[styles.dateCard, selectedIdx === idx && styles.dateCardActive]}
                onPress={() => setSelectedIdx(idx)}
              >
                <Text style={[styles.dayText, selectedIdx === idx && styles.dayTextActive]}>
                  {formatShortDay(iso)}
                </Text>
                <Text style={[styles.dateText, selectedIdx === idx && styles.dateTextActive]}>
                  {formatMonthDay(iso)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {!plan ? (
            <Text style={styles.emptyHint}>
              Tap Generate plan to build a week from your recommendations and pantry.
            </Text>
          ) : (
            SLOT_ORDER.map((slotType) => (
              <View key={slotType} style={styles.mealBlock}>
                <Text style={styles.blockLabel}>{slotLabel(slotType)}</Text>
                <MealSlotCard slot={slotByType(slotType)} onPress={() => openRecipe(slotByType(slotType))} />
              </View>
            ))
          )}

          <View style={styles.groceryBanner}>
            <View style={styles.groceryContent}>
              <Text style={styles.groceryTitle}>Grocery List</Text>
              <Text style={styles.groceryDesc}>
                {shopping && shopping.items.length > 0
                  ? `${uncheckedCount} item${uncheckedCount === 1 ? "" : "s"} left based on your meal plan.`
                  : "Generate a meal plan to build your shopping list."}
              </Text>
              <TouchableOpacity
                style={[styles.viewChecklistBtn, !shopping?.items.length && styles.viewChecklistBtnDisabled]}
                disabled={!shopping?.items.length}
                onPress={() => navigation.navigate("ShoppingList")}
              >
                <Text style={styles.viewChecklistText}>View Checklist</Text>
              </TouchableOpacity>
            </View>
            <ShoppingCart size={80} color="rgba(66, 109, 69, 0.05)" style={styles.cartIcon} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF"
  },
  headerTitle: { color: Colors.primary, fontSize: 18, fontFamily: "Inter-Bold" },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  goalCard: {
    backgroundColor: "#FFF",
    borderRadius: 32,
    padding: 24,
    alignItems: "center",
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#EEE"
  },
  goalLabel: { fontSize: 8, color: "#999", fontFamily: "Inter-Bold", letterSpacing: 1, marginBottom: 8 },
  goalValue: { fontSize: 32, color: Colors.primary, fontFamily: "Inter-Bold" },
  goalUnit: { fontSize: 12, color: "#999", fontFamily: "Inter-Medium", marginBottom: 24 },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
    paddingTop: 24
  },
  macroItem: { alignItems: "center", flex: 1 },
  donutPlaceholder: { width: 44, height: 44, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  donutInner: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 22,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    transform: [{ rotate: "45deg" }]
  },
  macroPercent: { fontSize: 12, fontFamily: "Inter-Bold", color: "#333" },
  macroLabel: { fontSize: 8, color: "#999", fontFamily: "Inter-Bold", marginBottom: 4 },
  macroVal: { fontSize: 13, color: "#1A1A1A", fontFamily: "Inter-Bold" },
  scheduleHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 32, marginBottom: 20 },
  scheduleTitle: { color: Colors.primary, fontSize: 18, fontFamily: "Inter-Bold" },
  autoBtn: {
    backgroundColor: "#426D45",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 120,
    alignItems: "center"
  },
  autoBtnText: { color: "#FFF", fontSize: 10, fontFamily: "Inter-Bold" },
  dateScroll: { marginBottom: 24 },
  dateCard: {
    backgroundColor: "#FFF",
    width: (width - 60) / 4,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#EEE"
  },
  dateCardActive: { backgroundColor: Colors.primary },
  dayText: { color: Colors.primary, fontSize: 12, fontFamily: "Inter-Bold" },
  dateText: { color: "#999", fontSize: 8, fontFamily: "Inter-Bold", marginTop: 4 },
  dayTextActive: { color: "#FFF" },
  dateTextActive: { color: "rgba(255,255,255,0.7)" },
  emptyHint: { color: "#999", fontSize: 13, fontFamily: "Inter-Regular", marginBottom: 24, lineHeight: 20 },
  mealBlock: { marginBottom: 20 },
  blockLabel: { color: "#999", fontSize: 8, fontFamily: "Inter-Bold", letterSpacing: 1, marginBottom: 8 },
  mealCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEE"
  },
  mealThumb: { width: 44, height: 44, borderRadius: 12 },
  mealInfo: { flex: 1, marginLeft: 16 },
  mealName: { color: Colors.primary, fontSize: 14, fontFamily: "Inter-Bold" },
  mealCals: { color: "#999", fontSize: 12, fontFamily: "Inter-Regular", marginTop: 2 },
  addBlock: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "#EEE"
  },
  plusCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F9F9F9",
    justifyContent: "center",
    alignItems: "center"
  },
  groceryBanner: {
    backgroundColor: "#FFF",
    borderRadius: 32,
    padding: 24,
    marginTop: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEE"
  },
  groceryContent: { flex: 1, zIndex: 1 },
  groceryTitle: { color: Colors.primary, fontSize: 18, fontFamily: "Inter-Bold", marginBottom: 8 },
  groceryDesc: { color: "#999", fontSize: 12, fontFamily: "Inter-Regular", lineHeight: 18, marginBottom: 20, width: "70%" },
  viewChecklistBtn: {
    backgroundColor: "#426D45",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    alignSelf: "flex-start"
  },
  viewChecklistBtnDisabled: { opacity: 0.45 },
  viewChecklistText: { color: "#FFF", fontSize: 14, fontFamily: "Inter-Bold" },
  cartIcon: { position: "absolute", right: -20, bottom: -20 }
});
