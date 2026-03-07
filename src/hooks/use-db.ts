"use client";

import { useMemo } from "react";
import { useStdb } from "@/providers/spacetimedb-provider";
import type {
  DbCompany,
  DbEmployee,
  DbPayslipSubmission,
  DbFieldVisibility,
  DbEarningsTemplate,
  DbDeductionsTemplate,
  DbSignedPayslip,
  DbUser,
  FieldVisibilitySettings,
  PayComponent,
  CustomField,
} from "@/types";
import { DEFAULT_FIELD_VISIBILITY } from "@/lib/constants";

function useTableRows<T>(tableName: string): T[] {
  const { conn, isSubscriptionReady } = useStdb();
  return useMemo(() => {
    if (!conn || !isSubscriptionReady) return [];
    try {
      return [...conn.db[tableName].iter()] as T[];
    } catch {
      return [];
    }
  }, [conn, isSubscriptionReady, tableName]);
}

export function useUsers(): DbUser[] {
  return useTableRows<DbUser>("user");
}

export function useCompany(): DbCompany | null {
  const rows = useTableRows<DbCompany>("company");
  return rows.find((r) => r.id === 1n) ?? null;
}

export function useEmployees(): DbEmployee[] {
  return useTableRows<DbEmployee>("employee");
}

export function useEmployee(id: bigint | undefined): DbEmployee | null {
  const employees = useEmployees();
  if (id === undefined) return null;
  return employees.find((e) => e.id === id) ?? null;
}

export function usePayslipSubmissions(): DbPayslipSubmission[] {
  return useTableRows<DbPayslipSubmission>("payslip_submission");
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

export function usePayslipSubmission(id: bigint): DbPayslipSubmission | null {
  const all = usePayslipSubmissions();
  return all.find((s) => s.id === id) ?? null;
}

export function useFieldVisibility(): FieldVisibilitySettings {
  const rows = useTableRows<DbFieldVisibility>("field_visibility");
  const row = rows.find((r) => r.id === 1n);
  if (!row) return DEFAULT_FIELD_VISIBILITY;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, ...settings } = row;
  return settings;
}

export function useEarningsTemplates(): DbEarningsTemplate[] {
  const rows = useTableRows<DbEarningsTemplate>("earnings_template");
  return useMemo(
    () => [...rows].sort((a, b) => a.sortOrder - b.sortOrder),
    [rows],
  );
}

export function useDeductionsTemplates(): DbDeductionsTemplate[] {
  const rows = useTableRows<DbDeductionsTemplate>("deductions_template");
  return useMemo(
    () => [...rows].sort((a, b) => a.sortOrder - b.sortOrder),
    [rows],
  );
}

export function useSignedPayslip(submissionId: bigint): DbSignedPayslip | null {
  const { conn, isSubscriptionReady } = useStdb();
  return useMemo(() => {
    if (!conn || !isSubscriptionReady) return null;
    try {
      return conn.db.signed_payslip.submissionId.find(submissionId) ?? null;
    } catch {
      return null;
    }
  }, [conn, isSubscriptionReady, submissionId]);
}

// Helpers to convert between DB BigInt cents and display numbers
export function centsToAmount(cents: bigint): number {
  return Number(cents) / 100;
}

export function amountToCents(amount: number): bigint {
  return BigInt(Math.round(amount * 100));
}

export function parseJsonPayComponents(json: string): PayComponent[] {
  try {
    return JSON.parse(json) as PayComponent[];
  } catch {
    return [];
  }
}

export function parseJsonCustomFields(json: string): CustomField[] {
  try {
    return JSON.parse(json) as CustomField[];
  } catch {
    return [];
  }
}

export function stdbTimestampToDate(ts: {
  microsSinceUnixEpoch: bigint;
}): Date {
  return new Date(Number(ts.microsSinceUnixEpoch / 1000n));
}
