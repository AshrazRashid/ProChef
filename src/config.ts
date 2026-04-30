import { Platform } from "react-native";

const fromEnv =
  typeof process.env.EXPO_PUBLIC_API_BASE_URL === "string" ? process.env.EXPO_PUBLIC_API_BASE_URL.trim() : "";

/** Backend base URL (no trailing slash). */
export const apiBaseUrl =
  fromEnv.replace(/\/$/, "") ||
  (Platform.OS === "android" ? "http://10.0.2.2:4000" : "http://127.0.0.1:4000");
