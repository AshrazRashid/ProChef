import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ChevronLeft, CreditCard, Lock, ShieldCheck } from "lucide-react-native";
import { Colors } from "../constants/theme";

export const AddCardScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={Colors.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <CreditCard color={Colors.primary} size={40} />
        </View>

        <Text style={styles.title}>Payments use Stripe Checkout</Text>
        <Text style={styles.message}>
          ProChef does not collect card details in the app. When you subscribe, you'll be redirected to Stripe's
          secure checkout page to enter your payment information.
        </Text>

        <View style={styles.infoRow}>
          <ShieldCheck color={Colors.primary} size={18} />
          <Text style={styles.infoText}>256-bit encryption handled by Stripe</Text>
        </View>
        <View style={styles.infoRow}>
          <Lock color={Colors.primary} size={18} />
          <Text style={styles.infoText}>No card data stored on your device</Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("PremiumAccess")}>
          <Text style={styles.primaryButtonText}>View Premium Plans</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  backButton: {
    padding: 4
  },
  headerTitle: {
    color: Colors.primary,
    fontSize: 18,
    fontFamily: "Inter-Bold",
    marginLeft: 10
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
    alignItems: "center"
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32
  },
  title: {
    color: Colors.primary,
    fontSize: 22,
    fontFamily: "Inter-Bold",
    textAlign: "center",
    marginBottom: 16
  },
  message: {
    color: "#666",
    fontSize: 15,
    fontFamily: "Inter-Regular",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    marginBottom: 12,
    paddingHorizontal: 8
  },
  infoText: {
    color: "#888",
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginLeft: 12
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch",
    marginTop: 32
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: "Inter-SemiBold"
  }
});
