/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { MONTHS } from "@/lib/constants";
import { getCurrencySymbol } from "@/lib/currencies";
import { amountToWords } from "@/lib/amount-to-words";
import {
  COMPANY,
  CEO_NAME,
  EMPLOYEES,
  DEFAULT_EARNINGS,
  DEFAULT_DEDUCTIONS,
} from "@/lib/payslip-config";
import type { PayComponent } from "@/types";
import {
  PayslipDocument,
  type PayslipDocumentProps,
} from "@/components/pdf/payslip-document";
import { InlineInput } from "./inline-input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, ImageIcon, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export function PayslipEditor() {
  const now = new Date();
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const currencySymbol = getCurrencySymbol(COMPANY.currency);

  // Employee
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [empId, setEmpId] = useState("");
  const [designation, setDesignation] = useState("");

  // Pay period
  const [payMonth, setPayMonth] = useState(now.getMonth() + 1);
  const [payYear, setPayYear] = useState(now.getFullYear());
  const [paymentDate, setPaymentDate] = useState("");
  const [paidDays, setPaidDays] = useState(30);
  const [lopDays, setLopDays] = useState(0);

  // Signature
  const [signatureImage, setSignatureImage] = useState("");

  // Pay components
  const [earnings, setEarnings] = useState<PayComponent[]>(
    DEFAULT_EARNINGS.map((e) => ({ ...e })),
  );
  const [deductions, setDeductions] = useState<PayComponent[]>(
    DEFAULT_DEDUCTIONS.map((d) => ({ ...d })),
  );

  const [downloading, setDownloading] = useState(false);

  const years = useMemo(() => {
    const result: number[] = [];
    for (let y = 2020; y <= 2030; y++) result.push(y);
    return result;
  }, []);

  const grossEarnings = useMemo(
    () =>
      earnings
        .filter((e) => e.name && e.amount >= 0)
        .reduce((s, e) => s + e.amount, 0),
    [earnings],
  );

  const totalDeductions = useMemo(
    () =>
      deductions
        .filter((d) => d.name && d.amount >= 0)
        .reduce((s, d) => s + d.amount, 0),
    [deductions],
  );

  const netPayable = grossEarnings - totalDeductions;
  const words = useMemo(() => amountToWords(netPayable), [netPayable]);

  const fmt = (amount: number) =>
    `${currencySymbol}${amount.toLocaleString("en-IN")}`;

  // --- Handlers ---

  const handleEmployeeChange = useCallback((id: string) => {
    setSelectedEmployeeId(id);
    const emp = EMPLOYEES.find((e) => e.id === id);
    if (!emp) return;
    setEmployeeName(emp.name);
    setEmpId(emp.employeeId);
    setDesignation(emp.designation);
  }, []);

  const handleSignatureUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setSignatureImage(reader.result as string);
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [],
  );

  const updateEarning = useCallback(
    (index: number, field: keyof PayComponent, value: string | number) => {
      setEarnings((prev) =>
        prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)),
      );
    },
    [],
  );

  const updateDeduction = useCallback(
    (index: number, field: keyof PayComponent, value: string | number) => {
      setDeductions((prev) =>
        prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
      );
    },
    [],
  );

  const addEarning = useCallback(() => {
    setEarnings((prev) => [...prev, { name: "", amount: 0 }]);
  }, []);

  const addDeduction = useCallback(() => {
    setDeductions((prev) => [...prev, { name: "", amount: 0 }]);
  }, []);

  const removeEarning = useCallback(
    (index: number) => {
      if (earnings.length <= 1) return;
      setEarnings((prev) => prev.filter((_, i) => i !== index));
    },
    [earnings.length],
  );

  const removeDeduction = useCallback((index: number) => {
    setDeductions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const buildProps = useCallback((): PayslipDocumentProps => {
    return {
      company: {
        id: "skillion",
        name: COMPANY.name,
        address: COMPANY.address,
        city: COMPANY.city,
        pincode: "",
        logo: COMPANY.logo,
        currency: COMPANY.currency,
        fieldVisibility: {
          companyAddress: true,
          companyCity: true,
          companyPincode: false,
          companyLogo: true,
          employeeId: true,
          uan: false,
          pan: false,
          bankAccountNumber: false,
          designation: true,
          paidDays: true,
          lopDays: true,
          paymentDate: true,
          payPeriod: true,
          customFields: false,
        },
        earningsTemplate: [],
        deductionsTemplate: [],
        createdAt: "",
        updatedAt: "",
      },
      employee: {
        id: selectedEmployeeId,
        companyId: "skillion",
        name: employeeName,
        employeeId: empId,
        designation,
        uan: "",
        pan: "",
        bankAccountNumber: "",
        customFields: [],
        createdAt: "",
        updatedAt: "",
      },
      payPeriod: { month: payMonth, year: payYear },
      paidDays,
      lopDays,
      paymentDate,
      earnings: earnings.filter((e) => e.name && e.amount >= 0),
      deductions: deductions.filter((d) => d.name && d.amount >= 0),
      customFields: [],
      grossEarnings,
      totalDeductions,
      netPayable,
      amountInWords: words,
      fieldVisibility: {
        companyAddress: true,
        companyCity: true,
        companyPincode: false,
        companyLogo: true,
        employeeId: true,
        uan: false,
        pan: false,
        bankAccountNumber: false,
        designation: true,
        paidDays: true,
        lopDays: true,
        paymentDate: true,
        payPeriod: true,
        customFields: false,
      },
      signedBy: CEO_NAME,
      signatureImage: signatureImage || undefined,
    };
  }, [
    selectedEmployeeId,
    employeeName,
    empId,
    designation,
    earnings,
    deductions,
    payMonth,
    payYear,
    paidDays,
    lopDays,
    paymentDate,
    grossEarnings,
    totalDeductions,
    netPayable,
    words,
    signatureImage,
  ]);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const props = buildProps();
      const blob = await pdf(<PayslipDocument {...props} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const month = MONTHS[payMonth - 1];
      link.href = url;
      link.download = `${COMPANY.name}_${employeeName || "Employee"}_${month}_${payYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Payslip downloaded");
    } catch {
      toast.error("Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  }, [buildProps, payMonth, payYear, employeeName]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="mx-auto flex max-w-[210mm] flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
        <Select value={selectedEmployeeId} onValueChange={handleEmployeeChange}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Select employee" />
          </SelectTrigger>
          <SelectContent>
            {EMPLOYEES.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(payMonth)}
          onValueChange={(v) => setPayMonth(Number(v))}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => (
              <SelectItem key={m} value={String(i + 1)}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(payYear)}
          onValueChange={(v) => setPayYear(Number(v))}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Button
          onClick={handleDownload}
          disabled={downloading || !employeeName}
        >
          <Download className="size-4" />
          {downloading ? "Generating..." : "Download PDF"}
        </Button>
      </div>

      {/* A4 Page */}
      <div className="mx-auto max-w-[210mm] bg-white shadow-lg">
        <div className="flex min-h-[297mm] flex-col px-[40px] py-[40px] text-[#333]">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src={COMPANY.logo}
                alt="Logo"
                className="max-h-10 max-w-14 object-contain"
              />
              <div>
                <p className="text-lg font-bold">{COMPANY.name}</p>
                <p className="text-xs text-muted-foreground">
                  {COMPANY.address} {COMPANY.city}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs italic text-muted-foreground">
                Payslip For the Month
              </p>
              <p className="text-sm font-bold">
                {MONTHS[payMonth - 1]} {payYear}
              </p>
            </div>
          </div>

          <div className="mb-5 border-b border-[#d0d0d0]" />

          {/* Employee Summary */}
          <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wide">
            Employee Summary
          </h3>

          <div className="mb-7 grid grid-cols-2 gap-x-6 gap-y-2">
            <InfoRow label="Employee Name">
              <span className="text-sm font-semibold">
                {employeeName || "—"}
              </span>
            </InfoRow>
            <InfoRow label="Employee ID">
              <span className="text-sm font-semibold">{empId || "—"}</span>
            </InfoRow>
            <InfoRow label="Designation">
              <span className="text-sm font-semibold">
                {designation || "—"}
              </span>
            </InfoRow>
            <InfoRow label="Pay Period">
              <span className="text-sm font-semibold">
                {MONTHS[payMonth - 1]} {payYear}
              </span>
            </InfoRow>
            <InfoRow label="Pay Date">
              <InlineInput
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="text-sm font-semibold"
                label="Payment date"
              />
            </InfoRow>
            <InfoRow label="Paid Days">
              <InlineInput
                type="number"
                value={paidDays}
                onChange={(e) => setPaidDays(Number(e.target.value))}
                min={0}
                max={31}
                className="w-16 text-sm font-semibold"
                label="Paid days"
              />
            </InfoRow>
            <InfoRow label="LOP Days">
              <InlineInput
                type="number"
                value={lopDays}
                onChange={(e) => setLopDays(Number(e.target.value))}
                min={0}
                max={31}
                className="w-16 text-sm font-semibold"
                label="LOP days"
              />
            </InfoRow>
          </div>

          {/* Earnings & Deductions */}
          <div className="mb-5 overflow-hidden rounded border border-[#d0d0d0]">
            <div className="flex">
              {/* Earnings */}
              <div className="flex-1">
                <div className="flex justify-between bg-[#f8f8f8] px-3 py-2">
                  <span className="text-[8px] font-bold uppercase tracking-wide text-muted-foreground">
                    Earnings
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-wide text-muted-foreground">
                    Amount
                  </span>
                </div>
                {earnings.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 border-b border-[#d0d0d0]/50 px-3 py-2"
                  >
                    <InlineInput
                      value={item.name}
                      onChange={(e) =>
                        updateEarning(index, "name", e.target.value)
                      }
                      placeholder="Component"
                      className="min-w-0 flex-1 text-sm"
                      label={`Earning ${index + 1} name`}
                    />
                    <InlineInput
                      type="number"
                      value={item.amount || ""}
                      onChange={(e) =>
                        updateEarning(
                          index,
                          "amount",
                          Number(e.target.value) || 0,
                        )
                      }
                      placeholder="0"
                      className="w-24 text-right text-sm"
                      label={`Earning ${index + 1} amount`}
                    />
                    {earnings.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeEarning(index)}
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                ))}
                <div className="px-3 py-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-muted-foreground"
                    onClick={addEarning}
                  >
                    <Plus className="size-3" /> Add
                  </Button>
                </div>
                <div className="flex justify-between bg-[#f8f8f8] px-3 py-2">
                  <span className="text-sm font-bold">Gross Earnings</span>
                  <span className="text-sm font-bold">
                    {fmt(grossEarnings)}
                  </span>
                </div>
              </div>

              <div className="w-px bg-[#d0d0d0]" />

              {/* Deductions */}
              <div className="flex-1">
                <div className="flex justify-between bg-[#f8f8f8] px-3 py-2">
                  <span className="text-[8px] font-bold uppercase tracking-wide text-muted-foreground">
                    Deductions
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-wide text-muted-foreground">
                    Amount
                  </span>
                </div>
                {deductions.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 border-b border-[#d0d0d0]/50 px-3 py-2"
                  >
                    <InlineInput
                      value={item.name}
                      onChange={(e) =>
                        updateDeduction(index, "name", e.target.value)
                      }
                      placeholder="Component"
                      className="min-w-0 flex-1 text-sm"
                      label={`Deduction ${index + 1} name`}
                    />
                    <InlineInput
                      type="number"
                      value={item.amount || ""}
                      onChange={(e) =>
                        updateDeduction(
                          index,
                          "amount",
                          Number(e.target.value) || 0,
                        )
                      }
                      placeholder="0"
                      className="w-24 text-right text-sm"
                      label={`Deduction ${index + 1} amount`}
                    />
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeDeduction(index)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                <div className="px-3 py-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-muted-foreground"
                    onClick={addDeduction}
                  >
                    <Plus className="size-3" /> Add
                  </Button>
                </div>
                <div className="flex justify-between bg-[#f8f8f8] px-3 py-2">
                  <span className="text-sm font-bold">Total Deductions</span>
                  <span className="text-sm font-bold">
                    {fmt(totalDeductions)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Net Payable */}
          <div className="mb-4 flex items-center justify-between rounded border border-[#d0d0d0] px-4 py-3">
            <div>
              <p className="text-sm font-bold uppercase">Total Net Payable</p>
              <p className="text-[8px] text-muted-foreground">
                Gross Earnings - Total Deductions
              </p>
            </div>
            <p className="text-base font-bold">{fmt(netPayable)}</p>
          </div>

          {/* Amount in words */}
          <div className="mb-5 flex justify-center gap-1 border-t border-[#d0d0d0]/50 pt-3">
            <span className="text-xs text-muted-foreground">
              Amount In Words :
            </span>
            <span className="text-xs font-semibold">{words}</span>
          </div>

          {/* Spacer */}
          <div className="mt-auto" />

          {/* Signatory */}
          <div className="mb-8 flex justify-end">
            <div className="w-52 text-center">
              <input
                ref={signatureInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleSignatureUpload}
              />
              {signatureImage ? (
                <div className="group relative mb-2 inline-block">
                  <img
                    src={signatureImage}
                    alt="Signature"
                    className="mx-auto max-h-14 max-w-32 cursor-pointer object-contain"
                    onClick={() => signatureInputRef.current?.click()}
                  />
                  <Button
                    variant="destructive"
                    size="icon-xs"
                    className="absolute -right-1 -top-1 hidden group-hover:inline-flex"
                    onClick={() => setSignatureImage("")}
                  >
                    <X />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="mb-2 border-dashed text-muted-foreground"
                  onClick={() => signatureInputRef.current?.click()}
                >
                  <ImageIcon className="size-4" /> Upload Signature
                </Button>
              )}
              <div className="border-t border-[#333] pt-2">
                <p className="text-xs font-bold">{CEO_NAME}</p>
                <p className="text-xs text-muted-foreground">CEO Skillion</p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#d0d0d0] pt-2 text-center text-[8px] text-muted-foreground">
            Page 1 / 1
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center">
      <span className="w-28 shrink-0 text-xs text-muted-foreground">
        {label}
      </span>
      <span className="mr-2 text-xs text-muted-foreground">:</span>
      {children}
    </div>
  );
}
