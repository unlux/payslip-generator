"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { LoginForm } from "@/components/auth/login-form";
import { useStdb } from "@/providers/spacetimedb-provider";

export default function LoginPage() {
  const { isLoggedIn, isLoading, role } = useAuth();
  const { connectionError } = useStdb();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (isLoggedIn) {
      router.replace(role === "boss" ? "/boss" : "/employee");
    }
  }, [isLoggedIn, isLoading, role, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Connecting to server...</p>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2">
        <p className="text-destructive">Failed to connect to server</p>
        <p className="text-sm text-muted-foreground">
          {connectionError.message}
        </p>
      </div>
    );
  }

  if (isLoggedIn) return null;

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoginForm />
    </div>
  );
}
