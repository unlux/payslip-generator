"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Trash2, Eye, RotateCcw } from "lucide-react";
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

export default function EmployeeDashboardPage() {
  const { employeeId } = useAuth();
  const { conn } = useStdb();
  const submissions = useMyPayslipSubmissions(employeeId);
  const company = useCompany();
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const symbol = company ? getCurrencySymbol(company.currency) : "";

  const sorted = useMemo(
    () =>
      [...submissions].sort((a, b) => {
        const aTime = Number(a.updatedAt.microsSinceUnixEpoch);
        const bTime = Number(b.updatedAt.microsSinceUnixEpoch);
        return bTime - aTime;
      }),
    [submissions],
  );

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
          <Button asChild>
            <Link href="/employee/submit">New Submission</Link>
          </Button>
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
            {sorted.map((s) => (
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
      )}
    </div>
  );
}
