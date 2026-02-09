"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./use-local-storage";
import { STORAGE_KEYS } from "@/lib/constants";
import type { PayslipRecord } from "@/types";

export function usePayslips() {
  const [payslips, setPayslips] = useLocalStorage<PayslipRecord[]>(
    STORAGE_KEYS.PAYSLIPS,
    [],
  );

  const addPayslip = useCallback(
    (data: Omit<PayslipRecord, "id" | "createdAt">) => {
      const record: PayslipRecord = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setPayslips((prev) => [record, ...prev]);
      return record;
    },
    [setPayslips],
  );

  const deletePayslip = useCallback(
    (id: string) => {
      setPayslips((prev) => prev.filter((p) => p.id !== id));
    },
    [setPayslips],
  );

  const getByCompany = useCallback(
    (companyId: string) => payslips.filter((p) => p.companyId === companyId),
    [payslips],
  );

  const getByEmployee = useCallback(
    (employeeId: string) => payslips.filter((p) => p.employeeId === employeeId),
    [payslips],
  );

  const getPayslipById = useCallback(
    (id: string) => payslips.find((p) => p.id === id),
    [payslips],
  );

  return {
    payslips,
    addPayslip,
    deletePayslip,
    getByCompany,
    getByEmployee,
    getPayslipById,
  };
}
