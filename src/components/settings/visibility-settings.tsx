"use client";

import { useState } from "react";
import { useCompanies } from "@/hooks/use-companies";
import type { FieldVisibilitySettings } from "@/types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const VISIBILITY_LABELS: Record<keyof FieldVisibilitySettings, string> = {
  companyAddress: "Company Address",
  companyCity: "Company City",
  companyPincode: "Company Pincode",
  companyLogo: "Company Logo",
  employeeId: "Employee ID",
  uan: "UAN",
  pan: "PAN",
  bankAccountNumber: "Bank Account Number",
  designation: "Designation",
  paidDays: "Paid Days",
  lopDays: "LOP Days",
  paymentDate: "Payment Date",
  payPeriod: "Pay Period",
  customFields: "Custom Fields",
};

export function VisibilitySettings() {
  const { companies, updateCompany } = useCompanies();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  const company = companies.find((c) => c.id === selectedCompanyId);

  function toggleField(field: keyof FieldVisibilitySettings) {
    if (!company) return;
    updateCompany(company.id, {
      fieldVisibility: {
        ...company.fieldVisibility,
        [field]: !company.fieldVisibility[field],
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="max-w-xs">
        <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a company" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedCompanyId && (
        <p className="text-sm text-muted-foreground">
          Select a company to manage its default field visibility.
        </p>
      )}

      {company && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Field Visibility for {company.name}
            </CardTitle>
            <CardDescription>
              Toggle which fields are visible by default on generated payslips.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                Object.entries(VISIBILITY_LABELS) as [
                  keyof FieldVisibilitySettings,
                  string,
                ][]
              ).map(([field, label]) => (
                <div key={field} className="flex items-center justify-between">
                  <Label htmlFor={field} className="cursor-pointer">
                    {label}
                  </Label>
                  <Switch
                    id={field}
                    checked={company.fieldVisibility[field]}
                    onCheckedChange={() => toggleField(field)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
