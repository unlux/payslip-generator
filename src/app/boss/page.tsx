"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, ChevronRight } from "lucide-react";
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
import {
 Collapsible,
 CollapsibleContent,
 CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { PayslipStatus, DbPayslipSubmission } from "@/types";

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
 const [collapsedYears, setCollapsedYears] = useState<Set<number>>(
 new Set(),
 );
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

  const groupedByYear = useMemo(() => {
  const groups = new Map<number, DbPayslipSubmission[]>();
 for (const sub of sorted) {
 const year = sub.payYear;
 if (!groups.has(year)) groups.set(year, []);
 groups.get(year)!.push(sub);
 }
  return groups;
  }, [sorted]);

 const employeeMap = useMemo(() => {
  const map = new Map<bigint, string>();
 for (const e of employees) {
 map.set(e.id, e.name);
 }
 return map;
 }, [employees]);

  function toggleYear(year: number) {
 setCollapsedYears((prev) => {
 const next = new Set(prev);
 if (next.has(year)) {
  next.delete(year);
 } else {
 next.add(year);
 }
 return next;
 });
 }

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
  {sorted.length === 0 ? (
 <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
  <p className="text-lg font-medium text-muted-foreground">
  No submissions yet
 </p>
 </div>
  ) : (
  <div className="space-y-4">
 {[...groupedByYear.entries()].map(([year, subs]) => {
 const isCollapsed = collapsedYears.has(year);
 return (
 <Collapsible
 key={year}
 open={!isCollapsed}
 onOpenChange={() => toggleYear(year)}
  >
 <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md border bg-muted/50 px-4 py-2 text-left hover:bg-muted">
 <ChevronRight
 className={`size-4 transition-transform ${!isCollapsed ? "rotate-90" : ""}`}
 />
 <span className="font-medium">{year}</span>
 <span className="text-sm text-muted-foreground">
 ({subs.length} payslip{subs.length !== 1 ? "s" : ""})
 </span>
 </CollapsibleTrigger>
 <CollapsibleContent>
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
 {subs.map((s) => (
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
  <Link href={`/boss/payslip/${Number(s.id)}`}>
 View
 </Link>
 </Button>
 </TableCell>
  </TableRow>
 ))}
 </TableBody>
  </Table>
  </CollapsibleContent>
 </Collapsible>
  );
  })}
 </div>
  )}
  </div>
  );
}
