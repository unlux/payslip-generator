"use client";

import { RoleGuard } from "@/components/auth/role-guard";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard role="employee">{children}</RoleGuard>;
}
