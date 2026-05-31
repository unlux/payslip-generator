"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, ChevronRight, Eye, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import {
  usePayslipSubmissions,
  useHiddenPayslips,
  useEmployees,
  useCompany,
  stdbTimestampToDate,
  centsToAmount,
} from "@/hooks/use-db";
import { useStdb } from "@/providers/spacetimedb-provider";
import { getCurrencySymbol } from "@/lib/currencies";
import { MONTHS } from "@/lib/constants";
import {
  splitPayslipsByVisibility,
  type HiddenPayslipListItem,
} from "@/lib/payslip-visibility";
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

function HiddenBadge() {
  return (
    <Badge variant="secondary" className="border-amber-500 text-amber-700">
      Hidden
    </Badge>
  );
}

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
        <span className="text-xs text-muted-foreground md:hidden">
          {employeeName}{" "}
        </span>
        {MONTHS[submission.payMonth - 1]} {submission.payYear}
      </TableCell>
      <TableCell className="text-right font-medium">
        {currencySymbol}
        {centsToAmount(submission.netPayable).toLocaleString()}
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
              <span className="text-sm font-medium">
                {MONTHS[submission.payMonth - 1]} {submission.payYear}
              </span>
              <Badge
                variant={statusVariant[submission.status]}
                className={`px-1.5 py-0 text-xs ${
                  submission.status === "signed"
                    ? "border-green-500 text-green-700 dark:text-green-400"
                    : ""
                }`}
              >
                {submission.status}
              </Badge>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {employeeName}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-medium">
              {currencySymbol}
              {centsToAmount(submission.netPayable).toLocaleString()}
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

function HiddenPayslipRow({
  submission,
  employeeName,
  currencySymbol,
  onRestore,
}: {
  submission: HiddenPayslipListItem;
  employeeName: string;
  currencySymbol: string;
  onRestore: (id: bigint) => void;
}) {
  return (
    <TableRow>
      <TableCell>{employeeName}</TableCell>
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
      <TableCell>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/boss/payslip/${Number(submission.id)}`}>
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
  employeeName,
  currencySymbol,
  onRestore,
}: {
  submission: HiddenPayslipListItem;
  employeeName: string;
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
            <HiddenBadge />
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {employeeName}
          </p>
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
          <Link href={`/boss/payslip/${Number(submission.id)}`}>
            <Eye className="mr-1 size-3" />
            <span className="text-xs">View</span>
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2"
          onClick={() => onRestore(submission.id)}
        >
          <RotateCcw className="size-3" />
        </Button>
      </div>
    </Card>
  );
}

export default function BossDashboard() {
  const { conn } = useStdb();
  const submissions = usePayslipSubmissions();
  const hiddenPayslips = useHiddenPayslips();
  const employees = useEmployees();
  const company = useCompany();
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [collapsedYears, setCollapsedYears] = useState<Set<number>>(new Set());
  const [isHiddenCollapsed, setIsHiddenCollapsed] = useState(true);
  const currencySymbol = getCurrencySymbol(company?.currency ?? "USD");

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
            <span className="hidden text-xs sm:inline">
              {sortBy === "date" ? "By Payslip Date" : "By Submitted Date"}
            </span>
            <span className="text-xs sm:hidden">Sort</span>
          </Button>
        }
      />

      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No submissions yet
            </p>
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
                          <TableHead>Employee</TableHead>
                          <TableHead>Month/Year</TableHead>
                          <TableHead>Net Payable</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden lg:table-cell">
                            Submitted
                          </TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subs.map((s) => (
                          <TableRow key={Number(s.id)}>
                            <PayslipRow
                              submission={s}
                              employeeName={
                                employeeMap.get(s.employeeId) ?? "Unknown"
                              }
                              currencySymbol={currencySymbol}
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
                        employeeName={employeeMap.get(s.employeeId) ?? "Unknown"}
                        currencySymbol={currencySymbol}
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
                        <TableHead>Employee</TableHead>
                        <TableHead>Month/Year</TableHead>
                        <TableHead>Net Payable</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Hidden
                        </TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hiddenSorted.map((s) => (
                        <HiddenPayslipRow
                          key={Number(s.id)}
                          submission={s}
                          employeeName={employeeMap.get(s.employeeId) ?? "Unknown"}
                          currencySymbol={currencySymbol}
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
                      employeeName={employeeMap.get(s.employeeId) ?? "Unknown"}
                      currencySymbol={currencySymbol}
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
