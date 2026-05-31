"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Trash2, Eye, RotateCcw, ArrowUpDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { useStdb } from "@/providers/spacetimedb-provider";
import {
 useMyPayslipSubmissions,
 useCompany,
 centsToAmount,
  stdbTimestampToDate,
} from "@/hooks/use-db";
import { MONTHS } from "@/lib/constants";
import { getCurrencySymbol } from "@/lib/currencies";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/payslip/status-badge";
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
import type { DbPayslipSubmission } from "@/types";

type SortOption = "date" | "submitted";

export default function EmployeeDashboardPage() {
  const { employeeId } = useAuth();
 const { conn } = useStdb();
 const submissions = useMyPayslipSubmissions(employeeId);
 const company = useCompany();
 const [deletingId, setDeletingId] = useState<bigint | null>(null);
 const [sortBy, setSortBy] = useState<SortOption>("date");
 const [collapsedYears, setCollapsedYears] = useState<Set<number>>(
 new Set(),
 );

 const symbol = company ? getCurrencySymbol(company.currency) : "";

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

 function handleDelete(id: bigint) {
  if (!conn) return;
  if (deletingId === id) {
 try {
 conn.reducers.deleteDraft({ submissionId: id });
 toast.success("Submission deleted");
 } catch (err: unknown) {
  toast.error(err instanceof Error ? err.message : "Failed to delete");
 }
  setDeletingId(null);
 } else {
 setDeletingId(id);
 }
  }

 function handleResubmit(id: bigint) {
  if (!conn) return;
 try {
 conn.reducers.resubmitPayslip({ submissionId: id });
 toast.success("Payslip resubmitted");
 } catch (err: unknown) {
 toast.error(err instanceof Error ? err.message : "Failed to resubmit");
 }
 }

 return (
 <div className="container mx-auto px-4 py-6">
  <PageHeader
 title="My Payslips"
 action={
 <div className="flex gap-2">
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
 <Button asChild>
 <Link href="/employee/submit">New Submission</Link>
 </Button>
 </div>
 }
 />

 {sorted.length === 0 ? (
 <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
 <p className="text-lg font-medium text-muted-foreground">
 No payslips yet
 </p>
 <p className="mt-1 text-sm text-muted-foreground">
 Submit your first payslip to see it here.
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
  <TableHead>Month / Year</TableHead>
  <TableHead className="text-right">Net Payable</TableHead>
 <TableHead>Status</TableHead>
 <TableHead>Submitted</TableHead>
 <TableHead className="text-right">Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
  {subs.map((s) => (
 <TableRow key={Number(s.id)}>
 <TableCell>
 {MONTHS[s.payMonth - 1]} {s.payYear}
 </TableCell>
  <TableCell className="text-right">
 {symbol}
 {centsToAmount(s.netPayable).toLocaleString()}
 </TableCell>
 <TableCell>
 <StatusBadge status={s.status} />
 </TableCell>
 <TableCell>
 {stdbTimestampToDate(s.createdAt).toLocaleDateString()}
 </TableCell>
  <TableCell className="text-right">
  <div className="flex items-center justify-end gap-1">
 <Button variant="ghost" size="icon" asChild>
 <Link href={`/employee/payslip/${Number(s.id)}`}>
 <Eye className="size-4" />
 </Link>
 </Button>
 {s.status === "draft" && (
 <Button
 variant="ghost"
 size="icon"
 onClick={() => handleResubmit(s.id)}
 title="Resubmit"
 >
 <RotateCcw className="size-4" />
 </Button>
 )}
 {s.status !== "signed" && (
 <Button
 variant="ghost"
 size="icon"
 className="text-destructive hover:text-destructive"
 onClick={() => handleDelete(s.id)}
 title={
 deletingId === s.id
 ? "Click again to confirm"
 : "Delete"
 }
 >
 <Trash2 className="size-4" />
 </Button>
 )}
 </div>
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
