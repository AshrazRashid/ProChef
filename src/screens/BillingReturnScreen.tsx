import React, { useEffect, useRef } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { CommonActions, useNavigation, useRoute } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { Colors } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { apiJson } from "../api/client";
import { navigateToMainAfterCheckout } from "../navigation/afterCheckoutToMain";

function pickSessionId(params: Record<string, unknown> | undefined): string {
  if (!params) {
    return "";
  }
  const raw = params.session_id ?? params.sessionId;
  if (typeof raw === "string") {
    return raw;
  }
  if (Array.isArray(raw) && typeof raw[0] === "string") {
    return raw[0];
  }
  return "";
}

/**
 * Handles Stripe Checkout return URLs (see backend CHECKOUT_SUCCESS_URL / CHECKOUT_CANCEL_URL).
 * Must exist as a Stack screen so deep links like prochef://billing/success match navigation config.
 */
export function BillingReturnScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { refreshEntitlements, refreshUser } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) {
      return;
    }
    ran.current = true;

    const flow = route.name === "BillingSuccess" ? "success" : "cancel";

    void (async () => {
      await refreshUser();

      let sessionId = pickSessionId(route.params as Record<string, unknown> | undefined);
      if (!sessionId) {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          const parsed = Linking.parse(initialUrl);
          const q = parsed.queryParams ?? {};
          sessionId =
            (typeof q.session_id === "string" ? q.session_id : "") ||
            (typeof q.sessionId === "string" ? q.sessionId : "");
        }
      }

      if (flow === "success" && sessionId) {
        try {
          await apiJson("/billing/checkout-verify", {
            method: "POST",
            body: JSON.stringify({ sessionId })
          });
        } catch {
          /* fall through to entitlements polling */
        }
      }

      for (let i = 0; i < 12; i++) {
        const ent = await refreshEntitlements();
        if (flow === "success" && ent?.hasPro) {
          navigateToMainAfterCheckout(navigation);
          return;
        }
        await new Promise((r) => setTimeout(r, 800));
      }

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "PremiumAccess" }]
        })
      );
    })();
  }, [navigation, refreshEntitlements, refreshUser, route.name, route.params]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.secondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center"
  }
});
