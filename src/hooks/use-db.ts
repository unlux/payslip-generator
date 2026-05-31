"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useStdb } from "@/providers/spacetimedb-provider";
import type {
  DbCompany,
  DbEmployee,
  DbPayslipSubmission,
  DbFieldVisibility,
  DbEarningsTemplate,
  DbDeductionsTemplate,
  DbSignedPayslip,
  DbHiddenPayslip,
  DbUser,
  FieldVisibilitySettings,
  PayComponent,
  CustomField,
} from "@/types";
import { DEFAULT_FIELD_VISIBILITY } from "@/lib/constants";

export function useRevision(tableName: string) {
  const { conn, isSubscriptionReady } = useStdb();
  const [revision, setRevision] = useState(0);
  const bump = useCallback(() => setRevision((r) => r + 1), []);

  useEffect(() => {
    if (!conn || !isSubscriptionReady) return;
    const table = conn.db[tableName];
    if (!table) return;
    table.onInsert(bump);
    table.onUpdate(bump);
    table.onDelete(bump);
    return () => {
      table.removeOnInsert(bump);
      table.removeOnUpdate(bump);
      table.removeOnDelete(bump);
    };
  }, [conn, isSubscriptionReady, tableName, bump]);

  return { conn, isSubscriptionReady, revision };
}

function useTableRows<T>(tableName: string): T[] {
  const { conn, isSubscriptionReady, revision } = useRevision(tableName);

  return useMemo(() => {
    if (!conn || !isSubscriptionReady) return [];
    try {
      return [...conn.db[tableName].iter()] as T[];
    } catch (err) {
      console.error(`useTableRows(${tableName}):`, err);
      return [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conn, isSubscriptionReady, tableName, revision]);
}

export function useUsers(): DbUser[] {
  return useTableRows<DbUser>("usersView");
}

export function useCompany(): DbCompany | null {
  const { conn, isSubscriptionReady, revision } = useRevision("companyView");

  return useMemo(() => {
    if (!conn || !isSubscriptionReady) return null;
    try {
      const rows = [...conn.db.companyView.iter()];
      return rows.length > 0 ? (rows[0] as DbCompany) : null;
    } catch (err) {
      console.error("useCompany:", err);
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conn, isSubscriptionReady, revision]);
}

export function useEmployees(): DbEmployee[] {
  return useTableRows<DbEmployee>("employeesView");
}

export function useEmployee(id: bigint | undefined): DbEmployee | null {
  const { conn, isSubscriptionReady, revision } = useRevision("employeesView");

  return useMemo(() => {
    if (id === undefined || !conn || !isSubscriptionReady) return null;
    try {
      for (const emp of conn.db.employeesView.iter()) {
        if (emp.id === id) return emp as DbEmployee;
      }
      return null;
    } catch (err) {
      console.error("useEmployee:", err);
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conn, isSubscriptionReady, id, revision]);
}

export function usePayslipSubmissions(): DbPayslipSubmission[] {
  return useTableRows<DbPayslipSubmission>("submissionsView");
}

export function useHiddenPayslips(): DbHiddenPayslip[] {
  return useTableRows<DbHiddenPayslip>("hiddenPayslipsView");
}

export function useHiddenPayslip(
  submissionId: bigint | undefined,
): DbHiddenPayslip | null {
  const { conn, isSubscriptionReady, revision } =
    useRevision("hiddenPayslipsView");

  return useMemo(() => {
    if (submissionId === undefined || !conn || !isSubscriptionReady)
      return null;
    try {
      for (const hidden of conn.db.hiddenPayslipsView.iter()) {
        if (hidden.submissionId === submissionId)
          return hidden as DbHiddenPayslip;
      }
      return null;
    } catch (err) {
      console.error("useHiddenPayslip:", err);
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conn, isSubscriptionReady, submissionId, revision]);
}

export function useMyPayslipSubmissions(
  employeeId: bigint | undefined,
): DbPayslipSubmission[] {
  const all = usePayslipSubmissions();
  return useMemo(() => {
    if (employeeId === undefined) return [];
    return all.filter((s) => s.employeeId === employeeId);
  }, [all, employeeId]);
}

export function usePayslipSubmission(
  id: bigint | undefined,
): DbPayslipSubmission | null {
  const { conn, isSubscriptionReady, revision } =
    useRevision("submissionsView");

  return useMemo(() => {
    if (id === undefined || !conn || !isSubscriptionReady) return null;
    try {
      for (const sub of conn.db.submissionsView.iter()) {
        if (sub.id === id) return sub as DbPayslipSubmission;
      }
      return null;
    } catch (err) {
      console.error("usePayslipSubmission:", err);
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conn, isSubscriptionReady, id, revision]);
}

export function useFieldVisibility(): FieldVisibilitySettings {
  const { conn, isSubscriptionReady, revision } = useRevision(
    "fieldVisibilityView",
  );

  return useMemo(() => {
    if (!conn || !isSubscriptionReady) return DEFAULT_FIELD_VISIBILITY;
    try {
      const rows = [...conn.db.fieldVisibilityView.iter()];
      if (rows.length === 0) return DEFAULT_FIELD_VISIBILITY;
      const row = rows[0] as DbFieldVisibility;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...settings } = row;
      return settings;
    } catch (err) {
      console.error("useFieldVisibility:", err);
      return DEFAULT_FIELD_VISIBILITY;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conn, isSubscriptionReady, revision]);
}

export function useEarningsTemplates(): DbEarningsTemplate[] {
  const rows = useTableRows<DbEarningsTemplate>("earningsTemplatesView");
  return useMemo(
    () => [...rows].sort((a, b) => a.sortOrder - b.sortOrder),
    [rows],
  );
}

export function useDeductionsTemplates(): DbDeductionsTemplate[] {
  const rows = useTableRows<DbDeductionsTemplate>("deductionsTemplatesView");
  return useMemo(
    () => [...rows].sort((a, b) => a.sortOrder - b.sortOrder),
    [rows],
  );
}

export function useSignedPayslip(
  submissionId: bigint | undefined,
): DbSignedPayslip | null {
  const { conn, isSubscriptionReady, revision } =
    useRevision("signedPayslipsView");

  return useMemo(() => {
    if (submissionId === undefined || !conn || !isSubscriptionReady)
      return null;
    try {
      for (const sp of conn.db.signedPayslipsView.iter()) {
        if (sp.submissionId === submissionId) return sp as DbSignedPayslip;
      }
      return null;
    } catch (err) {
      console.error("useSignedPayslip:", err);
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conn, isSubscriptionReady, submissionId, revision]);
}

// Helpers to convert between DB BigInt cents and display numbers
export function centsToAmount(cents: bigint): number {
  return Number(cents) / 100;
}

export function amountToCents(amount: number): bigint {
  return BigInt(Math.round(amount * 100));
}

function safeParseJsonArray<T>(json: string): T[] {
  try {
    return JSON.parse(json) as T[];
  } catch {
    return [];
  }
}

export function parseJsonPayComponents(json: string): PayComponent[] {
  return safeParseJsonArray<PayComponent>(json);
}

export function parseJsonCustomFields(json: string): CustomField[] {
  return safeParseJsonArray<CustomField>(json);
}

export function stdbTimestampToDate(ts: {
  microsSinceUnixEpoch: bigint;
}): Date {
  return new Date(Number(ts.microsSinceUnixEpoch / 1000n));
}
