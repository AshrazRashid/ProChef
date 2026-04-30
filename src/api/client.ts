import * as SecureStore from "expo-secure-store";
import { apiBaseUrl } from "../config";

const ACCESS = "prochef_access_token";
const REFRESH = "prochef_refresh_token";

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS);
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS, accessToken);
  await SecureStore.setItemAsync(REFRESH, refreshToken);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS).catch(() => undefined);
  await SecureStore.deleteItemAsync(REFRESH).catch(() => undefined);
}

async function tryRefresh(): Promise<boolean> {
  const refresh = await SecureStore.getItemAsync(REFRESH);
  if (!refresh) {
    return false;
  }
  const res = await fetch(`${apiBaseUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: refresh })
  });
  if (!res.ok) {
    await clearTokens();
    return false;
  }
  const data = (await res.json()) as { accessToken: string; refreshToken: string };
  await setTokens(data.accessToken, data.refreshToken);
  return true;
}

export type ApiError = { message: string; status: number };

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = await getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (init.body != null && typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let res = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });
  if (res.status === 401) {
    const ok = await tryRefresh();
    if (ok) {
      const t2 = await getAccessToken();
      if (t2) {
        headers.set("Authorization", `Bearer ${t2}`);
      }
      res = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });
    }
  }
  return res;
}

export async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, init);
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = { message: text };
    }
  }
  if (!res.ok) {
    const msg =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message: unknown }).message)
        : res.statusText;
    throw { message: msg, status: res.status } satisfies ApiError;
  }
  return body as T;
}
