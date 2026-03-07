"use client";

import { useMemo, useState, createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { STDB_URI, STDB_DATABASE, STDB_TOKEN_KEY } from "@/lib/constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StdbConn = any;

interface StdbContextValue {
  conn: StdbConn;
  isConnected: boolean;
  identity: StdbConn;
  connectionError: Error | null;
  isSubscriptionReady: boolean;
}

const StdbContext = createContext<StdbContextValue>({
  conn: null,
  isConnected: false,
  identity: null,
  connectionError: null,
  isSubscriptionReady: false,
});

export function useStdb() {
  return useContext(StdbContext);
}

export function StdbProvider({ children }: { children: ReactNode }) {
  const [conn, setConn] = useState<StdbConn>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [identity, setIdentity] = useState<StdbConn>(null);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const [isSubscriptionReady, setIsSubscriptionReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function connect() {
      try {
        const { DbConnection } = await import("@/module_bindings");
        const token = localStorage.getItem(STDB_TOKEN_KEY) || undefined;

        const connection = DbConnection.builder()
          .withUri(STDB_URI)
          .withDatabaseName(STDB_DATABASE)
          .withToken(token)
          .onConnect((c: StdbConn, ident: StdbConn, tok: string) => {
            if (cancelled) return;
            localStorage.setItem(STDB_TOKEN_KEY, tok);
            setConn(c);
            setIdentity(ident);
            setIsConnected(true);
            setConnectionError(null);

            c.subscriptionBuilder()
              .onApplied(() => {
                if (!cancelled) setIsSubscriptionReady(true);
              })
              .subscribe([
                "SELECT * FROM user",
                "SELECT * FROM company",
                "SELECT * FROM employee",
                "SELECT * FROM payslip_submission",
                "SELECT * FROM field_visibility",
                "SELECT * FROM earnings_template",
                "SELECT * FROM deductions_template",
              ]);
          })
          .onDisconnect(() => {
            if (cancelled) return;
            setIsConnected(false);
            setIsSubscriptionReady(false);
          })
          .onConnectError((_ctx: StdbConn, err: Error) => {
            if (cancelled) return;
            setConnectionError(err);
          })
          .build();

        if (!cancelled) {
          setConn(connection);
        }
      } catch (err) {
        if (!cancelled) {
          setConnectionError(
            err instanceof Error ? err : new Error(String(err)),
          );
        }
      }
    }

    connect();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      conn,
      isConnected,
      identity,
      connectionError,
      isSubscriptionReady,
    }),
    [conn, isConnected, identity, connectionError, isSubscriptionReady],
  );

  return <StdbContext.Provider value={value}>{children}</StdbContext.Provider>;
}
