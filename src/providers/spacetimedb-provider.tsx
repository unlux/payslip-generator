"use client";

import {
  useMemo,
  useState,
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { STDB_URI, STDB_DATABASE, STDB_TOKEN_KEY } from "@/lib/constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StdbConn = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StdbIdentity = any;

interface StdbContextValue {
  conn: StdbConn;
  isConnected: boolean;
  identity: StdbIdentity;
  connectionError: Error | null;
  isSubscriptionReady: boolean;
  subscribeAll: () => void;
}

const StdbContext = createContext<StdbContextValue>({
  conn: null,
  isConnected: false,
  identity: null,
  connectionError: null,
  isSubscriptionReady: false,
  subscribeAll: () => {},
});

export function useStdb() {
  return useContext(StdbContext);
}

export function StdbProvider({ children }: { children: ReactNode }) {
  const [conn, setConn] = useState<StdbConn>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [identity, setIdentity] = useState<StdbIdentity>(null);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const [isSubscriptionReady, setIsSubscriptionReady] = useState(false);
  const connRef = useRef<StdbConn>(null);
  const dataSubscribedRef = useRef(false);

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
          .onConnect((c: StdbConn, ident: StdbIdentity, tok: string) => {
            if (cancelled) return;
            localStorage.setItem(STDB_TOKEN_KEY, tok);
            setConn(c);
            setIdentity(ident);
            setIsConnected(true);
            setConnectionError(null);

            // Only subscribe to user table on connect (for auth).
            // All other tables are subscribed after login via subscribeAll().
            c.subscriptionBuilder()
              .onApplied(() => {
                if (!cancelled) setIsSubscriptionReady(true);
              })
              .subscribe(["SELECT * FROM users_view"]);
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

        connRef.current = connection;
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
      if (connRef.current) {
        try {
          connRef.current.disconnect();
        } catch {
          // best effort
        }
        connRef.current = null;
      }
    };
  }, []);

  const subscribeAll = useCallback(() => {
    if (!conn || dataSubscribedRef.current) return;
    dataSubscribedRef.current = true;
    conn
      .subscriptionBuilder()
      .subscribe([
        "SELECT * FROM company_view",
        "SELECT * FROM employees_view",
        "SELECT * FROM submissions_view",
        "SELECT * FROM hidden_payslips_view",
        "SELECT * FROM signed_payslips_view",
        "SELECT * FROM field_visibility_view",
        "SELECT * FROM earnings_templates_view",
        "SELECT * FROM deductions_templates_view",
      ]);
  }, [conn]);

  const value = useMemo(
    () => ({
      conn,
      isConnected,
      identity,
      connectionError,
      isSubscriptionReady,
      subscribeAll,
    }),
    [
      conn,
      isConnected,
      identity,
      connectionError,
      isSubscriptionReady,
      subscribeAll,
    ],
  );

  return <StdbContext.Provider value={value}>{children}</StdbContext.Provider>;
}
