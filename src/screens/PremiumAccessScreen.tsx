import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  Linking,
  AppState,
  type AppStateStatus
} from 'react-native';
import { CommonActions } from "@react-navigation/native";
import { beginCheckoutReturnNavigation, navigateToMainAfterCheckout } from "../navigation/afterCheckoutToMain";
import { X, CheckCircle2, ShieldCheck, CalendarRange, Star, Package } from 'lucide-react-native';
import { Colors } from '../constants/theme';
import { apiJson } from '../api/client';
import { useAuth } from '../context/AuthContext';
const { width } = Dimensions.get('window');

type BillingPlan = {
  code: string;
  amountCents: number;
  currency: string;
  interval: string;
};

function formatPlanPrice(amountCents: number): string {
  return `$${(amountCents / 100).toFixed(2)}`;
}

function savingsPercent(monthlyCents: number, yearlyCents: number): number | null {
  if (monthlyCents <= 0) return null;
  const yearlyEquivalent = monthlyCents * 12;
  if (yearlyEquivalent <= yearlyCents) return null;
  return Math.round(((yearlyEquivalent - yearlyCents) / yearlyEquivalent) * 100);
}

export const PremiumAccessScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { refreshEntitlements, refreshUser, signOut } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [monthlyPrice, setMonthlyPrice] = useState('$7.99');
  const [yearlyPrice, setYearlyPrice] = useState('$54.99');
  const [yearlySavings, setYearlySavings] = useState<number | null>(42);
  const pollUntilRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  /** Last Stripe Checkout session — used to sync subscription when the user returns without a deep link (e.g. app switcher). */
  const pendingCheckoutSessionIdRef = useRef<string | null>(null);

  const clearCheckoutPoll = () => {
    if (pollUntilRef.current !== null) {
      clearInterval(pollUntilRef.current);
      pollUntilRef.current = null;
    }
  };

  const verifyPendingCheckoutSession = useCallback(async () => {
    const sid = pendingCheckoutSessionIdRef.current;
    if (!sid || !sid.startsWith("cs_")) {
      return;
    }
    try {
      await apiJson("/billing/checkout-verify", {
        method: "POST",
        body: JSON.stringify({ sessionId: sid })
      });
    } catch {
      /* entitlements polling still runs below */
    }
  }, []);

  const tryNavigateToMainIfPro = useCallback(async (): Promise<boolean> => {
    await verifyPendingCheckoutSession();
    await refreshUser();
    const ent = await refreshEntitlements();
    if (ent?.hasPro) {
      pendingCheckoutSessionIdRef.current = null;
      clearCheckoutPoll();
      navigateToMainAfterCheckout(navigation);
      return true;
    }
    return false;
  }, [navigation, refreshEntitlements, refreshUser, verifyPendingCheckoutSession]);

  const startCheckoutPolling = useCallback(() => {
    clearCheckoutPoll();
    const deadline = Date.now() + 120_000;
    pollUntilRef.current = setInterval(() => {
      void (async () => {
        if (Date.now() > deadline) {
          clearCheckoutPoll();
          return;
        }
        await tryNavigateToMainIfPro();
      })();
    }, 2500);
  }, [tryNavigateToMainIfPro]);

  useEffect(() => {
    return () => clearCheckoutPoll();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiJson<{ plans: BillingPlan[] }>("/billing/plans", { method: "GET" });
        const monthly = res.plans?.find((p) => p.interval === "month");
        const yearly = res.plans?.find((p) => p.interval === "year");
        if (monthly) setMonthlyPrice(formatPlanPrice(monthly.amountCents));
        if (yearly) setYearlyPrice(formatPlanPrice(yearly.amountCents));
        if (monthly && yearly) {
          setYearlySavings(savingsPercent(monthly.amountCents, yearly.amountCents));
        }
      } catch {
        /* keep fallback prices */
      }
    })();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      if (prev.match(/inactive|background/) && next === "active" && pollUntilRef.current !== null) {
        void tryNavigateToMainIfPro();
      }
    });
    return () => sub.remove();
  }, [tryNavigateToMainIfPro]);

  const features = [
    { title: 'Unlimited AI Scans', desc: 'Instant nutritional data for any dish.' },
    { title: 'Advanced AI Meal Plans', desc: 'Evolving plans that learn your tastes.' },
    { title: 'Detailed Macro Customization', desc: 'Granular control over every nutrient.' },
    { title: 'Full Meal Prep Planner', desc: 'Automated grocery lists and timings.' },
    { title: 'Exclusive Nutrition Insights', desc: 'Deep dives into your metabolic health.' },
    { title: 'Priority Support', desc: 'Direct access to our expert team.' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Main"))}
          style={styles.closeButton}
        >
          <X color={Colors.white} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium Access</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Section */}
        <View style={styles.hero}>
           <View style={styles.invitationBadge}>
              <Text style={styles.invitationText}>EXCLUSIVE INVITATION</Text>
           </View>
           <Text style={styles.title}>
             Prochef AI <Text style={styles.titleAccent}>Premium</Text>
           </Text>
           <Text style={styles.subtitle}>
             Elevate your wellness journey with our most advanced AI-powered nutritional precision.
           </Text>
        </View>
        {/* Pricing Plans */}
        <View style={styles.plansContainer}>
          {/* Monthly Plan */}
          <TouchableOpacity 
            style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardActive]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <Text style={styles.planType}>MONTHLY</Text>
            <View style={styles.priceRow}>
               <Text style={styles.price}>{monthlyPrice}</Text>
               <Text style={styles.pricePeriod}>/mo</Text>
            </View>
            <Text style={styles.planDesc}>Flexible month-to-month access to all premium features.</Text>
            <View style={styles.planLine} />
          </TouchableOpacity>
          {/* Yearly Plan */}
          <TouchableOpacity 
            style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardActive]}
            onPress={() => setSelectedPlan('yearly')}
          >
            <View style={styles.yearlyHeader}>
              <Text style={styles.planType}>YEARLY</Text>
              <View style={styles.bestValueBadge}>
                 <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
              <View style={styles.saveBadge}>
                 <Text style={styles.saveText}>
                   {yearlySavings != null ? `SAVE ${yearlySavings}%` : "BEST VALUE"}
                 </Text>
              </View>
            </View>
            <View style={styles.priceRow}>
               <Text style={styles.price}>{yearlyPrice}</Text>
               <Text style={styles.pricePeriod}>/year</Text>
            </View>
            <Text style={styles.planDesc}>Our most popular choice for long-term health transformation.</Text>
            <View style={[styles.planLine, styles.planLineActive]} />
          </TouchableOpacity>
        </View>
        {/* Features List */}
        <View style={styles.featuresSection}>
           <Text style={styles.featuresTitle}>Unlock Full Capability</Text>
           {features.map((item, index) => (
             <View key={index} style={styles.featureItem}>
                <CheckCircle2 color={Colors.secondary} size={24} />
                <View style={styles.featureText}>
                   <Text style={styles.featureItemTitle}>{item.title}</Text>
                   <Text style={styles.featureItemDesc}>{item.desc}</Text>
                </View>
             </View>
           ))}
        </View>
        {/* Confidence Row */}
        <View style={styles.confidenceRow}>
           <View style={styles.confidenceItem}>
              <ShieldCheck color={Colors.white} size={16} />
              <Text style={styles.confidenceText}>SECURE PAYMENT</Text>
           </View>
           <View style={styles.confidenceItem}>
              <CalendarRange color={Colors.white} size={16} />
              <Text style={styles.confidenceText}>CANCEL ANYTIME</Text>
           </View>
        </View>
        <View style={styles.ratingRow}>
           <Star color={Colors.white} size={16} fill={Colors.white} />
           <Text style={styles.ratingText}>4.9/5 USER RATING</Text>
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(16, insets.bottom + 12) }]}>
        <TouchableOpacity 
          style={styles.primaryButton}
          disabled={checkoutLoading}
          onPress={async () => {
            setCheckoutLoading(true);
            try {
              const res = await apiJson<{ checkoutUrl: string | null; sessionId?: string }>(
                "/billing/checkout-session",
                {
                  method: "POST",
                  body: JSON.stringify({ plan: selectedPlan })
                }
              );
              if (!res.checkoutUrl) {
                Alert.alert("Billing", "No checkout URL returned.");
                return;
              }
              if (typeof res.sessionId === "string" && res.sessionId.startsWith("cs_")) {
                pendingCheckoutSessionIdRef.current = res.sessionId;
              }
              beginCheckoutReturnNavigation();
              const can = await Linking.canOpenURL(res.checkoutUrl);
              if (can) {
                await Linking.openURL(res.checkoutUrl);
              }
              startCheckoutPolling();
              void tryNavigateToMainIfPro();
            } catch (e: unknown) {
              const msg =
                e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Checkout failed";
              Alert.alert("Billing", msg);
            } finally {
              setCheckoutLoading(false);
            }
          }}
        >
          {checkoutLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.primaryButtonText}>Subscribe with Stripe</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.pantryOutlineButton}
          onPress={() => navigation.navigate("Pantry")}
          activeOpacity={0.85}
        >
          <Package color={Colors.secondary} size={20} strokeWidth={2} />
          <Text style={styles.pantryOutlineButtonText}>Manage pantry (no subscription)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await signOut();
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "Welcome" }]
              })
            );
          }}
        >
          <Text style={styles.logoutButtonText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 10,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#0D0D0D",
  },
  hero: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  invitationBadge: {
    backgroundColor: 'rgba(66, 109, 69, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  invitationText: {
    color: Colors.secondary,
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    letterSpacing: 1,
  },
  title: {
    color: Colors.white,
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
  },
  titleAccent: {
    color: Colors.secondary,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  plansContainer: {
    marginBottom: 40,
  },
  planCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 32,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  planCardActive: {
    borderColor: Colors.secondary,
    backgroundColor: 'rgba(66, 109, 69, 0.05)',
  },
  planType: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    letterSpacing: 2,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  price: {
    color: Colors.white,
    fontSize: 36,
    fontFamily: 'Inter-Bold',
  },
  pricePeriod: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  planDesc: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 20,
  },
  planLine: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    width: '100%',
  },
  planLineActive: {
    backgroundColor: Colors.secondary,
  },
  yearlyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bestValueBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
  },
  bestValueText: {
    color: '#999',
    fontSize: 8,
    fontFamily: 'Inter-Bold',
  },
  saveBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  saveText: {
    color: Colors.white,
    fontSize: 8,
    fontFamily: 'Inter-Bold',
  },
  featuresSection: {
    backgroundColor: '#1A1A1A',
    borderRadius: 32,
    padding: 24,
    marginBottom: 40,
  },
  featuresTitle: {
    color: Colors.white,
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  featureText: {
    marginLeft: 15,
    flex: 1,
  },
  featureItemTitle: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  featureItemDesc: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confidenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  confidenceText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    marginLeft: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  ratingText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    marginLeft: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  pantryOutlineButton: {
    marginTop: 12,
    minHeight: 52,
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(129, 199, 132, 0.55)",
    backgroundColor: "rgba(129, 199, 132, 0.08)"
  },
  pantryOutlineButtonText: {
    color: Colors.secondary,
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
    marginLeft: 10
  },
  logoutButton: {
    marginTop: 14,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  logoutButtonText: {
    color: '#E57373',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});
