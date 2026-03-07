"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/providers/auth-provider";
import { loginSchema, type LoginFormValues } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export function LoginForm() {
  const { login } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Timeout: if login doesn't resolve within 3s, assume failure
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => {
      setPending(false);
      setError("Invalid username or password");
    }, 3000);
    return () => clearTimeout(timer);
  }, [pending]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const onSubmit = useCallback(
    async (data: LoginFormValues) => {
      setPending(true);
      setError(null);
      try {
        await login(data.username, data.password);
      } catch {
        setPending(false);
        setError("Failed to connect to server");
      }
    },
    [login],
  );

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access the payslip system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="username"
              {...register("username")}
            />
            {errors.username && (
              <p className="text-sm text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={pending}
              onClick={() => onSubmit({ username: "admin", password: "admin" })}
            >
              Admin
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={pending}
              onClick={() =>
                onSubmit({ username: "lakshay", password: "87651234" })
              }
            >
              Lakshay
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
