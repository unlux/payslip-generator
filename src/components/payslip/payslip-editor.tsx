/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { useCompanies } from "@/hooks/use-companies";
import { useEmployees } from "@/hooks/use-employees";
import { usePayslips } from "@/hooks/use-payslips";
import { DEFAULT_FIELD_VISIBILITY, LIMITS, MONTHS } from "@/lib/constants";
import { getCurrencySymbol } from "@/lib/currencies";
import { amountToWords } from "@/lib/amount-to-words";
import type {
  Company,
  CustomField,
  Employee,
  FieldVisibilitySettings,
  PayComponent,
} from "@/types";
import {
  PayslipDocument,
  type PayslipDocumentProps,
} from "@/components/pdf/payslip-document";
import { InlineInput } from "./inline-input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, ImageIcon, Plus, Settings, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { SKILLION_LOGO } from "@/lib/default-logo";

const FIELD_LABELS: Record<keyof FieldVisibilitySettings, string> = {
  companyAddress: "Company Address",
  companyCity: "Company City",
  companyPincode: "Company Pincode",
  companyLogo: "Company Logo",
  employeeId: "Employee ID",
  uan: "UAN",
  pan: "PAN",
  bankAccountNumber: "Bank Account No.",
  designation: "Designation",
  paidDays: "Paid Days",
  lopDays: "LOP Days",
  paymentDate: "Payment Date",
  payPeriod: "Pay Period",
  customFields: "Custom Fields",
};

export function PayslipEditor() {
  const { companies, getCompanyById } = useCompanies();
  const { getByCompany } = useEmployees();
  const { addPayslip } = usePayslips();

  const now = new Date();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [companyId, setCompanyId] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  const [companyName, setCompanyName] = useState("Skillion");
  const [companyAddress, setCompanyAddress] = useState("E North St, 18018");
  const [companyCity, setCompanyCity] = useState("Bethlehem");
  const [companyPincode, setCompanyPincode] = useState("");
  const [companyLogo, setCompanyLogo] = useState(SKILLION_LOGO);
  const [currency, setCurrency] = useState("USD");

  const [employeeName, setEmployeeName] = useState("Lakshay Choudhary");
  const [empId, setEmpId] = useState("");
  const [designation, setDesignation] = useState("Web Developer");
  const [uan, setUan] = useState("");
  const [pan, setPan] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  const [payMonth, setPayMonth] = useState(now.getMonth() + 1);
  const [payYear, setPayYear] = useState(now.getFullYear());
  const [paymentDate, setPaymentDate] = useState("");
  const [paidDays, setPaidDays] = useState(30);
  const [lopDays, setLopDays] = useState(0);
  const [signedBy, setSignedBy] = useState("");
  const [signatureImage, setSignatureImage] = useState("");
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const [earnings, setEarnings] = useState<PayComponent[]>([
    { name: "", amount: 0 },
  ]);
  const [deductions, setDeductions] = useState<PayComponent[]>([]);

  const [fieldVisibility, setFieldVisibility] =
    useState<FieldVisibilitySettings>({ ...DEFAULT_FIELD_VISIBILITY });

  const [downloading, setDownloading] = useState(false);

  const companyEmployees = useMemo(
    () => (companyId ? getByCompany(companyId) : []),
    [companyId, getByCompany],
  );

  const currencySymbol = getCurrencySymbol(currency);

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

  const years = useMemo(() => {
    const result: number[] = [];
    for (let y = 2020; y <= 2030; y++) result.push(y);
    return result;
  }, []);

  const formatAmountNoSpace = (amount: number) =>
    `${currencySymbol}${amount.toLocaleString("en-IN")}`;

  // --- Handlers ---

  const handleCompanyChange = useCallback(
    (id: string) => {
      setCompanyId(id);
      setEmployeeId("");
      const company = getCompanyById(id);
      if (!company) return;
      setCompanyName(company.name);
      setCompanyAddress(company.address);
      setCompanyCity(company.city);
      setCompanyPincode(company.pincode);
      setCompanyLogo(company.logo);
      setCurrency(company.currency);
      setFieldVisibility({ ...company.fieldVisibility });
      if (company.earningsTemplate.length > 0) {
        setEarnings(company.earningsTemplate.map((e) => ({ ...e })));
      } else {
        setEarnings([{ name: "", amount: 0 }]);
      }
      if (company.deductionsTemplate.length > 0) {
        setDeductions(company.deductionsTemplate.map((d) => ({ ...d })));
      } else {
        setDeductions([]);
      }
    },
    [getCompanyById],
  );

  const handleEmployeeChange = useCallback(
    (id: string) => {
      setEmployeeId(id);
      const employee = companyEmployees.find((e) => e.id === id);
      if (!employee) return;
      setEmployeeName(employee.name);
      setEmpId(employee.employeeId);
      setDesignation(employee.designation);
      setUan(employee.uan);
      setPan(employee.pan);
      setBankAccount(employee.bankAccountNumber);
      setCustomFields(employee.customFields?.map((f) => ({ ...f })) ?? []);
    },
    [companyEmployees],
  );

  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const img = new Image();
      img.onload = () => {
        const maxSize = LIMITS.LOGO_MAX_SIZE;
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const scale = maxSize / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        setCompanyLogo(canvas.toDataURL("image/png"));
      };
      img.src = URL.createObjectURL(file);
      e.target.value = "";
    },
    [],
  );

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
    if (earnings.length >= LIMITS.MAX_PAY_COMPONENTS) return;
    setEarnings((prev) => [...prev, { name: "", amount: 0 }]);
  }, [earnings.length]);

  const addDeduction = useCallback(() => {
    if (deductions.length >= LIMITS.MAX_PAY_COMPONENTS) return;
    setDeductions((prev) => [...prev, { name: "", amount: 0 }]);
  }, [deductions.length]);

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

  const toggleVisibility = useCallback(
    (field: keyof FieldVisibilitySettings) => {
      setFieldVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
    },
    [],
  );

  const buildProps = useCallback((): PayslipDocumentProps => {
    const company: Company = {
      id: companyId,
      name: companyName,
      address: companyAddress,
      city: companyCity,
      pincode: companyPincode,
      logo: companyLogo,
      currency,
      fieldVisibility,
      earningsTemplate: [],
      deductionsTemplate: [],
      createdAt: "",
      updatedAt: "",
    };
    const employee: Employee = {
      id: employeeId,
      companyId,
      name: employeeName,
      employeeId: empId,
      designation,
      uan,
      pan,
      bankAccountNumber: bankAccount,
      customFields,
      createdAt: "",
      updatedAt: "",
    };
    return {
      company,
      employee,
      payPeriod: { month: payMonth, year: payYear },
      paidDays,
      lopDays,
      paymentDate,
      earnings: earnings.filter((e) => e.name && e.amount >= 0),
      deductions: deductions.filter((d) => d.name && d.amount >= 0),
      customFields,
      grossEarnings,
      totalDeductions,
      netPayable,
      amountInWords: words,
      fieldVisibility,
      signedBy: signedBy || undefined,
      signatureImage: signatureImage || undefined,
    };
  }, [
    companyId,
    companyName,
    companyAddress,
    companyCity,
    companyPincode,
    companyLogo,
    currency,
    employeeId,
    employeeName,
    empId,
    designation,
    uan,
    pan,
    bankAccount,
    customFields,
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
    fieldVisibility,
    signedBy,
    signatureImage,
  ]);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const props = buildProps();

      addPayslip({
        companyId: props.company.id,
        employeeId: props.employee.id,
        payPeriod: props.payPeriod,
        paidDays: props.paidDays,
        lopDays: props.lopDays,
        paymentDate: props.paymentDate,
        earnings: props.earnings,
        deductions: props.deductions,
        customFields: props.customFields,
        grossEarnings: props.grossEarnings,
        totalDeductions: props.totalDeductions,
        netPayable: props.netPayable,
        amountInWords: props.amountInWords,
        fieldVisibility: props.fieldVisibility,
      });

      const blob = await pdf(<PayslipDocument {...props} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const month = MONTHS[payMonth - 1];
      link.href = url;
      link.download = `${companyName || "Company"}_${employeeName || "Employee"}_${month}_${payYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Payslip downloaded and saved to history");
    } catch {
      toast.error("Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  }, [buildProps, addPayslip, payMonth, payYear, companyName, employeeName]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="mx-auto flex max-w-[210mm] flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
        <Select value={companyId} onValueChange={handleCompanyChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select company" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={employeeId}
          onValueChange={handleEmployeeChange}
          disabled={!companyId}
        >
          <SelectTrigger className="w-48">
            <SelectValue
              placeholder={
                companyId ? "Select employee" : "Select company first"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {companyEmployees.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
                {e.employeeId && ` (${e.employeeId})`}
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

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="size-4" />
              Visibility
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="end">
            <div className="space-y-3">
              <p className="text-sm font-medium">Field Visibility</p>
              {(
                Object.keys(FIELD_LABELS) as Array<
                  keyof FieldVisibilitySettings
                >
              ).map((field) => (
                <div key={field} className="flex items-center gap-2">
                  <Switch
                    id={`vis-${field}`}
                    checked={fieldVisibility[field]}
                    onCheckedChange={() => toggleVisibility(field)}
                  />
                  <Label
                    htmlFor={`vis-${field}`}
                    className="cursor-pointer text-sm font-normal"
                  >
                    {FIELD_LABELS[field]}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Button onClick={handleDownload} disabled={downloading}>
          <Download className="size-4" />
          {downloading ? "Generating..." : "Download PDF"}
        </Button>
      </div>

      {/* A4 Page */}
      <div className="mx-auto max-w-[210mm] bg-white shadow-lg">
        <div className="flex min-h-[297mm] flex-col px-[40px] py-[40px] text-[#333]">
          {/* Header: Logo + Name left, Pay Period right */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              {fieldVisibility.companyLogo && (
                <div className="shrink-0">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  {companyLogo ? (
                    <div className="group relative">
                      <img
                        src={companyLogo}
                        alt="Logo"
                        className="max-h-10 max-w-14 cursor-pointer object-contain"
                        onClick={() => logoInputRef.current?.click()}
                      />
                      <Button
                        variant="destructive"
                        size="icon-xs"
                        className="absolute -right-1 -top-1 hidden group-hover:inline-flex"
                        onClick={() => setCompanyLogo("")}
                      >
                        <X />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="h-10 w-14 border-dashed text-muted-foreground"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      <ImageIcon className="size-4" />
                    </Button>
                  )}
                </div>
              )}
              <div>
                <InlineInput
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company Name"
                  className="text-lg font-bold"
                  label="Company name"
                />
                {(fieldVisibility.companyAddress ||
                  fieldVisibility.companyCity ||
                  fieldVisibility.companyPincode) && (
                  <div className="flex items-center gap-1">
                    {fieldVisibility.companyAddress && (
                      <InlineInput
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        placeholder="Address"
                        className="w-40 text-xs text-muted-foreground"
                        label="Company address"
                      />
                    )}
                    {fieldVisibility.companyCity && (
                      <InlineInput
                        value={companyCity}
                        onChange={(e) => setCompanyCity(e.target.value)}
                        placeholder="City"
                        className="w-28 text-xs text-muted-foreground"
                        label="City"
                      />
                    )}
                    {fieldVisibility.companyPincode && (
                      <InlineInput
                        value={companyPincode}
                        onChange={(e) => setCompanyPincode(e.target.value)}
                        placeholder="Pincode"
                        className="w-20 text-xs text-muted-foreground"
                        label="Pincode"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
            {fieldVisibility.payPeriod && (
              <div className="text-right">
                <p className="text-xs italic text-muted-foreground">
                  Payslip For the Month
                </p>
                <p className="text-sm font-bold">
                  {MONTHS[payMonth - 1]} {payYear}
                </p>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="mb-5 border-b border-[#d0d0d0]" />

          {/* Employee Summary heading */}
          <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wide">
            Employee Summary
          </h3>

          {/* Employee Details — 2-col grid */}
          <div className="mb-7 grid grid-cols-2 gap-x-6 gap-y-2">
            <InfoRow label="Employee Name">
              <InlineInput
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Name"
                className="flex-1 text-sm font-semibold"
                label="Employee name"
              />
            </InfoRow>
            {fieldVisibility.employeeId && (
              <InfoRow label="Employee ID">
                <InlineInput
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  placeholder="ID"
                  className="flex-1 text-sm font-semibold"
                  label="Employee ID"
                />
              </InfoRow>
            )}
            {fieldVisibility.designation && (
              <InfoRow label="Designation">
                <InlineInput
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="Designation"
                  className="flex-1 text-sm font-semibold"
                  label="Designation"
                />
              </InfoRow>
            )}
            {fieldVisibility.payPeriod && (
              <InfoRow label="Pay Period">
                <span className="text-sm font-semibold">
                  {MONTHS[payMonth - 1]} {payYear}
                </span>
              </InfoRow>
            )}
            {fieldVisibility.paymentDate && (
              <InfoRow label="Pay Date">
                <InlineInput
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="text-sm font-semibold"
                  label="Payment date"
                />
              </InfoRow>
            )}
            {fieldVisibility.paidDays && (
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
            )}
            {fieldVisibility.lopDays && (
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
            )}
            {fieldVisibility.customFields &&
              customFields.map((field, i) => (
                <InfoRow key={i} label={field.key}>
                  <span className="text-sm font-semibold">{field.value}</span>
                </InfoRow>
              ))}
          </div>

          {/* Side-by-side Earnings & Deductions — bordered */}
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
                    {formatAmountNoSpace(grossEarnings)}
                  </span>
                </div>
              </div>

              {/* Divider */}
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
                    {formatAmountNoSpace(totalDeductions)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Net Payable box */}
          <div className="mb-4 flex items-center justify-between rounded border border-[#d0d0d0] px-4 py-3">
            <div>
              <p className="text-sm font-bold uppercase">Total Net Payable</p>
              <p className="text-[8px] text-muted-foreground">
                Gross Earnings - Total Deductions
              </p>
            </div>
            <p className="text-base font-bold">
              {formatAmountNoSpace(netPayable)}
            </p>
          </div>

          {/* Amount in words */}
          <div className="mb-5 flex justify-center gap-1 border-t border-[#d0d0d0]/50 pt-3">
            <span className="text-xs text-muted-foreground">
              Amount In Words :
            </span>
            <span className="text-xs font-semibold">{words}</span>
          </div>

          {/* Spacer + Signature anchored at bottom */}
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
                <InlineInput
                  value={signedBy}
                  onChange={(e) => setSignedBy(e.target.value)}
                  placeholder="Name"
                  className="w-full text-center text-xs font-bold"
                  label="Signatory name"
                />
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
