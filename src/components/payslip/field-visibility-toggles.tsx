"use client";

import { useState } from "react";
import type { FieldVisibilitySettings } from "@/types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronRight } from "lucide-react";

interface FieldVisibilityTogglesProps {
  value: FieldVisibilitySettings;
  onChange: (value: FieldVisibilitySettings) => void;
}

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

export function FieldVisibilityToggles({
  value,
  onChange,
}: FieldVisibilityTogglesProps) {
  const [open, setOpen] = useState(false);

  const handleToggle = (field: keyof FieldVisibilitySettings) => {
    onChange({ ...value, [field]: !value[field] });
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="flex w-full items-center gap-2 text-sm font-semibold"
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <ChevronDown className="size-4" />
        ) : (
          <ChevronRight className="size-4" />
        )}
        Field Visibility
      </button>

      {open && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-2">
          {(
            Object.keys(FIELD_LABELS) as Array<keyof FieldVisibilitySettings>
          ).map((field) => (
            <div key={field} className="flex items-center gap-2">
              <Switch
                id={`vis-${field}`}
                checked={value[field]}
                onCheckedChange={() => handleToggle(field)}
                size="sm"
              />
              <Label
                htmlFor={`vis-${field}`}
                className="text-sm font-normal cursor-pointer"
              >
                {FIELD_LABELS[field]}
              </Label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
