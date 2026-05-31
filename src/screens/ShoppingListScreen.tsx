import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ChevronLeft, Check } from "lucide-react-native";
import { Colors } from "../constants/theme";
import { apiJson } from "../api/client";
import { categoryLabel, type ShoppingList, type ShoppingListItem } from "../api/planning";
import { scanApiErrorMessage } from "../api/scanUpload";

type CategoryGroup = {
  category: string;
  items: ShoppingListItem[];
};

function itemDetails(row: ShoppingListItem): string {
  const q = Number.isInteger(row.quantity) ? String(row.quantity) : row.quantity.toFixed(1);
  return `${q} ${row.unit}`;
}

export const ShoppingListScreen = ({ navigation }: { navigation: { goBack: () => void } }) => {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("All Items");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiJson<ShoppingList | null>("/shopping-lists/current", { method: "GET" });
      setList(data);
    } catch {
      setList(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const categories = useMemo(() => {
    const items = list?.items ?? [];
    const map = new Map<string, ShoppingListItem[]>();
    for (const item of items) {
      const label = categoryLabel(item.ingredient.category);
      const bucket = map.get(label) ?? [];
      bucket.push(item);
      map.set(label, bucket);
    }
    return Array.from(map.entries())
      .map(([category, catItems]) => ({ category, items: catItems }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [list?.items]);

  const filterChips = useMemo(() => {
    const chips = ["All Items", ...categories.map((c) => c.category)];
    return [...new Set(chips)];
  }, [categories]);

  const visibleGroups: CategoryGroup[] = useMemo(() => {
    if (selectedFilter === "All Items") {
      return categories;
    }
    return categories.filter((g) => g.category === selectedFilter);
  }, [categories, selectedFilter]);

  const toggleCheck = async (item: ShoppingListItem) => {
    setTogglingId(item.id);
    const next = !item.checked;
    setList((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        items: prev.items.map((i) => (i.id === item.id ? { ...i, checked: next } : i))
      };
    });
    try {
      await apiJson(`/shopping-lists/items/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ checked: next })
      });
    } catch (e: unknown) {
      setList((prev) => {
        if (!prev) {
          return prev;
        }
        return {
          ...prev,
          items: prev.items.map((i) => (i.id === item.id ? { ...i, checked: item.checked } : i))
        };
      });
      Alert.alert("Shopping list", scanApiErrorMessage(e, "Could not update item"));
    } finally {
      setTogglingId(null);
    }
  };

  const unchecked = list?.items.filter((i) => !i.checked).length ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={Colors.primary} size={28} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Shopping List</Text>
          <Text style={styles.headerSubtitle}>
            {list?.items.length
              ? `${unchecked} item${unchecked === 1 ? "" : "s"} to buy`
              : "Generate a meal plan first"}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : !list?.items.length ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No active shopping list.</Text>
          <Text style={styles.emptySub}>Open Meal Planner and tap Generate plan.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {filterChips.map((chip) => (
              <TouchableOpacity
                key={chip}
                onPress={() => setSelectedFilter(chip)}
                style={[styles.chip, selectedFilter === chip && styles.chipActive]}
              >
                <Text style={[styles.chipText, selectedFilter === chip && styles.chipTextActive]}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {visibleGroups.map((cat) => (
            <View key={cat.category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{cat.category}</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>
                    {cat.items.length} ITEM{cat.items.length === 1 ? "" : "S"}
                  </Text>
                </View>
              </View>
              {cat.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemRow}
                  disabled={togglingId === item.id}
                  onPress={() => void toggleCheck(item)}
                >
                  <View style={[styles.itemImageContainer, styles.iconContainer]}>
                    <Image
                      source={require("../assets/icons/egg.png")}
                      style={styles.iconImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
                      {item.ingredient.name}
                    </Text>
                    <Text style={styles.itemDetails}>{itemDetails(item)}</Text>
                  </View>
                  <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                    {item.checked ? <Check color={Colors.white} size={14} /> : null}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  emptyText: { color: Colors.primary, fontSize: 16, fontFamily: "Inter-Bold", textAlign: "center" },
  emptySub: { color: "#999", fontSize: 13, fontFamily: "Inter-Regular", marginTop: 8, textAlign: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5"
  },
  backButton: { padding: 4, marginRight: 10 },
  headerTitle: { color: Colors.primary, fontSize: 18, fontFamily: "Inter-Bold" },
  headerSubtitle: { color: "#999", fontSize: 12, fontFamily: "Inter-Regular" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  chipScroll: { marginTop: 16, marginBottom: 30 },
  chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: "#F5F5F5", marginRight: 10 },
  chipActive: { backgroundColor: Colors.primary },
  chipText: { color: Colors.primary, fontSize: 13, fontFamily: "Inter-SemiBold" },
  chipTextActive: { color: Colors.white },
  categorySection: { marginBottom: 30 },
  categoryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  categoryTitle: { color: "#1A1A1A", fontSize: 18, fontFamily: "Inter-Bold" },
  countBadge: { backgroundColor: "#E8F5E9", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  countText: { color: "#426D45", fontSize: 10, fontFamily: "Inter-Bold" },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEE"
  },
  itemImageContainer: { width: 56, height: 56, borderRadius: 16, overflow: "hidden", marginRight: 16 },
  iconContainer: { backgroundColor: "#F5F5F5", justifyContent: "center", alignItems: "center" },
  iconImage: { width: 32, height: 32, tintColor: "#666" },
  itemInfo: { flex: 1 },
  itemName: { color: Colors.primary, fontSize: 16, fontFamily: "Inter-Bold", marginBottom: 4 },
  itemNameChecked: { textDecorationLine: "line-through", color: "#AAA" },
  itemDetails: { color: "#999", fontSize: 12, fontFamily: "Inter-Regular" },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#EEE",
    justifyContent: "center",
    alignItems: "center"
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary }
});
