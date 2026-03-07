"use client";

import { createContext, useContext, useMemo, useCallback } from "react";
import type { ReactNode } from "react";
import { useStdb } from "./spacetimedb-provider";
import { useRevision } from "@/hooks/use-db";
import type { UserRole, DbUser } from "@/types";
import { STDB_TOKEN_KEY } from "@/lib/constants";

interface AuthContextValue {
  user: DbUser | null;
  role: UserRole | null;
  employeeId: bigint | undefined;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (username: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  employeeId: undefined,
  isLoading: true,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isConnected, identity, isSubscriptionReady } = useStdb();
  const { conn, revision } = useRevision("user");

  const user = useMemo<DbUser | null>(() => {
    if (!conn || !identity || !isSubscriptionReady) return null;
    try {
      const identityHex = identity.toHexString();
      for (const u of conn.db.user.iter()) {
        if (u.identity && u.identity.toHexString() === identityHex) {
          return u as DbUser;
        }
      }
    } catch (err) {
      console.error("AuthProvider user lookup:", err);
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conn, identity, isSubscriptionReady, revision]);

  const role = user?.role as UserRole | null;
  const employeeId = user?.employeeId;
  const isLoading = !isConnected || !isSubscriptionReady;
  const isLoggedIn = !!user;

  const login = useCallback(
    (username: string, password: string) => {
      if (!conn) throw new Error("Not connected to database");
      conn.reducers.login({ username, password });
    },
    [conn],
  );

  const logout = useCallback(() => {
    if (!conn) return;
    try {
      conn.reducers.logout({});
    } catch (err) {
      console.warn("Logout reducer failed:", err);
    }
    localStorage.removeItem(STDB_TOKEN_KEY);
  }, [conn]);

  const value = useMemo(
    () => ({ user, role, employeeId, isLoading, isLoggedIn, login, logout }),
    [user, role, employeeId, isLoading, isLoggedIn, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
