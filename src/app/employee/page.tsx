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
import { Card } from "@/components/ui/card";
import type { DbPayslipSubmission } from "@/types";

type SortOption = "date" | "submitted";

function PayslipRow({
 submission,
 currencySymbol,
 deletingId,
 onDelete,
 onResubmit,
}: {
 submission: DbPayslipSubmission;
 currencySymbol: string;
 deletingId: bigint | null;
 onDelete: (id: bigint) => void;
 onResubmit: (id: bigint) => void;
}) {
 return (
 <>
 <TableCell>
 {MONTHS[submission.payMonth - 1]} {submission.payYear}
 </TableCell>
 <TableCell className="text-right font-medium">
 {currencySymbol}{centsToAmount(submission.netPayable).toLocaleString()}
 </TableCell>
 <TableCell>
 <StatusBadge status={submission.status} />
 </TableCell>
 <TableCell className="hidden lg:table-cell">
 {stdbTimestampToDate(submission.createdAt).toLocaleDateString()}
 </TableCell>
 <TableCell className="text-right">
 <div className="flex items-center justify-end gap-1">
 <Button variant="ghost" size="icon" asChild>
 <Link href={`/employee/payslip/${Number(submission.id)}`}>
 <Eye className="size-4" />
 </Link>
 </Button>
 {submission.status === "draft" && (
 <Button
 variant="ghost"
 size="icon"
 onClick={() => onResubmit(submission.id)}
 title="Resubmit"
 >
 <RotateCcw className="size-4" />
 </Button>
 )}
 {submission.status !== "signed" && (
 <Button
 variant="ghost"
 size="icon"
 className="text-destructive hover:text-destructive"
 onClick={() => onDelete(submission.id)}
 >
 <Trash2 className="size-4" />
 </Button>
 )}
 </div>
 </TableCell>
 </>
 );
}

function PayslipCard({
 submission,
 currencySymbol,
 deletingId,
 onDelete,
 onResubmit,
}: {
 submission: DbPayslipSubmission;
 currencySymbol: string;
 deletingId: bigint | null;
 onDelete: (id: bigint) => void;
 onResubmit: (id: bigint) => void;
}) {
 const isDeleting = deletingId === submission.id;
 return (
 <Card className="mb-2 p-3">
 <div className="flex items-center justify-between gap-2">
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-2">
 <span className="font-medium text-sm">
 {MONTHS[submission.payMonth - 1]} {submission.payYear}
 </span>
 <StatusBadge status={submission.status} />
 </div>
 <p className="text-xs text-muted-foreground">
 {stdbTimestampToDate(submission.createdAt).toLocaleDateString()}
 </p>
 </div>
 <div className="text-right shrink-0">
 <p className="font-medium text-sm">
 {currencySymbol}{centsToAmount(submission.netPayable).toLocaleString()}
 </p>
 </div>
 </div>
 <div className="mt-2 flex gap-1">
 <Button variant="outline" size="sm" className="flex-1 h-8" asChild>
 <Link href={`/employee/payslip/${Number(submission.id)}`}>
 <Eye className="size-3 mr-1" />
 <span className="text-xs">View</span>
 </Link>
 </Button>
 {submission.status === "draft" && (
 <Button
 variant="outline"
 size="sm"
 className="h-8 px-2"
 onClick={() => onResubmit(submission.id)}
 title="Resubmit"
 >
 <RotateCcw className="size-3" />
 </Button>
 )}
 {submission.status !== "signed" && (
 <Button
 variant="outline"
 size="sm"
 className="h-8 px-2 text-destructive hover:text-destructive"
 onClick={() => onDelete(submission.id)}
 title={isDeleting ? "Click again to confirm" : "Delete"}
 >
 <Trash2 className="size-3" />
 </Button>
 )}
 </div>
 </Card>
 );
}

export default function EmployeeDashboardPage() {
 const { employeeId } = useAuth();
 const { conn } = useStdb();
 const submissions = useMyPayslipSubmissions(employeeId);
 const company = useCompany();
 const [deletingId, setDeletingId] = useState<bigint | null>(null);
 const [sortBy, setSortBy] = useState<SortOption>("date");
 const [collapsedYears, setCollapsedYears] = useState<Set<number>>(new Set());

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
 if (next.has(year)) next.delete(year);
 else next.add(year);
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
 <div className="container mx-auto px-4 py-4">
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
 <ArrowUpDown className="mr-1 size-3" />
 <span className="hidden sm:inline text-xs">
 {sortBy === "date" ? "By Payslip Date" : "By Submitted Date"}
 </span>
 <span className="sm:hidden text-xs">Sort</span>
 </Button>
 <Button size="sm" asChild>
 <Link href="/employee/submit" className="text-xs">New</Link>
 </Button>
 </div>
 }
 />

 {sorted.length === 0 ? (
 <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
 <p className="text-sm font-medium text-muted-foreground">
 No payslips yet
 </p>
 <p className="mt-1 text-xs text-muted-foreground">
 Submit your first payslip to see it here.
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
 <TableHead>Month / Year</TableHead>
 <TableHead className="text-right">Net Payable</TableHead>
 <TableHead>Status</TableHead>
 <TableHead className="hidden lg:table-cell">Submitted</TableHead>
 <TableHead className="text-right">Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {subs.map((s) => (
 <TableRow key={Number(s.id)}>
 <PayslipRow
 submission={s}
 currencySymbol={symbol}
 deletingId={deletingId}
 onDelete={handleDelete}
 onResubmit={handleResubmit}
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
 currencySymbol={symbol}
 deletingId={deletingId}
 onDelete={handleDelete}
 onResubmit={handleResubmit}
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
