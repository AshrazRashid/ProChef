import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Switch,
  Dimensions,
  ActivityIndicator,
  Alert
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useFocusEffect, CommonActions, useNavigation } from "@react-navigation/native";
import {
  ChevronLeft,
  Edit3,
  Target,
  Calculator,
  Sliders,
  Calendar,
  Utensils,
  Bell,
  Zap,
  Key,
  FileText,
  Shield,
  LogOut,
  Package,
  Camera
} from "lucide-react-native";
import { Colors } from "../constants/theme";
import { apiJson } from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  goalTypeLabel,
  dietTypeLabel,
  goalProgressPct,
  type MeResponse
} from "../api/profile";
import type { NotificationPreferences } from "../api/notifications";
import { scanApiErrorMessage } from "../api/scanUpload";

const { width } = Dimensions.get("window");

function displayUserName(user: MeResponse | null | undefined): string {
  if (!user) {
    return "—";
  }
  if (user.displayName?.trim()) {
    return user.displayName.trim();
  }
  const at = user.email.indexOf("@");
  return at > 0 ? user.email.slice(0, at) : user.email;
}

function formatWeightKg(kg: number | null | undefined): string {
  if (kg == null) {
    return "—";
  }
  return Number.isInteger(kg) ? String(kg) : kg.toFixed(1);
}

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user, signOut, refreshUser } = useAuth();
  const profile = user as MeResponse | null;
  const activeGoal = profile?.goals?.[0];
  const diet = profile?.dietProfile;

  const [prefsLoading, setPrefsLoading] = useState(true);
  const [expiryAlerts, setExpiryAlerts] = useState(true);
  const [mealSuggestions, setMealSuggestions] = useState(true);
  const [updatingPref, setUpdatingPref] = useState<"expiry" | "meal" | null>(null);

  const currentKg = profile?.weightKg ?? null;
  const targetKg = activeGoal?.targetWeightKg ?? null;
  const progressPct = goalProgressPct(currentKg, targetKg);
  const kgToTarget =
    currentKg != null && targetKg != null ? Math.abs(currentKg - targetKg) : null;

  const loadPrefs = useCallback(async () => {
    try {
      const res = await apiJson<NotificationPreferences>("/notifications/preferences", {
        method: "GET"
      });
      setExpiryAlerts(res.expiryPushEnabled);
      setMealSuggestions(res.mealPushEnabled);
    } catch (e: unknown) {
      Alert.alert("Notifications", scanApiErrorMessage(e, "Could not load preferences"));
    } finally {
      setPrefsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setPrefsLoading(true);
    await refreshUser();
    await loadPrefs();
  }, [refreshUser, loadPrefs]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const updatePref = async (
    field: "expiryPushEnabled" | "mealPushEnabled",
    value: boolean
  ) => {
    const prevExpiry = expiryAlerts;
    const prevMeal = mealSuggestions;
    const next = {
      expiryPushEnabled: field === "expiryPushEnabled" ? value : expiryAlerts,
      mealPushEnabled: field === "mealPushEnabled" ? value : mealSuggestions
    };

    if (field === "expiryPushEnabled") {
      setExpiryAlerts(value);
      setUpdatingPref("expiry");
    } else {
      setMealSuggestions(value);
      setUpdatingPref("meal");
    }

    try {
      const saved = await apiJson<NotificationPreferences>("/notifications/preferences", {
        method: "PUT",
        body: JSON.stringify(next)
      });
      setExpiryAlerts(saved.expiryPushEnabled);
      setMealSuggestions(saved.mealPushEnabled);
    } catch (e: unknown) {
      setExpiryAlerts(prevExpiry);
      setMealSuggestions(prevMeal);
      Alert.alert("Notifications", scanApiErrorMessage(e, "Could not update preferences"));
    } finally {
      setUpdatingPref(null);
    }
  };

  const macroTargets = diet
    ? [
        { l: "PROTEIN", v: `${Math.round(diet.proteinG)}g` },
        { l: "CALORIES", v: diet.calorieTarget.toLocaleString() },
        { l: "CARBS", v: `${Math.round(diet.carbG)}g` },
        { l: "FAT", v: `${Math.round(diet.fatG)}g` }
      ]
    : [
        { l: "PROTEIN", v: "—" },
        { l: "CALORIES", v: "—" },
        { l: "CARBS", v: "—" },
        { l: "FAT", v: "—" }
      ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Main")
          }
          style={styles.backButton}
          hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
        >
          <ChevronLeft color={Colors.primary} size={32} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer} pointerEvents="none">
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.userCard}>
          <View style={styles.avatarWrapper}>
            <Image source={require("../assets/images/avatar.png")} style={styles.userAvatar} />
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate("EditProfile")}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              activeOpacity={0.7}
            >
              <Edit3 size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{displayUserName(profile)}</Text>
        </View>

        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <View>
              <Text style={styles.goalLabel}>ACTIVE GOAL</Text>
              <Text style={styles.goalTitle}>
                {activeGoal ? goalTypeLabel(activeGoal.goalType) : "—"}
              </Text>
            </View>
            <Target size={24} color="#426D45" />
          </View>
          <View style={styles.weightRow}>
            <View>
              <Text style={styles.weightVal}>
                {formatWeightKg(currentKg)}{" "}
                <Text style={styles.weightUnit}>Kg</Text>
              </Text>
              <Text style={styles.weightLabel}>CURRENT</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.weightVal}>
                {formatWeightKg(targetKg)}{" "}
                <Text style={styles.weightUnit}>Kg</Text>
              </Text>
              <Text style={styles.weightLabel}>TARGET</Text>
            </View>
          </View>
          <View style={styles.goalProgressContainer}>
            <View style={[styles.goalFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {kgToTarget != null
              ? `${Number.isInteger(kgToTarget) ? kgToTarget : kgToTarget.toFixed(1)} kg to reach your target`
              : "Set your current and target weight to track progress"}
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Nutrition Targets</Text>
          <Calculator size={20} color={Colors.primary} />
        </View>
        <View style={styles.targetsGrid}>
          {macroTargets.map((t, i) => (
            <View key={i} style={styles.targetBox}>
              <Text style={styles.targetValue}>{t.v}</Text>
              <Text style={styles.targetLabel}>{t.l}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dietary Preferences</Text>
          <Sliders size={20} color={Colors.primary} />
        </View>
        <View style={styles.chipsRow}>
          {diet?.dietType ? (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{dietTypeLabel(diet.dietType)}</Text>
            </View>
          ) : (
            <View style={styles.chip}>
              <Text style={styles.chipText}>NOT SET</Text>
            </View>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Library</Text>
        </View>
        <View style={styles.libraryRow}>
          <TouchableOpacity
            style={styles.libCard}
            onPress={() => navigation.navigate("Main", { screen: "Planner" })}
          >
            <View style={styles.libIconCircle}>
              <Calendar size={24} color="#426D45" />
            </View>
            <Text style={styles.libText}>Meal Plans</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.libCard} onPress={() => navigation.navigate("Meals")}>
            <View style={styles.libIconCircle}>
              <Utensils size={24} color="#426D45" />
            </View>
            <Text style={styles.libText}>Saved Recipes</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.libWideCard} onPress={() => navigation.navigate("Pantry")}>
          <View style={styles.libIconCircle}>
            <Package size={24} color="#426D45" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.libText}>Pantry inventory</Text>
            <Text style={styles.libWideSub}>Manage what you have in stock</Text>
          </View>
          <ChevronLeft size={20} color="#CCC" style={{ transform: [{ rotate: "180deg" }] }} />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Smart Features</Text>
        </View>
        <View style={styles.featuresCard}>
          <View style={styles.featureRow}>
            <TouchableOpacity
              style={[styles.featIcon, { backgroundColor: "#E8F5E9" }]}
              onPress={() => navigation.navigate("ExpirationAlert")}
              activeOpacity={0.7}
            >
              <Bell size={20} color="#426D45" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.featInfo}
              onPress={() => navigation.navigate("ExpirationAlert")}
              activeOpacity={0.7}
            >
              <Text style={styles.featTitle}>Expiry Alerts</Text>
              <Text style={styles.featSub}>Notify before ingredients go bad</Text>
            </TouchableOpacity>
            {prefsLoading || updatingPref === "expiry" ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <Switch
                value={expiryAlerts}
                onValueChange={(v) => void updatePref("expiryPushEnabled", v)}
                trackColor={{ false: "#EEE", true: Colors.primary }}
              />
            )}
          </View>
          <View style={[styles.featureRow, { borderBottomWidth: 0 }]}>
            <View style={[styles.featIcon, { backgroundColor: "#E8F5E9" }]}>
              <Zap size={20} color="#426D45" />
            </View>
            <View style={styles.featInfo}>
              <Text style={styles.featTitle}>AI Meal Suggestions</Text>
              <Text style={styles.featSub}>Personalized recipes based on pantry</Text>
            </View>
            {prefsLoading || updatingPref === "meal" ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <Switch
                value={mealSuggestions}
                onValueChange={(v) => void updatePref("mealPushEnabled", v)}
                trackColor={{ false: "#EEE", true: Colors.primary }}
              />
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.premiumBanner}
          onPress={() => navigation.navigate("PremiumAccess")}
          activeOpacity={0.85}
        >
          <Text style={styles.premiumBadge}>MONTHLY PLAN</Text>
          <Text style={styles.premiumTitle}>Nourish Premium</Text>
          <Text style={styles.premiumDesc}>
            Unlock detailed macros, offline lists, and priority AI chefs.
          </Text>
          <View style={styles.upgradeBtn}>
            <Text style={styles.upgradeBtnText}>Upgrade to Yearly</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.listSectionTitle}>PREFERENCES</Text>
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => navigation.navigate("ProgressPhotos")}
        >
          <Camera size={20} color={Colors.primary} />
          <Text style={styles.listItemText}>Progress Photos</Text>
          <ChevronLeft size={20} color="#CCC" style={{ transform: [{ rotate: "180deg" }] }} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate("Security")}>
          <Key size={20} color={Colors.primary} />
          <Text style={styles.listItemText}>Change Password</Text>
          <ChevronLeft size={20} color="#CCC" style={{ transform: [{ rotate: "180deg" }] }} />
        </TouchableOpacity>

        <Text style={styles.listSectionTitle}>SUPPORT</Text>
        <TouchableOpacity style={styles.listItem}>
          <FileText size={20} color={Colors.primary} />
          <Text style={styles.listItemText}>Terms of Service</Text>
          <ChevronLeft size={20} color="#CCC" style={{ transform: [{ rotate: "180deg" }] }} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.listItem}>
          <Shield size={20} color={Colors.primary} />
          <Text style={styles.listItemText}>Privacy & Security</Text>
          <ChevronLeft size={20} color="#CCC" style={{ transform: [{ rotate: "180deg" }] }} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            await signOut();
            navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Welcome" }] }));
          }}
        >
          <LogOut size={20} color="#E57373" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
    height: 60
  },
  backButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10
  },
  headerTitleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1
  },
  headerTitle: { color: Colors.primary, fontSize: 18, fontFamily: "Inter-Bold" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60 },
  userCard: { alignItems: "center", marginVertical: 32 },
  avatarWrapper: { position: "relative", width: 100, height: 100 },
  userAvatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: "#FFF" },
  userName: { color: Colors.primary, fontSize: 24, fontFamily: "Inter-Bold", marginTop: 16 },
  editBtn: {
    position: "absolute",
    right: 0,
    bottom: 5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#426D45",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
    zIndex: 5
  },
  goalCard: {
    backgroundColor: "#FFF",
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: "#EEE",
    marginBottom: 32
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  goalLabel: {
    fontSize: 8,
    color: "#426D45",
    fontFamily: "Inter-Bold",
    letterSpacing: 1,
    marginBottom: 4
  },
  goalTitle: { fontSize: 22, color: Colors.primary, fontFamily: "Inter-Bold" },
  weightRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  weightVal: { fontSize: 20, color: Colors.primary, fontFamily: "Inter-Bold" },
  weightUnit: { fontSize: 12, color: "#999" },
  weightLabel: { fontSize: 8, color: "#999", fontFamily: "Inter-Bold" },
  goalProgressContainer: {
    height: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12
  },
  goalFill: { height: "100%", backgroundColor: "#426D45", borderRadius: 4 },
  progressText: { fontSize: 12, color: "#666", fontFamily: "Inter-Medium", textAlign: "center" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  sectionTitle: { fontSize: 16, color: Colors.primary, fontFamily: "Inter-Bold" },
  targetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 32
  },
  targetBox: {
    width: (width - 60) / 2,
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EEE"
  },
  targetValue: { fontSize: 18, color: Colors.primary, fontFamily: "Inter-Bold", marginBottom: 4 },
  targetLabel: { fontSize: 8, color: "#999", fontFamily: "Inter-Bold" },
  chipsRow: { flexDirection: "row", marginBottom: 32 },
  chip: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 10
  },
  chipText: { color: "#426D45", fontSize: 10, fontFamily: "Inter-Bold" },
  libraryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  libWideCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#EEE"
  },
  libWideSub: { fontSize: 11, color: "#999", fontFamily: "Inter-Regular", marginTop: 4 },
  libCard: {
    width: (width - 60) / 2,
    backgroundColor: "#FFF",
    paddingVertical: 24,
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#EEE"
  },
  libIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F9F9F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12
  },
  libText: { fontSize: 12, color: Colors.primary, fontFamily: "Inter-Bold" },
  featuresCard: {
    backgroundColor: "#FFF",
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: "#EEE",
    marginBottom: 32
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5"
  },
  featIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16
  },
  featInfo: { flex: 1 },
  featTitle: { fontSize: 16, color: Colors.primary, fontFamily: "Inter-Bold" },
  featSub: { fontSize: 10, color: "#999", fontFamily: "Inter-Regular" },
  premiumBanner: { backgroundColor: "#0D0D0D", borderRadius: 32, padding: 24, marginBottom: 32 },
  premiumBadge: {
    alignSelf: "flex-start",
    color: "#426D45",
    fontSize: 8,
    fontFamily: "Inter-Bold",
    letterSpacing: 1,
    marginBottom: 12
  },
  premiumTitle: { fontSize: 20, color: "#FFF", fontFamily: "Inter-Bold", marginBottom: 8 },
  premiumDesc: {
    fontSize: 12,
    color: "#999",
    fontFamily: "Inter-Regular",
    lineHeight: 18,
    marginBottom: 24
  },
  upgradeBtn: {
    backgroundColor: "rgba(66, 109, 69, 0.4)",
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#426D45"
  },
  upgradeBtnText: { color: "#E8F5E9", fontSize: 16, fontFamily: "Inter-Bold" },
  listSectionTitle: {
    fontSize: 10,
    color: "#999",
    fontFamily: "Inter-Bold",
    letterSpacing: 1,
    marginBottom: 16
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EEE"
  },
  listItemText: {
    flex: 1,
    marginLeft: 16,
    color: Colors.primary,
    fontSize: 14,
    fontFamily: "Inter-Bold"
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    padding: 20,
    borderRadius: 24,
    justifyContent: "center",
    marginTop: 20
  },
  logoutText: { color: "#E57373", fontSize: 16, fontFamily: "Inter-Bold", marginLeft: 12 }
});
