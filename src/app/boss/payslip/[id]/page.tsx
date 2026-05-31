"use client";

import { use, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  usePayslipSubmission,
  useEmployee,
  useCompany,
  useFieldVisibility,
  useSignedPayslip,
  useHiddenPayslip,
  centsToAmount,
  parseJsonPayComponents,
  parseJsonCustomFields,
  stdbTimestampToDate,
} from "@/hooks/use-db";
import { useStdb } from "@/providers/spacetimedb-provider";
import { getCurrencySymbol } from "@/lib/currencies";
import { MONTHS, SIGNATURE_KEY } from "@/lib/constants";
import { downloadBase64Pdf } from "@/lib/pdf-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { PayslipDocumentProps } from "@/components/pdf/payslip-document";

export default function PayslipReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  let submissionId: bigint | undefined;
  try {
    submissionId = BigInt(id);
  } catch {
    // invalid URL param
  }
  const submission = usePayslipSubmission(submissionId);
  const employee = useEmployee(submission?.employeeId);
  const company = useCompany();
  const fieldVisibility = useFieldVisibility();
  const signedPayslip = useSignedPayslip(submissionId);
  const hiddenPayslip = useHiddenPayslip(submissionId);
  const { conn } = useStdb();
  const isHidden = hiddenPayslip !== null;

  const [signing, setSigning] = useState(false);
  const [hideOpen, setHideOpen] = useState(false);
  const [hideReason, setHideReason] = useState("");

  const currencySymbol = getCurrencySymbol(company?.currency ?? "USD");

  const earnings = useMemo(
    () => (submission ? parseJsonPayComponents(submission.earningsJson) : []),
    [submission],
  );
  const deductions = useMemo(
    () => (submission ? parseJsonPayComponents(submission.deductionsJson) : []),
    [submission],
  );
  const customFields = useMemo(
    () =>
      submission ? parseJsonCustomFields(submission.customFieldsJson) : [],
    [submission],
  );

  const grossEarnings = submission
    ? centsToAmount(submission.grossEarnings)
    : 0;
  const totalDeductions = submission
    ? centsToAmount(submission.totalDeductions)
    : 0;
  const netPayable = submission ? centsToAmount(submission.netPayable) : 0;

  async function handleSign() {
    if (!conn || !submission || !company || !employee) return;

    const signatureImage = localStorage.getItem(SIGNATURE_KEY);
    if (!signatureImage) {
      toast.error("Upload your signature first (top nav)");
      return;
    }

    setSigning(true);
    try {
      const props: PayslipDocumentProps = {
        company: {
          name: company.name,
          address: company.address,
          city: company.city,
          pincode: company.pincode,
          logo: company.logo,
          currency: company.currency,
        },
        employee: {
          name: employee.name,
          employeeId: employee.employeeCode,
          designation: employee.designation,
        },
        payPeriod: { month: submission.payMonth, year: submission.payYear },
        paidDays: submission.paidDays,
        lopDays: submission.lopDays,
        paymentDate: submission.paymentDate,
        earnings,
        deductions,
        customFields,
        grossEarnings,
        totalDeductions,
        netPayable,
        amountInWords: submission.amountInWords,
        fieldVisibility,
        signedBy: company.bossName,
        signatureImage,
      };

      const { pdf } = await import("@react-pdf/renderer");
      const { PayslipDocument } =
        await import("@/components/pdf/payslip-document");
      const blob = await pdf(<PayslipDocument {...props} />).toBlob();

      const reader = new FileReader();
      const base64str = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",", 2)[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      conn.reducers.signPayslip({
        submissionId: submission.id,
        pdfBase64: base64str,
      });
      toast.success("Payslip signed");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to sign payslip",
      );
    } finally {
      setSigning(false);
    }
  }

  function handleReject() {
    if (!conn || !submission) return;
    try {
      conn.reducers.rejectPayslip({ submissionId: submission.id });
      toast.success("Payslip rejected");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to reject payslip",
      );
    }
  }

  function handleDownload() {
    if (!signedPayslip || !submission || !employee) return;
    try {
      downloadBase64Pdf(
        signedPayslip.pdfBase64,
        `payslip-${employee.name}-${submission.payMonth}-${submission.payYear}.pdf`,
      );
    } catch {
      toast.error("Failed to download PDF");
    }
  }

  function handleHide() {
    if (!conn || !submission) return;
    const reason = hideReason.trim();
    if (reason.length < 3 || reason.length > 250) {
      toast.error("Reason must be between 3 and 250 characters");
      return;
    }

    try {
      conn.reducers.hidePayslip({ submissionId: submission.id, reason });
      toast.success("Payslip hidden");
      setHideReason("");
      setHideOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to hide payslip");
    }
  }

  if (!submissionId || !submission) {
    return (
      <div className="container mx-auto px-4 py-6">
        <p className="text-muted-foreground">Payslip not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Review Payslip"
        breadcrumbs={[
          { label: "Dashboard", href: "/boss" },
          { label: "Review Payslip" },
        ]}
        action={
          <div className="flex items-center gap-2">
            {submission.status === "submitted" && (
              <>
                <Button variant="destructive" onClick={handleReject}>
                  Reject
                </Button>
                <Button onClick={handleSign} disabled={signing}>
                  {signing ? "Signing..." : "Sign & Save"}
                </Button>
              </>
            )}
            {submission.status === "signed" && (
              <>
                {isHidden ? (
                  <Badge
                    variant="secondary"
                    className="border-amber-500 text-amber-700"
                  >
                    Hidden
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-green-500 text-green-700 dark:text-green-400"
                  >
                    Signed
                  </Badge>
                )}
                {signedPayslip && (
                  <Button variant="outline" onClick={handleDownload}>
                    Download PDF
                  </Button>
                )}
              </>
            )}
          </div>
        }
      />

      {isHidden && hiddenPayslip && (
        <Card className="mb-4 border-amber-500/40 bg-amber-500/5 p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="border-amber-500 text-amber-700"
              >
                Hidden
              </Badge>
              <p className="text-sm font-medium">This payslip is hidden.</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Reason: {hiddenPayslip.reason || "-"}
            </p>
            <p className="text-xs text-muted-foreground">
              Hidden: {stdbTimestampToDate(hiddenPayslip.hiddenAt).toLocaleString()}
            </p>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Company
            </h3>
            <p className="font-semibold">{company?.name}</p>
            {fieldVisibility.companyAddress && company?.address && (
              <p className="text-sm text-muted-foreground">{company.address}</p>
            )}
            {(fieldVisibility.companyCity ||
              fieldVisibility.companyPincode) && (
              <p className="text-sm text-muted-foreground">
                {fieldVisibility.companyCity ? company?.city : ""}
                {fieldVisibility.companyCity &&
                fieldVisibility.companyPincode &&
                company?.city &&
                company?.pincode
                  ? " "
                  : ""}
                {fieldVisibility.companyPincode ? company?.pincode : ""}
              </p>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Pay Period
            </h3>
            <p className="font-semibold">
              {MONTHS[submission.payMonth - 1]} {submission.payYear}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Employee
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm max-w-md">
              <span className="text-muted-foreground">Name</span>
              <span>{employee?.name ?? "-"}</span>
              {fieldVisibility.employeeId && (
                <>
                  <span className="text-muted-foreground">Employee ID</span>
                  <span>{employee?.employeeCode || "-"}</span>
                </>
              )}
              {fieldVisibility.designation && (
                <>
                  <span className="text-muted-foreground">Designation</span>
                  <span>{employee?.designation || "-"}</span>
                </>
              )}
              {fieldVisibility.paidDays && (
                <>
                  <span className="text-muted-foreground">Paid Days</span>
                  <span>{submission.paidDays}</span>
                </>
              )}
              {fieldVisibility.lopDays && (
                <>
                  <span className="text-muted-foreground">LOP Days</span>
                  <span>{submission.lopDays}</span>
                </>
              )}
              {fieldVisibility.paymentDate && submission.paymentDate && (
                <>
                  <span className="text-muted-foreground">Payment Date</span>
                  <span>{submission.paymentDate}</span>
                </>
              )}
              {fieldVisibility.customFields &&
                customFields.map((cf) => (
                  <span key={cf.key} className="contents">
                    <span className="text-muted-foreground">{cf.key}</span>
                    <span>{cf.value}</span>
                  </span>
                ))}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Earnings
              </h3>
              <div className="space-y-1 text-sm">
                {earnings.map((e, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{e.name}</span>
                    <span>
                      {currencySymbol}
                      {e.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Gross Earnings</span>
                  <span>
                    {currencySymbol}
                    {grossEarnings.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Deductions
              </h3>
              <div className="space-y-1 text-sm">
                {deductions.map((d, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{d.name}</span>
                    <span>
                      {currencySymbol}
                      {d.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Deductions</span>
                  <span>
                    {currencySymbol}
                    {totalDeductions.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-bold">
                Net Payable: {currencySymbol}
                {netPayable.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                {submission.amountInWords}
              </p>
            </div>
          </div>

          {submission.status !== "draft" && (
            <div className="text-xs text-muted-foreground">
              Submitted:{" "}
              {stdbTimestampToDate(submission.createdAt).toLocaleString()}
              {signedPayslip && (
                <>
                  {" "}
                  | Signed:{" "}
                  {stdbTimestampToDate(signedPayslip.signedAt).toLocaleString()}
                </>
              )}
            </div>
          )}
        </div>
      </Card>

      {submission.status === "signed" && !isHidden && (
        <Card className="mt-4 border-destructive/30 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Hide this payslip</p>
              <p className="text-sm text-muted-foreground">
                Move this signed payslip out of normal lists while keeping it
                traceable in Hidden Payslips.
              </p>
            </div>
            <Button variant="destructive" onClick={() => setHideOpen(true)}>
              Hide Payslip
            </Button>
          </div>
        </Card>
      )}

      <Dialog open={hideOpen} onOpenChange={setHideOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hide payslip?</DialogTitle>
            <DialogDescription>
              This removes the signed payslip from normal lists. It will remain
              available in Hidden Payslips.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={hideReason}
            onChange={(event) => setHideReason(event.target.value)}
            maxLength={250}
            placeholder="Reason, for example: wrong amount"
          />
          <p className="text-xs text-muted-foreground">
            {hideReason.trim().length}/250 characters. Minimum 3 characters.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHideOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleHide}
              disabled={hideReason.trim().length < 3}
            >
              Hide Payslip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
