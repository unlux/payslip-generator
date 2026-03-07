"use client";

import type { ReactNode } from "react";
import { StdbProvider } from "./spacetimedb-provider";
import { AuthProvider } from "./auth-provider";
import { AppHeader } from "@/components/layout/app-header";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <StdbProvider>
      <AuthProvider>
        <AppHeader />
        <main className="container mx-auto px-4 py-6">{children}</main>
      </AuthProvider>
    </StdbProvider>
  );
}
