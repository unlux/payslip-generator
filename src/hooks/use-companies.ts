"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./use-local-storage";
import { STORAGE_KEYS, DEFAULT_FIELD_VISIBILITY } from "@/lib/constants";
import type { Company } from "@/types";

export function useCompanies() {
  const [companies, setCompanies] = useLocalStorage<Company[]>(
    STORAGE_KEYS.COMPANIES,
    [],
  );

  const addCompany = useCallback(
    (
      data: Omit<
        Company,
        | "id"
        | "fieldVisibility"
        | "earningsTemplate"
        | "deductionsTemplate"
        | "createdAt"
        | "updatedAt"
      >,
    ) => {
      const now = new Date().toISOString();
      const company: Company = {
        ...data,
        id: crypto.randomUUID(),
        fieldVisibility: { ...DEFAULT_FIELD_VISIBILITY },
        earningsTemplate: [],
        deductionsTemplate: [],
        createdAt: now,
        updatedAt: now,
      };
      setCompanies((prev) => [...prev, company]);
      return company;
    },
    [setCompanies],
  );

  const updateCompany = useCallback(
    (id: string, data: Partial<Company>) => {
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, ...data, updatedAt: new Date().toISOString() }
            : c,
        ),
      );
    },
    [setCompanies],
  );

  const deleteCompany = useCallback(
    (id: string) => {
      setCompanies((prev) => prev.filter((c) => c.id !== id));
    },
    [setCompanies],
  );

  const getCompanyById = useCallback(
    (id: string) => companies.find((c) => c.id === id),
    [companies],
  );

  return {
    companies,
    addCompany,
    updateCompany,
    deleteCompany,
    getCompanyById,
  };
}
