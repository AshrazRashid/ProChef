import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ChevronLeft, Settings, Zap } from "lucide-react-native";
import { Colors } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { apiFetch, apiJson } from "../api/client";

const { width } = Dimensions.get("window");

export const CameraScanScreen = ({ navigation }: any) => {
  const { hasPro } = useAuth();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!hasPro) {
      navigation.replace("PremiumAccess");
    }
  }, [hasPro, navigation]);

  const startUpload = useCallback(
    async (uri: string, mime: string) => {
      setBusy(true);
      try {
        const meta = await apiJson<{
          scanSessionId: string;
          uploadUrl: string;
          objectKey: string;
        }>("/scans/upload-url", {
          method: "POST",
          body: JSON.stringify({ contentType: mime })
        });
        const fileRes = await fetch(uri);
        const blob = await fileRes.blob();
        const put = await fetch(meta.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": mime },
          body: blob
        });
        if (!put.ok) {
          throw new Error("Could not upload image to storage");
        }
        const queue = await apiFetch("/scans", {
          method: "POST",
          body: JSON.stringify({ scanSessionId: meta.scanSessionId })
        });
        if (queue.status === 402) {
          navigation.replace("PremiumAccess");
          return;
        }
        if (!queue.ok) {
          const j = await queue.json().catch(() => ({}));
          throw new Error(typeof j.message === "string" ? j.message : "Failed to queue scan");
        }
        navigation.navigate("Ingredients", { scanId: meta.scanSessionId });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Scan failed";
        Alert.alert("Scan", msg);
      } finally {
        setBusy(false);
      }
    },
    [navigation]
  );

  const pick = async (source: "camera" | "library") => {
    const perm =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Permission", "Camera or photo library access is required to scan food.");
      return;
    }
    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.75
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.75
          });
    if (result.canceled) {
      return;
    }
    const asset = result.assets[0];
    const mime = asset.mimeType ?? "image/jpeg";
    await startUpload(asset.uri, mime);
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/images/loginImage.png")}
        style={styles.cameraView}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circularButton}>
              <ChevronLeft color={Colors.white} size={24} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Scan ingredients</Text>
              <Text style={styles.stepText}>Upload is processed on the server</Text>
            </View>
            <TouchableOpacity style={styles.circularButton}>
              <Settings color={Colors.white} size={24} />
            </TouchableOpacity>
          </View>
          <View style={styles.viewfinderContainer}>
            <View style={styles.viewfinder}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                TAKE A PHOTO OF YOUR FRIDGE,{"\n"}PANTRY, OR GROCERIES
              </Text>
            </View>
            {busy && (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={Colors.white} size="large" />
                <Text style={styles.loadingText}>Uploading and starting scan…</Text>
              </View>
            )}
          </View>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.flashButton} disabled={busy}>
              <Zap color={Colors.white} size={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shutterContainer} disabled={busy} onPress={() => void pick("camera")}>
              <View style={styles.shutterInner}>
                <Image source={require("../assets/icons/photo.png")} style={styles.cameraIcon} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.galleryButton} disabled={busy} onPress={() => void pick("library")}>
              <Image source={require("../assets/icons/gallery.png")} style={styles.galleryIcon} />
              <Text style={styles.galleryText}>UPLOAD FROM GALLERY</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000"
  },
  cameraView: {
    flex: 1
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "space-between"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10
  },
  circularButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center"
  },
  headerTitleContainer: {
    alignItems: "center"
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: "Inter-SemiBold"
  },
  stepText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: "Inter-Regular"
  },
  viewfinderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  viewfinder: {
    width: width * 0.75,
    height: width * 0.9,
    position: "relative"
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: Colors.secondary
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 20
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 20
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 20
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 20
  },
  instructionContainer: {
    marginTop: 30,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20
  },
  instructionText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "Inter-Bold",
    textAlign: "center",
    letterSpacing: 1
  },
  loadingBox: {
    marginTop: 24,
    alignItems: "center"
  },
  loadingText: {
    marginTop: 8,
    color: Colors.white,
    fontSize: 12,
    fontFamily: "Inter-Regular"
  },
  footer: {
    paddingBottom: 40,
    alignItems: "center",
    paddingHorizontal: 24
  },
  flashButton: {
    position: "absolute",
    left: 40,
    bottom: 80,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center"
  },
  shutterContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center"
  },
  cameraIcon: {
    width: 32,
    height: 32,
    tintColor: Colors.white
  },
  galleryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)"
  },
  galleryIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: Colors.white
  },
  galleryText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "Inter-Bold"
  }
});
