import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { CommonActions, useRoute } from "@react-navigation/native";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import { Colors } from "../constants/theme";
import { apiJson } from "../api/client";

export const ResetPasswordScreen = ({ navigation }: any) => {
  const route = useRoute<any>();
  const email = typeof route.params?.email === "string" ? route.params.email : "";
  const code = typeof route.params?.code === "string" ? route.params.code : "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email || !code) {
      Alert.alert("Reset password", "Missing reset details. Start again.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Reset password", "Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Reset password", "Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await apiJson("/auth/forgot-password/reset", {
        method: "POST",
        body: JSON.stringify({ email, code, newPassword: password })
      });
      Alert.alert("Reset password", "Password updated successfully.");
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "SignIn" }]
        })
      );
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Could not reset password";
      Alert.alert("Reset password", msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={Colors.white} size={28} />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Create a new password for {email || "your account"}.</Text>

        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="New password"
            placeholderTextColor={Colors.textSecondary}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword((p) => !p)}>
            {showPassword ? <EyeOff color={Colors.textSecondary} size={20} /> : <Eye color={Colors.textSecondary} size={20} />}
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            placeholderTextColor={Colors.textSecondary}
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirmPassword((p) => !p)}>
            {showConfirmPassword ? (
              <EyeOff color={Colors.textSecondary} size={20} />
            ) : (
              <Eye color={Colors.textSecondary} size={20} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.primaryButton} disabled={busy} onPress={() => void submit()}>
          {busy ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.primaryButtonText}>Update Password</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center"
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40
  },
  title: {
    color: Colors.white,
    fontSize: 28,
    fontFamily: "Inter-Bold",
    marginBottom: 10
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: "Inter-Regular",
    marginBottom: 24
  },
  inputWrap: {
    position: "relative",
    marginBottom: 16
  },
  input: {
    backgroundColor: "#1A1A1A",
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingRight: 52,
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    borderWidth: 1,
    borderColor: "#333"
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: 0,
    height: 56,
    justifyContent: "center"
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center"
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: "Inter-SemiBold"
  }
});
