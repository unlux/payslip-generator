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
import { Card } from "@/components/ui/card";
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

function PayslipRow({
 submission,
 employeeName,
 currencySymbol,
}: {
 submission: DbPayslipSubmission;
 employeeName: string;
 currencySymbol: string;
}) {
 return (
 <>
 <TableCell className="hidden md:table-cell">{employeeName}</TableCell>
 <TableCell>
 <span className="md:hidden" style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
 {employeeName} ·
 </span>
 {MONTHS[submission.payMonth - 1]} {submission.payYear}
 </TableCell>
 <TableCell className="text-right font-medium">
 {currencySymbol}{centsToAmount(submission.netPayable).toLocaleString()}
 </TableCell>
 <TableCell>
 <Badge
 variant={statusVariant[submission.status]}
 className={
 submission.status === "signed"
 ? "border-green-500 text-green-700 dark:text-green-400"
 : undefined
 }
 >
 {submission.status}
 </Badge>
 </TableCell>
 <TableCell className="hidden lg:table-cell">
 {stdbTimestampToDate(submission.createdAt).toLocaleDateString()}
 </TableCell>
 <TableCell>
 <Button variant="ghost" size="sm" asChild>
 <Link href={`/boss/payslip/${Number(submission.id)}`}>View</Link>
 </Button>
 </TableCell>
 </>
 );
}

function PayslipCard({
 submission,
 employeeName,
 currencySymbol,
}: {
 submission: DbPayslipSubmission;
 employeeName: string;
 currencySymbol: string;
}) {
 return (
 <Link href={`/boss/payslip/${Number(submission.id)}`} className="block">
 <Card className="mb-2 p-3 transition-colors hover:bg-muted/50">
 <div className="flex items-center justify-between gap-2">
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-2">
 <span className="font-medium text-sm">
 {MONTHS[submission.payMonth - 1]} {submission.payYear}
 </span>
 <Badge
 variant={statusVariant[submission.status]}
 className={`text-xs px-1.5 py-0 ${submission.status === "signed" ? "border-green-500 text-green-700 dark:text-green-400" : ""}`}
 >
 {submission.status}
 </Badge>
 </div>
 <p className="text-xs text-muted-foreground truncate">{employeeName}</p>
 </div>
 <div className="text-right shrink-0">
 <p className="font-medium text-sm">
 {currencySymbol}{centsToAmount(submission.netPayable).toLocaleString()}
 </p>
 <p className="text-xs text-muted-foreground">
 {stdbTimestampToDate(submission.createdAt).toLocaleDateString()}
 </p>
 </div>
 </div>
 </Card>
 </Link>
 );
}

export default function BossDashboard() {
 const submissions = usePayslipSubmissions();
 const employees = useEmployees();
 const company = useCompany();
 const [sortBy, setSortBy] = useState<SortOption>("date");
 const [collapsedYears, setCollapsedYears] = useState<Set<number>>(new Set());
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
 if (next.has(year)) next.delete(year);
 else next.add(year);
 return next;
 });
 }

 return (
 <div className="container mx-auto px-4 py-4">
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
 <ArrowUpDown className="mr-1 size-3" />
 <span className="hidden sm:inline text-xs">
 {sortBy === "date" ? "By Payslip Date" : "By Submitted Date"}
 </span>
 <span className="sm:hidden text-xs">Sort</span>
 </Button>
 }
 />
 {sorted.length === 0 ? (
 <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
 <p className="text-sm font-medium text-muted-foreground">
 No submissions yet
 </p>
 </div>
 ) : (
 <div className="space-y-3">
 {[...groupedByYear.entries()].map(([year, subs]) => {
 const isCollapsed = collapsedYears.has(year);
 return (
 <Collapsible
 key={year}
 open={!isCollapsed}
 onOpenChange={() => toggleYear(year)}
 >
 <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5 text-left hover:bg-muted">
 <ChevronRight
 className={`size-3 transition-transform ${!isCollapsed ? "rotate-90" : ""}`}
 />
 <span className="font-medium text-sm">{year}</span>
 <span className="text-xs text-muted-foreground">
 ({subs.length})
 </span>
 </CollapsibleTrigger>
 <CollapsibleContent>
 {/* Desktop Table */}
 <div className="hidden md:block mt-2">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Employee</TableHead>
 <TableHead>Month/Year</TableHead>
 <TableHead>Net Payable</TableHead>
 <TableHead>Status</TableHead>
 <TableHead className="hidden lg:table-cell">Submitted</TableHead>
 <TableHead>Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {subs.map((s) => (
 <TableRow key={Number(s.id)}>
 <PayslipRow
 submission={s}
 employeeName={employeeMap.get(s.employeeId) ?? "Unknown"}
 currencySymbol={currencySymbol}
 />
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 {/* Mobile Cards */}
 <div className="md:hidden mt-2 px-1">
 {subs.map((s) => (
 <PayslipCard
 key={Number(s.id)}
 submission={s}
 employeeName={employeeMap.get(s.employeeId) ?? "Unknown"}
 currencySymbol={currencySymbol}
 />
 ))}
 </div>
 </CollapsibleContent>
 </Collapsible>
 );
 })}
 </div>
 )}
 </div>
 );
}
