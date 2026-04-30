import * as Linking from "expo-linking";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiBaseUrl } from "../config";
import { apiFetch, apiJson, clearTokens, getAccessToken, setTokens } from "../api/client";

export type AuthUser = {
  id: string;
  email: string;
  age?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  sex?: string | null;
  dietProfile?: {
    calorieTarget: number;
    proteinG: number;
    carbG: number;
    fatG: number;
    dietType: string;
  } | null;
  planSummary?: Record<string, unknown> | null;
};

export type Entitlements = {
  hasPro: boolean;
  planCode: string | null;
  status: string;
  currentPeriodEnd: string | null;
};

type AuthCtx = {
  bootstrapped: boolean;
  accessToken: string | null;
  user: AuthUser | null;
  entitlements: Entitlements | null;
  hasPro: boolean;
  signIn: (email: string, password: string) => Promise<"Welcome" | "GoalSetup" | "PremiumAccess" | "Main">;
  signUp: (email: string, password: string) => Promise<"Welcome" | "GoalSetup" | "PremiumAccess" | "Main">;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshEntitlements: () => Promise<void>;
  resolveInitialRoute: () => "Welcome" | "GoalSetup" | "PremiumAccess" | "Main";
};

const AuthContext = createContext<AuthCtx | null>(null);

async function fetchMe(token: string): Promise<AuthUser | null> {
  const res = await fetch(`${apiBaseUrl}/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    return null;
  }
  return (await res.json()) as AuthUser;
}

async function fetchEntitlements(token: string): Promise<Entitlements | null> {
  const res = await fetch(`${apiBaseUrl}/entitlements`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    return null;
  }
  return (await res.json()) as Entitlements;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [bootstrapped, setBootstrapped] = useState(false);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);

  const refreshEntitlements = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
      setEntitlements(null);
      return;
    }
    const e = await fetchEntitlements(token);
    setEntitlements(e ?? { hasPro: false, planCode: null, status: "error", currentPeriodEnd: null });
  }, []);

  const refreshUser = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
      setUser(null);
      return;
    }
    const u = await fetchMe(token);
    setUser(u);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await getAccessToken();
      if (cancelled) {
        return;
      }
      setAccessTokenState(token);
      if (token) {
        const [u, e] = await Promise.all([fetchMe(token), fetchEntitlements(token)]);
        if (!cancelled) {
          if (!u) {
            await clearTokens();
            setAccessTokenState(null);
            setUser(null);
            setEntitlements(null);
          } else {
            setUser(u);
            setEntitlements(e ?? { hasPro: false, planCode: null, status: "none", currentPeriodEnd: null });
          }
        }
      } else if (!cancelled) {
        setUser(null);
        setEntitlements(null);
      }
      if (!cancelled) {
        setBootstrapped(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const sub = Linking.addEventListener("url", () => {
      void refreshEntitlements();
      void refreshUser();
    });
    return () => sub.remove();
  }, [refreshEntitlements, refreshUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(typeof j.message === "string" ? j.message : "Sign in failed");
    }
    const data = (await res.json()) as { accessToken: string; refreshToken: string };
    await setTokens(data.accessToken, data.refreshToken);
    setAccessTokenState(data.accessToken);
    const [u, e] = await Promise.all([fetchMe(data.accessToken), fetchEntitlements(data.accessToken)]);
    setUser(u);
    const ent = e ?? { hasPro: false, planCode: null, status: "none", currentPeriodEnd: null };
    setEntitlements(ent);
    if (!u?.dietProfile) {
      return "GoalSetup";
    }
    if (!ent.hasPro) {
      return "PremiumAccess";
    }
    return "Main";
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const res = await apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(typeof j.message === "string" ? j.message : "Sign up failed");
    }
    const data = (await res.json()) as { accessToken: string; refreshToken: string };
    await setTokens(data.accessToken, data.refreshToken);
    setAccessTokenState(data.accessToken);
    const [u, e] = await Promise.all([fetchMe(data.accessToken), fetchEntitlements(data.accessToken)]);
    setUser(u);
    const ent = e ?? { hasPro: false, planCode: null, status: "none", currentPeriodEnd: null };
    setEntitlements(ent);
    if (!u?.dietProfile) {
      return "GoalSetup";
    }
    if (!ent.hasPro) {
      return "PremiumAccess";
    }
    return "Main";
  }, []);

  const signOut = useCallback(async () => {
    await clearTokens();
    setAccessTokenState(null);
    setUser(null);
    setEntitlements(null);
  }, []);

  const hasPro = Boolean(entitlements?.hasPro);

  const resolveInitialRoute = useCallback((): "Welcome" | "GoalSetup" | "PremiumAccess" | "Main" => {
    if (!accessToken) {
      return "Welcome";
    }
    if (!user?.dietProfile) {
      return "GoalSetup";
    }
    if (!hasPro) {
      return "PremiumAccess";
    }
    return "Main";
  }, [accessToken, user?.dietProfile, hasPro]);

  const value = useMemo(
    () => ({
      bootstrapped,
      accessToken,
      user,
      entitlements,
      hasPro,
      signIn,
      signUp,
      signOut,
      refreshUser,
      refreshEntitlements,
      resolveInitialRoute
    }),
    [
      bootstrapped,
      accessToken,
      user,
      entitlements,
      hasPro,
      signIn,
      signUp,
      signOut,
      refreshUser,
      refreshEntitlements,
      resolveInitialRoute
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const v = useContext(AuthContext);
  if (!v) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return v;
}
