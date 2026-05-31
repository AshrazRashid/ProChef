import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { ChevronLeft, Plus } from "lucide-react-native";
import { Colors } from "../constants/theme";
import { apiJson } from "../api/client";
import { scanApiErrorMessage } from "../api/scanUpload";

type ProgressPhoto = {
  id: string;
  imageUrl: string;
  monthKey: string;
  note: string | null;
  createdAt: string;
};

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export const ProgressPhotosScreen = ({ navigation }: { navigation: { goBack: () => void } }) => {
  const [items, setItems] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiJson<{ items: ProgressPhoto[] }>("/progress-photos", { method: "GET" });
      setItems(res.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const addPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Permission", "Photo library access is required.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const contentType = asset.mimeType ?? "image/jpeg";
    setUploading(true);
    try {
      const meta = await apiJson<{ objectKey: string; uploadUrl: string }>("/progress-photos/upload-url", {
        method: "POST",
        body: JSON.stringify({ contentType })
      });
      const blob = await (await fetch(asset.uri)).blob();
      const put = await fetch(meta.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: blob
      });
      if (!put.ok) {
        throw new Error("Could not upload photo");
      }
      await apiJson("/progress-photos", {
        method: "POST",
        body: JSON.stringify({
          objectKey: meta.objectKey,
          monthKey: currentMonthKey(),
          note: "Progress photo"
        })
      });
      await load();
    } catch (e: unknown) {
      Alert.alert("Upload", scanApiErrorMessage(e, "Could not save progress photo"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={Colors.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progress Photos</Text>
        <TouchableOpacity onPress={() => void addPhoto()} disabled={uploading}>
          {uploading ? <ActivityIndicator color={Colors.primary} /> : <Plus color={Colors.primary} size={24} />}
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {items.length === 0 ? (
            <Text style={styles.empty}>No progress photos yet. Tap + to add one.</Text>
          ) : (
            items.map((item) => (
              <View key={item.id} style={styles.card}>
                <Image source={require("../assets/images/avatar.png")} style={styles.thumb} />
                <View style={styles.cardBody}>
                  <Text style={styles.month}>{item.monthKey}</Text>
                  <Text style={styles.note}>{item.note ?? "Progress photo"}</Text>
                  <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
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
  backButton: { padding: 4 },
  headerTitle: { color: Colors.primary, fontSize: 18, fontFamily: "Inter-Bold" },
  scroll: { padding: 20, paddingBottom: 40 },
  empty: { textAlign: "center", color: "#666", fontFamily: "Inter-Regular", marginTop: 24 },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEE"
  },
  thumb: { width: 56, height: 56, borderRadius: 12 },
  cardBody: { flex: 1, marginLeft: 14 },
  month: { fontSize: 14, fontFamily: "Inter-Bold", color: Colors.primary },
  note: { fontSize: 12, color: "#666", fontFamily: "Inter-Regular", marginTop: 4 },
  date: { fontSize: 10, color: "#999", marginTop: 6, fontFamily: "Inter-Regular" }
});
