"use client";

import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useStdb } from "./spacetimedb-provider";
import type { UserRole, DbUser } from "@/types";
import { STDB_TOKEN_KEY } from "@/lib/constants";

interface AuthContextValue {
  user: DbUser | null;
  role: UserRole | null;
  employeeId: bigint | undefined;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  employeeId: undefined,
  isLoading: true,
  isLoggedIn: false,
  login: async () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { conn, isConnected, identity, isSubscriptionReady } = useStdb();
  const [, setLoginError] = useState<string | null>(null);
  const user = useMemo<DbUser | null>(() => {
    if (!conn || !identity || !isSubscriptionReady) return null;
    try {
      const identityHex = identity.toHexString();
      for (const u of conn.db.user.iter()) {
        if (u.identity && u.identity.toHexString() === identityHex) {
          return u as DbUser;
        }
      }
    } catch {
      // Table not ready yet
    }
    return null;
  }, [conn, identity, isSubscriptionReady]);

  const role = user?.role as UserRole | null;
  const employeeId = user?.employeeId;
  const isLoading = !isConnected || !isSubscriptionReady;
  const isLoggedIn = !!user;

  const login = useCallback(
    async (username: string, password: string) => {
      if (!conn) throw new Error("Not connected to database");
      setLoginError(null);
      try {
        conn.reducers.login({ username, password });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Login failed";
        setLoginError(msg);
        throw err;
      }
    },
    [conn],
  );

  const logout = useCallback(() => {
    if (!conn) return;
    try {
      conn.reducers.logout({});
    } catch {
      // ignore
    }
    localStorage.removeItem(STDB_TOKEN_KEY);
  }, [conn]);

  const value = useMemo(
    () => ({ user, role, employeeId, isLoading, isLoggedIn, login, logout }),
    [user, role, employeeId, isLoading, isLoggedIn, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
