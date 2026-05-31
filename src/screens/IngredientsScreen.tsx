import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Alert,
  ImageSourcePropType
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { ChevronLeft, MoreVertical, Search, Plus, X, RotateCcw, Trash2, CheckCircle2 } from "lucide-react-native";
import { Colors } from "../constants/theme";
import { apiJson } from "../api/client";
import { scanApiErrorMessage } from "../api/scanUpload";
import { useAuth } from "../context/AuthContext";

const { width } = Dimensions.get("window");

type ScanDetection = {
  id: string;
  confidence: number;
  ingredient: { id: string; name: string; category: string };
};

type ScanPayload = {
  id: string;
  status: string;
  detections: ScanDetection[];
};

type CatalogIngredient = {
  id: string;
  name: string;
  category: string;
  defaultUnit: string;
};

type IngredientRow = {
  key: string;
  ingredientId: string;
  name: string;
  category: string;
  confidence: string;
  source: "scan" | "manual";
  selected: boolean;
};

const FILTERS = ["All", "Protein", "Vegetables", "Fruits", "Dairy"] as const;
type FilterLabel = (typeof FILTERS)[number];

const FILTER_TO_CATEGORY: Record<FilterLabel, string | null> = {
  All: null,
  Protein: "protein",
  Vegetables: "vegetable",
  Fruits: "fruit",
  Dairy: "dairy"
};

const CATEGORY_COLORS: Record<string, string> = {
  vegetable: "#E8F5E9",
  fruit: "#FFF3E0",
  protein: "#E3F2FD",
  dairy: "#FFFDE7",
  grain: "#F3E5F5",
  pantry: "#FFF"
};

const CATEGORY_ICONS: Record<string, ImageSourcePropType> = {
  protein: require("../assets/icons/protien.png"),
  vegetable: require("../assets/icons/leaves.png"),
  fruit: require("../assets/icons/organic.png"),
  dairy: require("../assets/icons/egg.png")
};

function confidenceLabel(confidence: number) {
  return confidence >= 0.85 ? "HIGH CONFIDENCE" : "MEDIUM CONFIDENCE";
}

function iconForCategory(category: string): ImageSourcePropType {
  return CATEGORY_ICONS[category] ?? require("../assets/icons/egg.png");
}

function cardColor(category: string) {
  return CATEGORY_COLORS[category] ?? "#FFF";
}

export const IngredientsScreen = ({ navigation }: any) => {
  const route = useRoute<any>();
  const scanId: string | undefined = route.params?.scanId;
  const { hasPro } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<FilterLabel>("All");
  const [scan, setScan] = useState<ScanPayload | null>(null);
  const [rows, setRows] = useState<IngredientRow[]>([]);
  const [addQuery, setAddQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CatalogIngredient[]>([]);
  const [searching, setSearching] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const scanInitializedRef = useRef<string | null>(null);
  const pollStartedAtRef = useRef<number>(Date.now());
  const workerHintShownRef = useRef(false);

  useEffect(() => {
    if (!hasPro) {
      navigation.replace("PremiumAccess");
    }
  }, [hasPro, navigation]);

  useEffect(() => {
    if (!scanId) {
      return;
    }
    let alive = true;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    pollStartedAtRef.current = Date.now();
    workerHintShownRef.current = false;

    const poll = async () => {
      try {
        const s = await apiJson<ScanPayload>(`/scans/${scanId}?_=${Date.now()}`, {
          method: "GET",
          headers: { "Cache-Control": "no-cache", Pragma: "no-cache" }
        });
        if (!alive) {
          return;
        }
        setScan(s);
        if (
          !workerHintShownRef.current &&
          ["queued", "processing"].includes(s.status) &&
          Date.now() - pollStartedAtRef.current > 15000
        ) {
          workerHintShownRef.current = true;
          Alert.alert(
            "Scan still processing",
            "If this takes more than a few seconds, start the backend worker:\ncd backend && npm run worker"
          );
        }
        if (s.status === "failed") {
          Alert.alert("Scan", "Processing failed. Try again.");
          if (intervalId !== undefined) {
            clearInterval(intervalId);
            intervalId = undefined;
          }
        }
        if (s.status === "completed" && intervalId !== undefined) {
          clearInterval(intervalId);
          intervalId = undefined;
        }
      } catch {
        // Keep last known scan state while polling (304/cache errors should not reset UI).
      }
    };

    void poll();
    intervalId = setInterval(() => void poll(), 2000);
    return () => {
      alive = false;
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [scanId]);

  useEffect(() => {
    if (!scan || scan.status !== "completed") {
      return;
    }
    if (scanInitializedRef.current === scan.id) {
      return;
    }
    scanInitializedRef.current = scan.id;
    setRows(
      scan.detections.map((d) => ({
        key: d.id,
        ingredientId: d.ingredient.id,
        name: d.ingredient.name,
        category: d.ingredient.category,
        confidence: confidenceLabel(d.confidence),
        source: "scan" as const,
        selected: true
      }))
    );
  }, [scan]);

  useEffect(() => {
    const q = addQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    let alive = true;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiJson<{ items: CatalogIngredient[] }>(
          `/pantry/ingredients?q=${encodeURIComponent(q)}`,
          { method: "GET" }
        );
        if (alive) {
          setSuggestions(res.items);
        }
      } catch {
        if (alive) {
          setSuggestions([]);
        }
      } finally {
        if (alive) {
          setSearching(false);
        }
      }
    }, 300);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [addQuery]);

  const processing = scan && ["uploading", "queued", "processing"].includes(scan.status);

  const filteredRows = useMemo(() => {
    const category = FILTER_TO_CATEGORY[selectedFilter];
    if (!category) {
      return rows;
    }
    return rows.filter((row) => row.category === category);
  }, [rows, selectedFilter]);

  const selectedCount = useMemo(() => rows.filter((row) => row.selected).length, [rows]);

  const canConfirm = Boolean(scanId && scan?.status === "completed" && selectedCount > 0);

  const toggleSelected = useCallback((key: string) => {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, selected: !row.selected } : row)));
  }, []);

  const removeRow = useCallback((key: string) => {
    setRows((prev) => prev.filter((row) => row.key !== key));
  }, []);

  const selectAll = useCallback(() => {
    const visibleKeys = new Set(filteredRows.map((row) => row.key));
    setRows((prev) =>
      prev.map((row) => (visibleKeys.has(row.key) ? { ...row, selected: true } : row))
    );
  }, [filteredRows]);

  const clearAll = useCallback(() => {
    const visibleKeys = new Set(filteredRows.map((row) => row.key));
    setRows((prev) =>
      prev.map((row) => (visibleKeys.has(row.key) ? { ...row, selected: false } : row))
    );
  }, [filteredRows]);

  const addIngredient = useCallback(
    (item: CatalogIngredient) => {
      setRows((prev) => {
        if (prev.some((row) => row.ingredientId === item.id)) {
          Alert.alert("Ingredients", `${item.name} is already in your list.`);
          return prev;
        }
        return [
          ...prev,
          {
            key: `manual-${item.id}`,
            ingredientId: item.id,
            name: item.name,
            category: item.category,
            confidence: "ADDED MANUALLY",
            source: "manual" as const,
            selected: true
          }
        ];
      });
      setAddQuery("");
      setSuggestions([]);
    },
    []
  );

  const addFromQuery = useCallback(() => {
    const q = addQuery.trim();
    if (q.length < 2) {
      Alert.alert("Ingredients", "Type at least 2 characters to search.");
      return;
    }
    const exact = suggestions.find((item) => item.name.toLowerCase() === q.toLowerCase());
    const pick = exact ?? suggestions[0];
    if (!pick) {
      Alert.alert("Ingredients", "No matching ingredient found. Try a different name.");
      return;
    }
    addIngredient(pick);
  }, [addIngredient, addQuery, suggestions]);

  const rescan = useCallback(() => {
    navigation.navigate("CameraScan");
  }, [navigation]);

  const showMenu = useCallback(() => {
    Alert.alert("Ingredients", undefined, [
      { text: "Scan again", onPress: rescan },
      { text: "Cancel", style: "cancel" }
    ]);
  }, [rescan]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Main"))}
          style={styles.backButton}
        >
          <ChevronLeft color="#1A1A1A" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ingredients Found</Text>
        <TouchableOpacity style={styles.moreButton} onPress={showMenu}>
          <MoreVertical color="#1A1A1A" size={24} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!scanId ? (
          <Text style={styles.missingScan}>Open the scanner from the dashboard to start a scan.</Text>
        ) : null}
        <View style={styles.detectionCard}>
          <View style={styles.detectionTextContent}>
            <Text style={styles.detectionTitle}>
              {processing
                ? "Processing your photo…"
                : `${rows.length} ingredient${rows.length === 1 ? "" : "s"} in your list`}
            </Text>
            <Text style={styles.detectionSubtitle}>
              Remove anything you don't have or {"\n"}add missing items
            </Text>
          </View>
          <View style={styles.sparkleCircle}>
            <Image source={require("../assets/icons/creation.png")} style={styles.sparkleIcon} />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={[styles.filterTab, selectedFilter === filter && styles.filterTabActive]}
            >
              <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.searchSection}>
          <Text style={styles.searchTitle}>Missing something?</Text>
          <View style={styles.searchRow}>
            <View style={styles.searchInputContainer}>
              <Search color="#999" size={20} />
              <TextInput
                style={styles.searchInput}
                placeholder="Add ingredient"
                placeholderTextColor="#999"
                value={addQuery}
                onChangeText={setAddQuery}
                onSubmitEditing={addFromQuery}
                returnKeyType="done"
              />
              {searching ? <ActivityIndicator size="small" color={Colors.primary} /> : null}
            </View>
            <TouchableOpacity style={styles.addButton} onPress={addFromQuery}>
              <Plus color={Colors.white} size={24} />
            </TouchableOpacity>
          </View>
          {suggestions.length > 0 ? (
            <View style={styles.suggestionsBox}>
              {suggestions.slice(0, 6).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.suggestionRow}
                  onPress={() => addIngredient(item)}
                >
                  <Text style={styles.suggestionName}>{item.name}</Text>
                  <Text style={styles.suggestionCategory}>{item.category}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={selectAll}>
            <CheckCircle2 color="#4D4D4D" size={16} />
            <Text style={styles.actionButtonText}>SELECT ALL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={clearAll}>
            <Trash2 color="#4D4D4D" size={16} />
            <Text style={styles.actionButtonText}>CLEAR ALL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={rescan}>
            <RotateCcw color="#4D4D4D" size={16} />
            <Text style={styles.actionButtonText}>RESCAN</Text>
          </TouchableOpacity>
        </View>

        {processing ? (
          <View style={styles.processingRow}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.processingText}>This can take a few seconds…</Text>
          </View>
        ) : null}

        <View style={styles.ingredientsGrid}>
          {filteredRows.map((item) => (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.85}
              onPress={() => toggleSelected(item.key)}
              style={[
                styles.ingredientCard,
                { backgroundColor: cardColor(item.category) },
                item.selected && styles.ingredientCardSelected
              ]}
            >
              <TouchableOpacity
                style={styles.removeIngredient}
                onPress={() => removeRow(item.key)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X color="#999" size={16} />
              </TouchableOpacity>
              <View style={styles.ingredientImageContainer}>
                <Image source={iconForCategory(item.category)} style={styles.ingredientIcon} resizeMode="contain" />
              </View>
              <Text style={styles.ingredientName}>{item.name}</Text>
              <View
                style={[
                  styles.confidenceLabel,
                  item.confidence.includes("HIGH") || item.source === "manual"
                    ? styles.confidenceHigh
                    : styles.confidenceMedium
                ]}
              >
                <Text style={styles.confidenceText}>{item.confidence}</Text>
              </View>
              {item.selected ? (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>SELECTED</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>

        {!processing && filteredRows.length === 0 ? (
          <Text style={styles.emptyFilter}>
            {rows.length === 0
              ? "No ingredients yet. Add items manually or rescan."
              : "No ingredients in this category."}
          </Text>
        ) : null}

        <View style={styles.selectionLabelContainer}>
          <View style={styles.selectionButton}>
            <Text style={styles.selectionButtonText}>
              {selectedCount} INGREDIENT{selectedCount === 1 ? "" : "S"} SELECTED
            </Text>
          </View>
        </View>

        <View style={styles.footerButtons}>
          <TouchableOpacity
            style={[styles.generateButton, !canConfirm && styles.generateButtonDisabled]}
            disabled={!canConfirm || confirming}
            onPress={async () => {
              if (!scanId || !canConfirm) {
                return;
              }
              const ingredientIds = [
                ...new Set(rows.filter((row) => row.selected).map((row) => row.ingredientId))
              ];
              setConfirming(true);
              try {
                await apiJson(`/scans/${scanId}/confirm`, {
                  method: "POST",
                  body: JSON.stringify({ ingredientIds })
                });
                await apiJson("/recommendations/meals", {
                  method: "POST",
                  body: JSON.stringify({ limit: 20 })
                });
                navigation.navigate("Main", { screen: "Meal" });
              } catch (e: unknown) {
                Alert.alert("Ingredients", scanApiErrorMessage(e, "Could not confirm"));
              } finally {
                setConfirming(false);
              }
            }}
          >
            {confirming ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.generateButtonText}>Generate meals</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.scanAgainButton} onPress={rescan}>
            <Text style={styles.scanAgainButtonText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFF"
  },
  backButton: {
    padding: 4
  },
  headerTitle: {
    color: "#1A1A1A",
    fontSize: 18,
    fontFamily: "Inter-Bold"
  },
  moreButton: {
    padding: 4
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  detectionCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    marginTop: 20,
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  detectionTextContent: {
    flex: 1
  },
  detectionTitle: {
    color: "#1A1A1A",
    fontSize: 18,
    fontFamily: "Inter-Bold",
    lineHeight: 24,
    marginBottom: 8
  },
  detectionSubtitle: {
    color: "#666",
    fontSize: 12,
    fontFamily: "Inter-Regular",
    lineHeight: 18
  },
  sparkleCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#4E734E",
    justifyContent: "center",
    alignItems: "center"
  },
  sparkleIcon: {
    width: 28,
    height: 28,
    tintColor: Colors.white
  },
  filterScroll: {
    marginTop: 24,
    marginBottom: 24
  },
  filterTab: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#FFF",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0"
  },
  filterTabActive: {
    backgroundColor: "#426D45",
    borderColor: "#426D45"
  },
  filterText: {
    color: "#666",
    fontSize: 14,
    fontFamily: "Inter-Medium"
  },
  filterTextActive: {
    color: Colors.white
  },
  searchSection: {
    marginBottom: 24
  },
  searchTitle: {
    color: "#1A1A1A",
    fontSize: 16,
    fontFamily: "Inter-Bold",
    marginBottom: 16
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  searchInputContainer: {
    flex: 1,
    height: 52,
    backgroundColor: "#FFF",
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#EEE",
    marginRight: 12
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#1A1A1A",
    fontFamily: "Inter-Regular"
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#426D45",
    justifyContent: "center",
    alignItems: "center"
  },
  suggestionsBox: {
    marginTop: 10,
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEE",
    overflow: "hidden"
  },
  suggestionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5"
  },
  suggestionName: {
    color: "#1A1A1A",
    fontSize: 14,
    fontFamily: "Inter-Medium"
  },
  suggestionCategory: {
    color: "#999",
    fontSize: 12,
    fontFamily: "Inter-Regular",
    textTransform: "capitalize"
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center"
  },
  actionButtonText: {
    color: "#4D4D4D",
    fontSize: 11,
    fontFamily: "Inter-Bold",
    marginLeft: 6
  },
  ingredientsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  ingredientCard: {
    width: (width - 56) / 2,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1
  },
  ingredientCardSelected: {
    borderColor: "#426D45"
  },
  removeIngredient: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1
  },
  ingredientImageContainer: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12
  },
  ingredientIcon: {
    width: 64,
    height: 64
  },
  ingredientName: {
    color: "#1A1A1A",
    fontSize: 14,
    fontFamily: "Inter-Bold",
    marginBottom: 6,
    textAlign: "center"
  },
  confidenceLabel: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  confidenceHigh: {
    backgroundColor: "#E8F5E9"
  },
  confidenceMedium: {
    backgroundColor: "#FFF9C4"
  },
  confidenceText: {
    fontSize: 8,
    fontFamily: "Inter-Bold",
    color: "#426D45"
  },
  selectedBadge: {
    marginTop: 8,
    backgroundColor: "#426D45",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  selectedBadgeText: {
    color: Colors.white,
    fontSize: 8,
    fontFamily: "Inter-Bold"
  },
  selectionLabelContainer: {
    alignItems: "center",
    marginVertical: 20
  },
  selectionButton: {
    backgroundColor: "#426D45",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20
  },
  selectionButtonText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: "Inter-Bold"
  },
  footerButtons: {
    marginTop: 10
  },
  generateButton: {
    backgroundColor: "#426D45",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12
  },
  generateButtonDisabled: {
    opacity: 0.5
  },
  generateButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Inter-Bold"
  },
  scanAgainButton: {
    backgroundColor: "#333",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center"
  },
  scanAgainButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Inter-Bold"
  },
  missingScan: {
    marginTop: 16,
    color: "#666",
    fontFamily: "Inter-Regular",
    fontSize: 14
  },
  processingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16
  },
  processingText: {
    marginLeft: 8,
    color: "#666",
    fontFamily: "Inter-Regular",
    fontSize: 14
  },
  emptyFilter: {
    textAlign: "center",
    color: "#666",
    fontFamily: "Inter-Regular",
    fontSize: 14,
    marginBottom: 16
  }
});
