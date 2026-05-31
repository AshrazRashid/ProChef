import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "../constants/theme";
import { apiJson } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { scanApiErrorMessage } from "../api/scanUpload";
import type { MeResponse } from "../api/profile";

export const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user, refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [age, setAge] = useState(user?.age != null ? String(user.age) : "");
  const [heightCm, setHeightCm] = useState(user?.heightCm != null ? String(user.heightCm) : "");
  const [weightKg, setWeightKg] = useState(user?.weightKg != null ? String(user.weightKg) : "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await apiJson<MeResponse>("/me", {
        method: "PATCH",
        body: JSON.stringify({
          displayName: displayName.trim() || undefined,
          age: age ? Number(age) : undefined,
          heightCm: heightCm ? Number(heightCm) : undefined,
          weightKg: weightKg ? Number(weightKg) : undefined
        })
      });
      await refreshUser();
      navigation.goBack();
    } catch (e: unknown) {
      Alert.alert("Profile", scanApiErrorMessage(e, "Could not save profile"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color="#426D45" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={() => void save()} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#426D45" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarContainer}>
          <Image source={require("../assets/images/avatar.png")} style={styles.avatar} />
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>DISPLAY NAME</Text>
            <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} placeholder="Your name" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput style={[styles.input, styles.inputDisabled]} value={user?.email ?? ""} editable={false} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>AGE</Text>
            <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="number-pad" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>HEIGHT (CM)</Text>
            <TextInput style={styles.input} value={heightCm} onChangeText={setHeightCm} keyboardType="decimal-pad" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>WEIGHT (KG)</Text>
            <TextInput style={styles.input} value={weightKg} onChangeText={setWeightKg} keyboardType="decimal-pad" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F2F5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF"
  },
  backButton: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { color: "#0D0D0D", fontSize: 18, fontFamily: "Inter-Bold" },
  saveText: { color: "#426D45", fontSize: 16, fontFamily: "Inter-Bold" },
  scrollContent: { paddingBottom: 40 },
  avatarContainer: { alignItems: "center", marginVertical: 32 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: "#FFF" },
  card: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    borderRadius: 32,
    padding: 24,
    elevation: 2
  },
  sectionTitle: { fontSize: 18, color: "#1A1A1A", fontFamily: "Inter-Bold", marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 10, color: "#999", fontFamily: "Inter-Bold", marginBottom: 8 },
  input: {
    backgroundColor: "#F5F7F9",
    height: 52,
    borderRadius: 20,
    paddingHorizontal: 20,
    color: "#333",
    fontFamily: "Inter-Medium",
    fontSize: 14
  },
  inputDisabled: { opacity: 0.6 }
});
