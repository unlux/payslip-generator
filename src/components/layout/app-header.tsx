"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/generate", label: "Generate" },
  { href: "/history", label: "History" },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link href="/generate" className="mr-8 text-lg font-semibold">
          Payslip Generator
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                pathname === item.href && "bg-accent text-accent-foreground",
              )}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
