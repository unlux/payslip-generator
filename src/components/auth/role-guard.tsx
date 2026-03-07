"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import type { UserRole } from "@/types";

interface RoleGuardProps {
  role: UserRole;
  children: React.ReactNode;
}

export function RoleGuard({ role, children }: RoleGuardProps) {
  const { isLoggedIn, isLoading, role: userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) {
      router.replace("/");
      return;
    }
    if (userRole !== role) {
      router.replace(userRole === "boss" ? "/boss" : "/employee");
    }
  }, [isLoading, isLoggedIn, userRole, role, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn || userRole !== role) return null;

  return <>{children}</>;
}
