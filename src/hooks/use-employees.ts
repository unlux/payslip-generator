"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./use-local-storage";
import { STORAGE_KEYS } from "@/lib/constants";
import type { Employee } from "@/types";

export function useEmployees() {
  const [employees, setEmployees] = useLocalStorage<Employee[]>(
    STORAGE_KEYS.EMPLOYEES,
    [],
  );

  const getByCompany = useCallback(
    (companyId: string) => employees.filter((e) => e.companyId === companyId),
    [employees],
  );

  const addEmployee = useCallback(
    (
      companyId: string,
      data: Omit<Employee, "id" | "companyId" | "createdAt" | "updatedAt">,
    ) => {
      const now = new Date().toISOString();
      const employee: Employee = {
        ...data,
        id: crypto.randomUUID(),
        companyId,
        createdAt: now,
        updatedAt: now,
      };
      setEmployees((prev) => [...prev, employee]);
      return employee;
    },
    [setEmployees],
  );

  const updateEmployee = useCallback(
    (id: string, data: Partial<Employee>) => {
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, ...data, updatedAt: new Date().toISOString() }
            : e,
        ),
      );
    },
    [setEmployees],
  );

  const deleteEmployee = useCallback(
    (id: string) => {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    },
    [setEmployees],
  );

  const getEmployeeById = useCallback(
    (id: string) => employees.find((e) => e.id === id),
    [employees],
  );

  return {
    employees,
    getByCompany,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
  };
}
