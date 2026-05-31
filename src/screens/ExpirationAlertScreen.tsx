import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ChevronLeft, Timer, ChevronRight, Zap } from "lucide-react-native";
import { Colors } from "../constants/theme";
import { apiJson } from "../api/client";
import { ExpiryAlert, ExpiryAlertsResponse } from "../api/notifications";
import {
  RecipeListItem,
  recipePlaceholderImage,
  totalMinutes
} from "../api/recipes";

function daysLeftLabel(days: number | null): string {
  if (days == null) return "SOON";
  if (days <= 0) return "EXPIRES TODAY";
  if (days === 1) return "1 DAY LEFT";
  return `${days} DAYS LEFT`;
}

function recipeUsesIngredient(recipe: RecipeListItem, ingredientName: string): boolean {
  const needle = ingredientName.toLowerCase();
  if (recipe.title.toLowerCase().includes(needle)) return true;
  return recipe.ingredients.some((row) => row.ingredient.name.toLowerCase().includes(needle));
}

function pickSuggestedRecipes(recipes: RecipeListItem[], primaryIngredient: string | undefined): RecipeListItem[] {
  if (!recipes.length) return [];
  if (!primaryIngredient) return recipes.slice(0, 2);
  const matched = recipes.filter((r) => recipeUsesIngredient(r, primaryIngredient));
  return (matched.length ? matched : recipes).slice(0, 2);
}

export const ExpirationAlertScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<ExpiryAlert[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<RecipeListItem[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [alertsRes, recipesRes] = await Promise.all([
        apiJson<ExpiryAlertsResponse>("/notifications/expiry-alerts?days=7", { method: "GET" }),
        apiJson<{ items: RecipeListItem[] }>("/recipes", { method: "GET" })
      ]);
      const list = alertsRes.alerts ?? [];
      setAlerts(list);
      const primary = list[0];
      setSuggestedRecipes(pickSuggestedRecipes(recipesRes.items ?? [], primary?.ingredientName));
    } catch {
      setAlerts([]);
      setSuggestedRecipes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const primaryAlert = alerts[0];
  const alsoExpiring = alerts.slice(1);
  const primaryName = primaryAlert?.ingredientName ?? "pantry item";
  const primaryDays = primaryAlert?.daysUntilExpiry;
  const qtyLabel =
    primaryAlert?.quantity != null && primaryAlert.unit
      ? `${primaryAlert.quantity}${primaryAlert.unit !== "unit" ? ` ${primaryAlert.unit}` : ""}`
      : null;

  const warningMain =
    primaryDays != null
      ? `Your ${primaryName.toLowerCase()} expires in ${primaryDays} ${primaryDays === 1 ? "day" : "days"}`
      : `Your ${primaryName.toLowerCase()} is expiring soon`;

  const warningSub = qtyLabel
    ? `Save money and reduce waste by using your ${qtyLabel} of ${primaryName} today.`
    : `Save money and reduce waste by using your ${primaryName} before it expires.`;

  const goToCooking = (recipeId: string) => {
    navigation.navigate("Main", { screen: "Cooking", params: { recipeId } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Main"))}
          style={styles.backButton}
        >
          <ChevronLeft color={Colors.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expiration Alert</Text>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.warningCard}>
            <View style={styles.iconCircle}>
              <Timer size={24} color="#E57373" />
            </View>
            <View style={styles.warningTextContent}>
              <Text style={styles.warningLabel}>EXPIRATION ALERT</Text>
              <Text style={styles.warningMain}>{warningMain}</Text>
              <Text style={styles.warningSub}>{warningSub}</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Suggested Meals</Text>
              <Text style={styles.sectionSubtitle}>
                {primaryAlert
                  ? `Hand-picked recipes for your ${primaryName.toLowerCase()}`
                  : "Recipes from your collection"}
              </Text>
            </View>
            <View style={styles.recipeIconCircle}>
              <Zap size={16} color={Colors.primary} />
            </View>
          </View>

          {suggestedRecipes.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No recipes available yet. Scan your pantry to get suggestions.</Text>
            </View>
          ) : (
            suggestedRecipes.map((meal) => {
              const mins = totalMinutes(meal);
              const desc =
                meal.description.length > 100 ? `${meal.description.slice(0, 100)}…` : meal.description;
              return (
                <View key={meal.id} style={styles.mealCard}>
                  <View style={styles.imageContainer}>
                    <Image source={recipePlaceholderImage(meal.title)} style={styles.mealImage} />
                    {mins > 0 ? (
                      <View style={styles.timeBadge}>
                        <Timer size={12} color="#FFF" />
                        <Text style={styles.timeText}>{mins} MIN</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.badgeRow}>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{meal.difficulty.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.mealTitle}>{meal.title}</Text>
                    <Text style={styles.mealDesc}>{desc}</Text>
                    <TouchableOpacity style={styles.cookNowBtn} onPress={() => goToCooking(meal.id)}>
                      <Text style={styles.cookNowText}>Cook Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}

          {alsoExpiring.length > 0 ? (
            <>
              <Text style={styles.expiringTitle}>Also Expiring Soon</Text>
              <View style={styles.expiringList}>
                {alsoExpiring.map((item) => (
                  <TouchableOpacity key={item.pantryItemId} style={styles.expiringItem}>
                    <View style={styles.itemIconCircle}>
                      <Timer size={20} color={Colors.primary} />
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.ingredientName}</Text>
                      <Text style={styles.itemDays}>{daysLeftLabel(item.daysUntilExpiry)}</Text>
                    </View>
                    <ChevronRight size={20} color="#CCC" />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { padding: 4, marginRight: 10 },
  headerTitle: { color: Colors.primary, fontSize: 18, fontFamily: "Inter-Bold" },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  warningCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#EEE"
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFEBEE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16
  },
  warningTextContent: { flex: 1 },
  warningLabel: { color: "#999", fontSize: 10, fontFamily: "Inter-Bold", letterSpacing: 1, marginBottom: 4 },
  warningMain: { color: Colors.primary, fontSize: 16, fontFamily: "Inter-Bold", marginBottom: 6 },
  warningSub: { color: "#666", fontSize: 12, fontFamily: "Inter-Regular", lineHeight: 18 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32,
    marginBottom: 20
  },
  sectionTitle: { color: Colors.primary, fontSize: 18, fontFamily: "Inter-Bold" },
  sectionSubtitle: { color: "#999", fontSize: 12, fontFamily: "Inter-Regular" },
  recipeIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center"
  },
  emptyCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#EEE"
  },
  emptyText: { color: "#999", fontSize: 13, fontFamily: "Inter-Regular", textAlign: "center", lineHeight: 20 },
  mealCard: {
    backgroundColor: "#FFF",
    borderRadius: 32,
    overflow: "hidden",
    marginBottom: 24,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  imageContainer: { height: 180, width: "100%" },
  mealImage: { width: "100%", height: "100%" },
  timeBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  timeText: { color: "#FFF", fontSize: 10, fontFamily: "Inter-Bold", marginLeft: 6 },
  cardContent: { padding: 20 },
  badgeRow: { flexDirection: "row", marginBottom: 12 },
  badge: { backgroundColor: "#F5F5F5", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginRight: 8 },
  badgeText: { color: "#426D45", fontSize: 8, fontFamily: "Inter-Bold" },
  mealTitle: { color: Colors.primary, fontSize: 20, fontFamily: "Inter-Bold", marginBottom: 8 },
  mealDesc: { color: "#999", fontSize: 13, fontFamily: "Inter-Regular", lineHeight: 20, marginBottom: 20 },
  cookNowBtn: {
    backgroundColor: "#426D45",
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center"
  },
  cookNowText: { color: "#FFF", fontSize: 16, fontFamily: "Inter-Bold" },
  expiringTitle: { color: Colors.primary, fontSize: 18, fontFamily: "Inter-Bold", marginTop: 10, marginBottom: 20 },
  expiringList: { backgroundColor: "#FFF", borderRadius: 24, padding: 16 },
  expiringItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5"
  },
  itemIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F9F9F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16
  },
  itemInfo: { flex: 1 },
  itemName: { color: Colors.primary, fontSize: 14, fontFamily: "Inter-Bold" },
  itemDays: { color: "#999", fontSize: 10, fontFamily: "Inter-Medium", marginTop: 2 }
});
