"use client";

import { RoleGuard } from "@/components/auth/role-guard";

export default function BossLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard role="boss">{children}</RoleGuard>;
}
