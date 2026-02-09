"use client";

import { useCallback, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { payslipFormSchema, type PayslipFormValues } from "@/lib/validators";
import { DEFAULT_FIELD_VISIBILITY } from "@/lib/constants";
import { amountToWords } from "@/lib/amount-to-words";
import { useCompanies } from "@/hooks/use-companies";
import { useEmployees } from "@/hooks/use-employees";
import { usePayslips } from "@/hooks/use-payslips";
import type { FieldVisibilitySettings } from "@/types";
import type { PayslipDocumentProps } from "@/components/pdf/payslip-document";
import { CompanyEmployeeSelect } from "./company-employee-select";
import { PayPeriodPicker } from "./pay-period-picker";
import { PayComponentsEditor } from "./pay-components-editor";
import { FieldVisibilityToggles } from "./field-visibility-toggles";
import { PayslipSummary } from "./payslip-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye } from "lucide-react";

interface PayslipFormProps {
  onPreview: (data: PayslipDocumentProps) => void;
}

export function PayslipForm({ onPreview }: PayslipFormProps) {
  const { companies, getCompanyById } = useCompanies();
  const { getByCompany } = useEmployees();
  const { addPayslip } = usePayslips();

  const now = new Date();
  const form = useForm({
    resolver: zodResolver(payslipFormSchema),
    defaultValues: {
      companyId: "",
      employeeId: "",
      payPeriod: { month: now.getMonth() + 1, year: now.getFullYear() },
      paidDays: 30,
      lopDays: 0,
      paymentDate: "",
      earnings: [{ name: "", amount: 0 }],
      deductions: [],
    },
  });

  const [fieldVisibility, setFieldVisibility] =
    useState<FieldVisibilitySettings>({ ...DEFAULT_FIELD_VISIBILITY });

  const companyId = useWatch({ control: form.control, name: "companyId" });
  const employeeId = useWatch({ control: form.control, name: "employeeId" });
  const watchedEarnings = useWatch({ control: form.control, name: "earnings" });
  const watchedDeductions = useWatch({
    control: form.control,
    name: "deductions",
  });

  const selectedCompany = useMemo(
    () => (companyId ? getCompanyById(companyId) : undefined),
    [companyId, getCompanyById],
  );

  const companyEmployees = useMemo(
    () => (companyId ? getByCompany(companyId) : []),
    [companyId, getByCompany],
  );

  const selectedEmployee = useMemo(
    () => companyEmployees.find((e) => e.id === employeeId),
    [companyEmployees, employeeId],
  );

  const handleCompanyChange = useCallback(
    (id: string) => {
      form.setValue("companyId", id);
      form.setValue("employeeId", "");

      const company = getCompanyById(id);
      if (!company) return;

      if (company.earningsTemplate && company.earningsTemplate.length > 0) {
        form.setValue("earnings", company.earningsTemplate);
      } else {
        form.setValue("earnings", [{ name: "", amount: 0 }]);
      }

      if (company.deductionsTemplate && company.deductionsTemplate.length > 0) {
        form.setValue("deductions", company.deductionsTemplate);
      } else {
        form.setValue("deductions", []);
      }

      setFieldVisibility({ ...company.fieldVisibility });
    },
    [form, getCompanyById],
  );

  const handleSubmit = (data: Record<string, unknown>) => {
    const values = data as PayslipFormValues;
    if (!selectedCompany || !selectedEmployee) return;

    const earnings = values.earnings.filter((e) => e.name && e.amount >= 0);
    const deductions = (values.deductions ?? []).filter(
      (d) => d.name && d.amount >= 0,
    );
    const grossEarnings = earnings.reduce((s, e) => s + e.amount, 0);
    const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0);
    const netPayable = grossEarnings - totalDeductions;
    const words = amountToWords(netPayable);
    const customFields = selectedEmployee.customFields ?? [];
    const paymentDate = values.paymentDate ?? "";

    addPayslip({
      companyId: values.companyId,
      employeeId: values.employeeId,
      payPeriod: values.payPeriod,
      paidDays: values.paidDays,
      lopDays: values.lopDays,
      paymentDate,
      earnings,
      deductions,
      customFields,
      grossEarnings,
      totalDeductions,
      netPayable,
      amountInWords: words,
      fieldVisibility,
    });

    onPreview({
      company: selectedCompany,
      employee: selectedEmployee,
      payPeriod: values.payPeriod,
      paidDays: values.paidDays,
      lopDays: values.lopDays,
      paymentDate,
      earnings,
      deductions,
      customFields,
      grossEarnings,
      totalDeductions,
      netPayable,
      amountInWords: words,
      fieldVisibility,
    });
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company & Employee</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyEmployeeSelect
            companyId={companyId}
            employeeId={employeeId}
            onCompanyChange={handleCompanyChange}
            onEmployeeChange={(id) => form.setValue("employeeId", id)}
            companies={companies}
            employees={companyEmployees}
          />
          {form.formState.errors.companyId && (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.companyId.message}
            </p>
          )}
          {form.formState.errors.employeeId && (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.employeeId.message}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pay Period & Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PayPeriodPicker
            value={form.getValues("payPeriod")}
            onChange={(v) => form.setValue("payPeriod", v)}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="paidDays">Paid Days</Label>
              <Input
                id="paidDays"
                type="number"
                min={0}
                max={31}
                {...form.register("paidDays", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lopDays">LOP Days</Label>
              <Input
                id="lopDays"
                type="number"
                min={0}
                max={31}
                {...form.register("lopDays", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                {...form.register("paymentDate")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Earnings & Deductions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <PayComponentsEditor
            control={form.control}
            name="earnings"
            label="Earnings"
          />
          <Separator />
          <PayComponentsEditor
            control={form.control}
            name="deductions"
            label="Deductions"
          />
          {form.formState.errors.earnings && (
            <p className="text-sm text-destructive">
              {form.formState.errors.earnings.message ??
                form.formState.errors.earnings.root?.message}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Options</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldVisibilityToggles
            value={fieldVisibility}
            onChange={setFieldVisibility}
          />
        </CardContent>
      </Card>

      <PayslipSummary
        earnings={watchedEarnings ?? []}
        deductions={watchedDeductions ?? []}
        currency={selectedCompany?.currency ?? "INR"}
      />

      <Button type="submit" className="w-full" size="lg">
        <Eye className="size-4" />
        Preview Payslip
      </Button>
    </form>
  );
}
