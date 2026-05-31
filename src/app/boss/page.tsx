"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
 usePayslipSubmissions,
  useEmployees,
  useCompany,
  stdbTimestampToDate,
  centsToAmount,
} from "@/hooks/use-db";
import { getCurrencySymbol } from "@/lib/currencies";
import { MONTHS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from "@/components/ui/table";
import type { PayslipStatus } from "@/types";

const statusVariant: Record<
 PayslipStatus,
  "secondary" | "default" | "outline"
> = {
  draft: "secondary",
 submitted: "default",
 signed: "outline",
};

type SortOption = "date" | "submitted";

export default function BossDashboard() {
  const submissions = usePayslipSubmissions();
 const employees = useEmployees();
  const company = useCompany();
  const [sortBy, setSortBy] = useState<SortOption>("date");
 const currencySymbol = getCurrencySymbol(company?.currency ?? "USD");

 const sorted = useMemo(() => {
 return [...submissions].sort((a, b) => {
 if (sortBy === "date") {
  if (a.payYear !== b.payYear) return b.payYear - a.payYear;
  return b.payMonth - a.payMonth;
 } else {
 return (
 Number(b.createdAt.microsSinceUnixEpoch) -
 Number(a.createdAt.microsSinceUnixEpoch)
 );
 }
 });
 }, [submissions, sortBy]);

 const employeeMap = useMemo(() => {
 const map = new Map<bigint, string>();
 for (const e of employees) {
 map.set(e.id, e.name);
 }
  return map;
  }, [employees]);

 return (
  <div className="container mx-auto px-4 py-6">
  <PageHeader
 title="Dashboard"
 description="All payslip submissions"
  action={
 <Button
 variant="outline"
 size="sm"
 onClick={() =>
 setSortBy((s) => (s === "date" ? "submitted" : "date"))
 }
 >
  <ArrowUpDown className="mr-2 size-4" />
  {sortBy === "date" ? "By Payslip Date" : "By Submitted Date"}
 </Button>
 }
 />
 <Table>
  <TableHeader>
 <TableRow>
 <TableHead>Employee</TableHead>
  <TableHead>Month/Year</TableHead>
  <TableHead>Net Payable</TableHead>
  <TableHead>Status</TableHead>
 <TableHead>Submitted</TableHead>
 <TableHead>Actions</TableHead>
 </TableRow>
  </TableHeader>
 <TableBody>
 {sorted.length === 0 && (
 <TableRow>
 <TableCell
 colSpan={6}
 className="text-center text-muted-foreground"
 >
 No submissions yet
 </TableCell>
 </TableRow>
 )}
 {sorted.map((s) => (
 <TableRow key={Number(s.id)}>
 <TableCell>
 {employeeMap.get(s.employeeId) ?? "Unknown"}
 </TableCell>
 <TableCell>
 {MONTHS[s.payMonth - 1]} {s.payYear}
 </TableCell>
 <TableCell>
 {currencySymbol}
 {centsToAmount(s.netPayable).toLocaleString()}
 </TableCell>
 <TableCell>
 <Badge
 variant={statusVariant[s.status]}
 className={
 s.status === "signed"
 ? "border-green-500 text-green-700 dark:text-green-400"
 : undefined
 }
 >
 {s.status}
 </Badge>
 </TableCell>
 <TableCell>
 {stdbTimestampToDate(s.createdAt).toLocaleDateString()}
 </TableCell>
 <TableCell>
 <Button variant="ghost" size="sm" asChild>
 <Link href={`/boss/payslip/${Number(s.id)}`}>View</Link>
 </Button>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 );
}
