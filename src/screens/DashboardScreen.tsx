import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LayoutDashboard, Utensils, Scan, ChevronRight, Package, Timer } from "lucide-react-native";
import { Colors } from "../constants/theme";
import { apiJson } from "../api/client";
import { useAuth } from "../context/AuthContext";

type DashboardSummary = {
  intakeToday: { calories: number; proteinG: number; carbG: number; fatG: number; mealCount: number };
  targets: { calorieTarget: number; proteinG: number; carbG: number; fatG: number } | null;
  weight: { weightKg: number; loggedAt: string } | null;
  pantry?: { expiringSoonCount: number };
  recommendations: { top: { title: string; recipeId: string; score: number }[] };
};

type WeightLog = {
  weightKg: number;
  loggedAt: string;
};

type MealLogItem = {
  id: string;
  label: string | null;
  calories: number;
  proteinG: number;
  carbG: number;
  fatG: number;
};

function pct(cur: number, tgt: number): number {
  if (tgt <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((cur / tgt) * 100));
}

function dayAbbrev(iso: string): string {
  const d = new Date(iso);
  return ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][d.getUTCDay()] ?? "—";
}

function formatChartLabels(logs: WeightLog[]): string[] {
  const recent = [...logs].reverse().slice(-7);
  if (recent.length === 0) {
    return ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  }
  while (recent.length < 7) {
    recent.unshift({ weightKg: recent[0]?.weightKg ?? 0, loggedAt: recent[0]?.loggedAt ?? new Date().toISOString() });
  }
  return recent.map((l) => dayAbbrev(l.loggedAt));
}

function chartPointPositions(logs: WeightLog[]): number[] {
  const recent = [...logs].reverse().slice(-7);
  if (recent.length === 0) {
    return [40, 50, 30, 45, 35, 55, 45];
  }
  const weights = recent.map((l) => l.weightKg);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;
  return weights.map((w) => 20 + ((w - min) / range) * 60);
}

export const DashboardScreen = ({ navigation }: any) => {
  const { hasPro } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);

  const load = useCallback(async () => {
    if (!hasPro) {
      navigation.replace("PremiumAccess");
      return;
    }
    try {
      const [s, weightRes] = await Promise.all([
        apiJson<DashboardSummary>("/dashboard/summary", { method: "GET" }),
        apiJson<{ items: WeightLog[] }>("/tracking/weight-logs", { method: "GET" }).catch(() => ({ items: [] }))
      ]);
      setSummary(s);
      setWeightLogs(weightRes.items ?? []);
    } catch (e: unknown) {
      const status = e && typeof e === "object" && "status" in e ? (e as { status: number }).status : 0;
      if (status === 402) {
        navigation.replace("PremiumAccess");
      }
    }
  }, [hasPro, navigation]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const handleViewJournal = async () => {
    try {
      const res = await apiJson<{ items: MealLogItem[] }>("/tracking/meal-logs", { method: "GET" });
      const count = res.items?.length ?? 0;
      if (count === 0) {
        Alert.alert("Food Journal", "No meals logged today yet.", [
          { text: "Go to Meals", onPress: () => navigation.navigate("Main", { screen: "Meal" }) },
          { text: "OK", style: "cancel" }
        ]);
      } else {
        const lines = (res.items ?? [])
          .slice(0, 5)
          .map((m) => `• ${m.label ?? "Meal"} — ${m.calories} kcal`)
          .join("\n");
        Alert.alert(
          "Today's Journal",
          `${count} meal${count === 1 ? "" : "s"} logged today:\n\n${lines}${count > 5 ? `\n…and ${count - 5} more` : ""}`
        );
      }
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: string }).message)
          : "Could not load meal logs";
      Alert.alert("Food Journal", msg);
    }
  };

  const intake = summary?.intakeToday;
  const targets = summary?.targets;
  const expiringCount = summary?.pantry?.expiringSoonCount ?? 0;
  const chartLabels = formatChartLabels(weightLogs);
  const chartBottoms = chartPointPositions(weightLogs);
  const latestWeight = weightLogs[0] ?? summary?.weight;

  const nutrients =
    targets && intake
      ? [
          {
            label: "PROTEIN",
            current: `${Math.round(intake.proteinG)}g`,
            target: `${Math.round(targets.proteinG)}g`,
            percent: pct(intake.proteinG, targets.proteinG),
            color: "#426D45"
          },
          {
            label: "CARBS",
            current: `${Math.round(intake.carbG)}g`,
            target: `${Math.round(targets.carbG)}g`,
            percent: pct(intake.carbG, targets.carbG),
            color: "#FFB74D"
          },
          {
            label: "FATS",
            current: `${Math.round(intake.fatG)}g`,
            target: `${Math.round(targets.fatG)}g`,
            percent: pct(intake.fatG, targets.fatG),
            color: "#4FC3F7"
          }
        ]
      : [
          { label: "PROTEIN", current: "—", target: "—", percent: 0, color: "#426D45" },
          { label: "CARBS", current: "—", target: "—", percent: 0, color: "#FFB74D" },
          { label: "FATS", current: "—", target: "—", percent: 0, color: "#4FC3F7" }
        ];

  const calConsumed = intake?.calories ?? 0;
  const calGoal = targets?.calorieTarget ?? 0;
  const calLeft = Math.max(0, calGoal - calConsumed);

  const recentWins =
    summary?.recommendations?.top?.map((t) => ({
      name: t.title,
      time: "—",
      cals: `${Math.round(t.score * 100)}% match`,
      image: require("../assets/images/MediterraneanSalmonBowl.png")
    })) ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Image source={require("../assets/images/avatar.png")} style={styles.avatar} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {expiringCount > 0 ? (
          <TouchableOpacity
            style={styles.expiryBanner}
            onPress={() => navigation.navigate("ExpirationAlert")}
            activeOpacity={0.85}
          >
            <Timer size={22} color="#E57373" strokeWidth={2} />
            <View style={styles.pantryBannerText}>
              <Text style={styles.expiryBannerTitle}>
                {expiringCount} item{expiringCount === 1 ? "" : "s"} expiring soon
              </Text>
              <Text style={styles.expiryBannerSub}>Tap to see recipes that use them up</Text>
            </View>
            <ChevronRight size={20} color="#E57373" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.pantryBanner}
          onPress={() => navigation.navigate("Pantry")}
          activeOpacity={0.85}
        >
          <Package size={22} color={Colors.primary} strokeWidth={2} />
          <View style={styles.pantryBannerText}>
            <Text style={styles.pantryBannerTitle}>Pantry inventory</Text>
            <Text style={styles.pantryBannerSub}>Add, edit, or remove what you keep in stock</Text>
          </View>
          <ChevronRight size={20} color="#BBB" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <Text style={styles.todayTitle}>Today's Intake</Text>
        <Text style={styles.todaySub}>You're maintaining a steady kinetic rhythm.</Text>

        <View style={styles.donutCard}>
          <View style={styles.donutOuter}>
            <View style={styles.donutInner}>
              <Text style={styles.donutValue}>{calConsumed}</Text>
              <Text style={styles.donutLabel}>kcal consumed</Text>
            </View>
          </View>
          <View style={styles.goalRow}>
            <Text style={styles.goalText}>
              Goal:{" "}
              <Text style={[styles.goalText, { color: "#426D45" }]}>{calGoal || "—"} kcal</Text>
            </Text>
            <Text style={styles.goalText}>
              Left: <Text style={[styles.goalText, { color: "#FFB74D" }]}>{calGoal ? calLeft : "—"} kcal</Text>
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nutrient Precision</Text>
          <Text style={styles.sectionSubtitle}>DAILY TARGETS</Text>
        </View>
        <View style={styles.nutrientCard}>
          {nutrients.map((n, i) => (
            <View key={i} style={styles.nutrientRow}>
              <View style={styles.nutrientLabelRow}>
                <View style={[styles.dot, { backgroundColor: n.color }]} />
                <Text style={styles.nutrientLabel}>{n.label}</Text>
                <Text style={styles.nutrientValue}>
                  {n.current} <Text style={{ color: "#BBB" }}>/ {n.target}</Text>
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${n.percent}%`, backgroundColor: n.color }]} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.weightCard}>
          <View style={styles.weightHeader}>
            <View>
              <Text style={styles.weightTitle}>Weight Trends</Text>
              <Text style={styles.weightSub}>Recent logs</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.currentWeight}>
                {latestWeight ? latestWeight.weightKg.toFixed(1) : "—"}{" "}
                <Text style={styles.weightUnit}>KG</Text>
              </Text>
              <Text style={styles.weightChange}>Latest log</Text>
            </View>
          </View>
          <View style={styles.chartContainer}>
            <View style={styles.chartLine} />
            <View style={styles.chartFill} />
            {chartBottoms.map((bottom, idx) => (
              <View
                key={idx}
                style={[
                  styles.chartPoint,
                  {
                    left: `${(idx / Math.max(chartBottoms.length - 1, 1)) * 90 + 5}%`,
                    bottom: `${bottom}%`
                  }
                ]}
              />
            ))}
          </View>
          <View style={styles.chartLabels}>
            {chartLabels.map((d, i) => (
              <Text key={`${d}-${i}`} style={styles.chartLabelText}>
                {d}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Kitchen Wins</Text>
          <TouchableOpacity onPress={() => void handleViewJournal()}>
            <Text style={styles.viewJournal}>View Journal</Text>
          </TouchableOpacity>
        </View>
        {(recentWins.length
          ? recentWins
          : [
              {
                name: "No recommendations yet",
                time: "",
                cals: "Scan your pantry",
                image: require("../assets/images/QuinoaSalad.png")
              }
            ]
        ).map((win, idx) => (
          <View key={idx} style={styles.winCard}>
            <View style={styles.winImageContainer}>
              <Image source={win.image} style={styles.winImage} />
            </View>
            <View style={styles.winInfo}>
              <Text style={styles.winName}>{win.name}</Text>
              <View style={styles.winStats}>
                <Utensils size={12} color="#999" />
                <Text style={styles.winStatText}>{win.time}</Text>
                <View style={styles.statDivider} />
                <LayoutDashboard size={12} color="#999" />
                <Text style={styles.winStatText}>{win.cals}</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#EEE" />
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.scanFab} onPress={() => navigation.navigate("CameraScan")}>
        <Scan color={Colors.white} size={28} />
        <Text style={styles.scanFabText}>Scan</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  expiryBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#FFCDD2"
  },
  expiryBannerTitle: { fontSize: 15, color: "#C62828", fontFamily: "Inter-Bold" },
  expiryBannerSub: { fontSize: 12, color: "#E57373", fontFamily: "Inter-Regular", marginTop: 2 },
  pantryBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#EEE"
  },
  pantryBannerText: { flex: 1, marginLeft: 12 },
  pantryBannerTitle: { fontSize: 15, color: Colors.primary, fontFamily: "Inter-Bold" },
  pantryBannerSub: { fontSize: 12, color: "#888", fontFamily: "Inter-Regular", marginTop: 2 },
  todayTitle: { fontSize: 20, color: "#1A1A1A", fontFamily: "Inter-Bold", marginTop: 24 },
  todaySub: { fontSize: 13, color: "#999", fontFamily: "Inter-Regular", marginTop: 4, marginBottom: 24 },
  donutCard: {
    backgroundColor: "#FFF",
    borderRadius: 40,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEE"
  },
  donutOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 12,
    borderColor: "#426D45",
    justifyContent: "center",
    alignItems: "center"
  },
  donutInner: { alignItems: "center" },
  donutValue: { fontSize: 36, color: Colors.primary, fontFamily: "Inter-Bold" },
  donutLabel: { fontSize: 10, color: "#999", fontFamily: "Inter-Medium", marginTop: 4 },
  goalRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 24 },
  goalText: { fontSize: 12, color: "#999", fontFamily: "Inter-Bold" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 32,
    marginBottom: 16
  },
  sectionTitle: { fontSize: 18, color: Colors.primary, fontFamily: "Inter-Bold" },
  sectionSubtitle: { fontSize: 10, color: "#999", fontFamily: "Inter-Bold" },
  nutrientCard: { backgroundColor: "#FFF", borderRadius: 32, padding: 24, borderWidth: 1, borderColor: "#EEE" },
  nutrientRow: { marginBottom: 20 },
  nutrientLabelRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  nutrientLabel: { flex: 1, fontSize: 12, color: "#666", fontFamily: "Inter-Bold" },
  nutrientValue: { fontSize: 12, color: "#1A1A1A", fontFamily: "Inter-Bold" },
  progressBar: { height: 6, backgroundColor: "#F5F5F5", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  weightCard: {
    backgroundColor: "#FFF",
    borderRadius: 32,
    padding: 24,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#EEE"
  },
  weightHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  weightTitle: { fontSize: 16, color: Colors.primary, fontFamily: "Inter-Bold" },
  weightSub: { fontSize: 10, color: "#999", fontFamily: "Inter-Medium" },
  currentWeight: { fontSize: 24, color: Colors.primary, fontFamily: "Inter-Bold" },
  weightUnit: { fontSize: 12, color: "#999" },
  weightChange: { fontSize: 12, color: "#426D45", fontFamily: "Inter-Bold", marginTop: 4 },
  chartContainer: { height: 80, justifyContent: "center", marginVertical: 20 },
  chartLine: { height: 2, backgroundColor: "rgba(66, 109, 69, 0.2)", width: "100%" },
  chartFill: {
    height: 40,
    backgroundColor: "rgba(66, 109, 69, 0.05)",
    position: "absolute",
    bottom: 0,
    width: "100%"
  },
  chartPoint: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#426D45",
    borderWidth: 2,
    borderColor: "#FFF"
  },
  chartLabels: { flexDirection: "row", justifyContent: "space-between" },
  chartLabelText: { fontSize: 9, color: "#CCC", fontFamily: "Inter-Bold" },
  viewJournal: { fontSize: 12, color: "#426D45", fontFamily: "Inter-Bold" },
  winCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEE"
  },
  winImageContainer: { width: 56, height: 56, borderRadius: 16, overflow: "hidden" },
  winImage: { width: "100%", height: "100%" },
  winInfo: { flex: 1, marginLeft: 16 },
  winName: { fontSize: 14, color: Colors.primary, fontFamily: "Inter-Bold", marginBottom: 4 },
  winStats: { flexDirection: "row", alignItems: "center" },
  winStatText: { fontSize: 11, color: "#999", fontFamily: "Inter-Regular", marginLeft: 6 },
  statDivider: { width: 1, height: 10, backgroundColor: "#EEE", marginHorizontal: 10 },
  scanFab: {
    position: "absolute",
    bottom: 100,
    right: 20,
    backgroundColor: "#426D45",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5
  },
  scanFabText: { color: Colors.white, fontSize: 14, fontFamily: "Inter-Bold", marginLeft: 10 }
});
