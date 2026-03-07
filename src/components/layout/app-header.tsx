"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogOut, Upload } from "lucide-react";
import { useRef, useCallback } from "react";
import { SIGNATURE_KEY } from "@/lib/constants";
import { toast } from "sonner";

const BOSS_NAV = [
  { href: "/boss", label: "Dashboard" },
  { href: "/boss/employees", label: "Employees" },
  { href: "/boss/settings", label: "Settings" },
];

const EMPLOYEE_NAV = [
  { href: "/employee", label: "Dashboard" },
  { href: "/employee/profile", label: "Profile" },
  { href: "/employee/submit", label: "Submit Payslip" },
];

export function AppHeader() {
  const pathname = usePathname();
  const { isLoggedIn, role, user, logout } = useAuth();
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const navItems =
    role === "boss" ? BOSS_NAV : role === "employee" ? EMPLOYEE_NAV : [];

  const handleSignatureUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        localStorage.setItem(SIGNATURE_KEY, reader.result as string);
        toast.success("Signature saved to this browser");
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [],
  );

  const handleLogout = useCallback(() => {
    logout();
    window.location.href = "/";
  }, [logout]);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link
          href={
            role === "boss" ? "/boss" : role === "employee" ? "/employee" : "/"
          }
          className="mr-8 text-lg font-semibold"
        >
          Payslip Generator
        </Link>

        {isLoggedIn && (
          <>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(
                    pathname === item.href &&
                      "bg-accent text-accent-foreground",
                  )}
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
            </nav>

            <div className="flex-1" />

            {role === "boss" && (
              <>
                <input
                  ref={signatureInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSignatureUpload}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="mr-2"
                  onClick={() => signatureInputRef.current?.click()}
                >
                  <Upload className="mr-1 size-4" />
                  Signature
                </Button>
              </>
            )}

            <span className="mr-3 text-sm text-muted-foreground">
              {user?.name}
            </span>

            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-1 size-4" />
              Logout
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
