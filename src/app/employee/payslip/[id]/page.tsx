"use client";

import { use, useCallback, useMemo } from "react";
import { Download, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useStdb } from "@/providers/spacetimedb-provider";
import { useAuth } from "@/providers/auth-provider";
import {
  usePayslipSubmission,
  useCompany,
  useSignedPayslip,
  centsToAmount,
  parseJsonPayComponents,
  stdbTimestampToDate,
} from "@/hooks/use-db";
import { MONTHS } from "@/lib/constants";
import { getCurrencySymbol } from "@/lib/currencies";
import { downloadBase64Pdf } from "@/lib/pdf-utils";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/payslip/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PayslipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { conn } = useStdb();
  const { employeeId } = useAuth();

  let submissionId: bigint | undefined;
  try {
    submissionId = BigInt(id);
  } catch {
    // invalid URL param
  }

  const submission = usePayslipSubmission(submissionId);
  const company = useCompany();
  const signedPayslip = useSignedPayslip(submission?.id);

  const symbol = company ? getCurrencySymbol(company.currency) : "";

  const earnings = useMemo(
    () => (submission ? parseJsonPayComponents(submission.earningsJson) : []),
    [submission],
  );
  const deductions = useMemo(
    () => (submission ? parseJsonPayComponents(submission.deductionsJson) : []),
    [submission],
  );

  const handleDownload = useCallback(() => {
    if (!signedPayslip?.pdfBase64 || !submission) return;
    try {
      downloadBase64Pdf(
        signedPayslip.pdfBase64,
        `payslip-${MONTHS[submission.payMonth - 1]}-${submission.payYear}.pdf`,
      );
    } catch {
      toast.error("Failed to download PDF");
    }
  }, [signedPayslip, submission]);

  function handleResubmit() {
    if (!submission || !conn) return;
    try {
      conn.reducers.resubmitPayslip({ submissionId: submission.id });
      toast.success("Payslip resubmitted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to resubmit");
    }
  }

  if (!submissionId || (submission && submission.employeeId !== employeeId)) {
    return (
      <div className="container mx-auto px-4 py-6">
        <p className="text-muted-foreground">Payslip not found.</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="container mx-auto px-4 py-6">
        <p className="text-muted-foreground">Loading payslip...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Payslip Details"
        breadcrumbs={[
          { label: "My Payslips", href: "/employee" },
          {
            label: `${MONTHS[submission.payMonth - 1]} ${submission.payYear}`,
          },
        ]}
        action={
          <div className="flex gap-2">
            {submission.status === "draft" && (
              <Button variant="outline" onClick={handleResubmit}>
                <RotateCcw className="mr-2 size-4" />
                Resubmit
              </Button>
            )}
            {submission.status === "signed" && signedPayslip && (
              <Button onClick={handleDownload}>
                <Download className="mr-2 size-4" />
                Download PDF
              </Button>
            )}
          </div>
        }
      />

      <div className="max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <StatusBadge status={submission.status} />
          <span className="text-sm text-muted-foreground">
            Submitted{" "}
            {stdbTimestampToDate(submission.createdAt).toLocaleDateString()}
          </span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pay Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Period</p>
                <p className="font-medium">
                  {MONTHS[submission.payMonth - 1]} {submission.payYear}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Date</p>
                <p className="font-medium">{submission.paymentDate || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid Days</p>
                <p className="font-medium">{submission.paidDays}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">LOP Days</p>
                <p className="font-medium">{submission.lopDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {earnings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {earnings.map((e, i) => (
                    <TableRow key={i}>
                      <TableCell>{e.name}</TableCell>
                      <TableCell className="text-right">
                        {symbol}
                        {e.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {deductions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deductions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deductions.map((d, i) => (
                    <TableRow key={i}>
                      <TableCell>{d.name}</TableCell>
                      <TableCell className="text-right">
                        {symbol}
                        {d.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gross Earnings</span>
              <span className="font-medium">
                {symbol}
                {centsToAmount(submission.grossEarnings).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Deductions</span>
              <span className="font-medium">
                {symbol}
                {centsToAmount(submission.totalDeductions).toLocaleString()}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-semibold">Net Payable</span>
              <span className="font-semibold">
                {symbol}
                {centsToAmount(submission.netPayable).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground italic">
              {submission.amountInWords}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
