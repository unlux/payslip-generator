"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Trash2, Eye, RotateCcw, ArrowUpDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { useStdb } from "@/providers/spacetimedb-provider";
import {
  useMyPayslipSubmissions,
  useHiddenPayslips,
  useCompany,
  centsToAmount,
  stdbTimestampToDate,
} from "@/hooks/use-db";
import { MONTHS } from "@/lib/constants";
import { getCurrencySymbol } from "@/lib/currencies";
import {
  splitPayslipsByVisibility,
  type HiddenPayslipListItem,
} from "@/lib/payslip-visibility";
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

function sortPayslips<T extends DbPayslipSubmission>(
  submissions: T[],
  sortBy: SortOption,
): T[] {
  return [...submissions].sort((a, b) => {
    if (sortBy === "date") {
      if (a.payYear !== b.payYear) return b.payYear - a.payYear;
      return b.payMonth - a.payMonth;
    }
    return (
      Number(b.createdAt.microsSinceUnixEpoch) -
      Number(a.createdAt.microsSinceUnixEpoch)
    );
  });
}

function formatOptionalDate(timestamp?: { microsSinceUnixEpoch: bigint }) {
  return timestamp ? stdbTimestampToDate(timestamp).toLocaleDateString() : "-";
}

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
        {currencySymbol}
        {centsToAmount(submission.netPayable).toLocaleString()}
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
              title={
                deletingId === submission.id ? "Click again to confirm" : "Delete"
              }
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
            <span className="text-sm font-medium">
              {MONTHS[submission.payMonth - 1]} {submission.payYear}
            </span>
            <StatusBadge status={submission.status} />
          </div>
          <p className="text-xs text-muted-foreground">
            {stdbTimestampToDate(submission.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-medium">
            {currencySymbol}
            {centsToAmount(submission.netPayable).toLocaleString()}
          </p>
        </div>
      </div>
      <div className="mt-2 flex gap-1">
        <Button variant="outline" size="sm" className="h-8 flex-1" asChild>
          <Link href={`/employee/payslip/${Number(submission.id)}`}>
            <Eye className="mr-1 size-3" />
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

function HiddenPayslipRow({
  submission,
  currencySymbol,
  onRestore,
}: {
  submission: HiddenPayslipListItem;
  currencySymbol: string;
  onRestore: (id: bigint) => void;
}) {
  return (
    <TableRow>
      <TableCell>
        {MONTHS[submission.payMonth - 1]} {submission.payYear}
      </TableCell>
      <TableCell className="text-right font-medium">
        {currencySymbol}
        {centsToAmount(submission.netPayable).toLocaleString()}
      </TableCell>
      <TableCell className="max-w-[18rem] truncate">
        {submission.hiddenReason || "-"}
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        {formatOptionalDate(submission.hiddenAt)}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/employee/payslip/${Number(submission.id)}`}>
              <Eye className="mr-1 size-3" />
              View
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRestore(submission.id)}
          >
            <RotateCcw className="mr-1 size-3" />
            Restore
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function HiddenPayslipCard({
  submission,
  currencySymbol,
  onRestore,
}: {
  submission: HiddenPayslipListItem;
  currencySymbol: string;
  onRestore: (id: bigint) => void;
}) {
  return (
    <Card className="mb-2 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {MONTHS[submission.payMonth - 1]} {submission.payYear}
            </span>
            <StatusBadge status="hidden" />
          </div>
          <p className="mt-1 line-clamp-2 text-xs">
            {submission.hiddenReason || "No reason provided"}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-medium">
            {currencySymbol}
            {centsToAmount(submission.netPayable).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatOptionalDate(submission.hiddenAt)}
          </p>
        </div>
      </div>
      <div className="mt-2 flex gap-1">
        <Button variant="outline" size="sm" className="h-8 flex-1" asChild>
          <Link href={`/employee/payslip/${Number(submission.id)}`}>
            <Eye className="mr-1 size-3" />
            <span className="text-xs">View</span>
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2"
          onClick={() => onRestore(submission.id)}
          title="Restore"
        >
          <RotateCcw className="size-3" />
        </Button>
      </div>
    </Card>
  );
}

export default function EmployeeDashboardPage() {
  const { employeeId } = useAuth();
  const { conn } = useStdb();
  const submissions = useMyPayslipSubmissions(employeeId);
  const hiddenPayslips = useHiddenPayslips();
  const company = useCompany();
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [collapsedYears, setCollapsedYears] = useState<Set<number>>(new Set());
  const [isHiddenCollapsed, setIsHiddenCollapsed] = useState(true);

  const symbol = company ? getCurrencySymbol(company.currency) : "";

  const { visible, hidden } = useMemo(
    () => splitPayslipsByVisibility(submissions, hiddenPayslips),
    [submissions, hiddenPayslips],
  );

  const sorted = useMemo(() => sortPayslips(visible, sortBy), [visible, sortBy]);
  const hiddenSorted = useMemo(
    () => sortPayslips(hidden, sortBy),
    [hidden, sortBy],
  );

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

  function handleRestore(id: bigint) {
    if (!conn) return;
    try {
      conn.reducers.restorePayslip({ submissionId: id });
      toast.success("Payslip restored");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to restore");
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
              <span className="hidden text-xs sm:inline">
                {sortBy === "date" ? "By Payslip Date" : "By Submitted Date"}
              </span>
              <span className="text-xs sm:hidden">Sort</span>
            </Button>
            <Button size="sm" asChild>
              <Link href="/employee/submit" className="text-xs">
                New
              </Link>
            </Button>
          </div>
        }
      />

      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              {hiddenSorted.length > 0 ? "No visible payslips" : "No payslips yet"}
            </p>
            {hiddenSorted.length === 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                Submit your first payslip to see it here.
              </p>
            )}
          </div>
        ) : (
          [...groupedByYear.entries()].map(([year, subs]) => {
            const isCollapsed = collapsedYears.has(year);
            return (
              <Collapsible
                key={year}
                open={!isCollapsed}
                onOpenChange={() => toggleYear(year)}
              >
                <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5 text-left hover:bg-muted">
                  <ChevronRight
                    className={`size-3 transition-transform ${
                      !isCollapsed ? "rotate-90" : ""
                    }`}
                  />
                  <span className="text-sm font-medium">{year}</span>
                  <span className="text-xs text-muted-foreground">
                    ({subs.length})
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month / Year</TableHead>
                          <TableHead className="text-right">
                            Net Payable
                          </TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden lg:table-cell">
                            Submitted
                          </TableHead>
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
                  <div className="mt-2 px-1 md:hidden">
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
          })
        )}

        <Collapsible
          open={!isHiddenCollapsed}
          onOpenChange={() => setIsHiddenCollapsed((collapsed) => !collapsed)}
        >
          <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5 text-left hover:bg-muted">
            <ChevronRight
              className={`size-3 transition-transform ${
                !isHiddenCollapsed ? "rotate-90" : ""
              }`}
            />
            <span className="text-sm font-medium">Hidden Payslips</span>
            <span className="text-xs text-muted-foreground">
              ({hiddenSorted.length})
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {hiddenSorted.length === 0 ? (
              <div className="mt-2 rounded-lg border border-dashed py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No hidden payslips
                </p>
              </div>
            ) : (
              <>
                <div className="mt-2 hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month / Year</TableHead>
                        <TableHead className="text-right">
                          Net Payable
                        </TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Hidden
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hiddenSorted.map((s) => (
                        <HiddenPayslipRow
                          key={Number(s.id)}
                          submission={s}
                          currencySymbol={symbol}
                          onRestore={handleRestore}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-2 px-1 md:hidden">
                  {hiddenSorted.map((s) => (
                    <HiddenPayslipCard
                      key={Number(s.id)}
                      submission={s}
                      currencySymbol={symbol}
                      onRestore={handleRestore}
                    />
                  ))}
                </div>
              </>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
