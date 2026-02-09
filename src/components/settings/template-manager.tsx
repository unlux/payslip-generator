"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useCompanies } from "@/hooks/use-companies";
import { LIMITS } from "@/lib/constants";
import { getCurrencySymbol } from "@/lib/currencies";
import type { PayComponent } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function TemplateManager() {
  const { companies, updateCompany } = useCompanies();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  const company = companies.find((c) => c.id === selectedCompanyId);
  const currencySymbol = company ? getCurrencySymbol(company.currency) : "";

  function updateEarnings(earnings: PayComponent[]) {
    if (!selectedCompanyId) return;
    updateCompany(selectedCompanyId, { earningsTemplate: earnings });
  }

  function updateDeductions(deductions: PayComponent[]) {
    if (!selectedCompanyId) return;
    updateCompany(selectedCompanyId, { deductionsTemplate: deductions });
  }

  function addRow(type: "earnings" | "deductions") {
    if (!company) return;
    const current =
      type === "earnings"
        ? company.earningsTemplate
        : company.deductionsTemplate;
    if (current.length >= LIMITS.MAX_PAY_COMPONENTS) return;
    const updated = [...current, { name: "", amount: 0 }];
    if (type === "earnings") updateEarnings(updated);
    else updateDeductions(updated);
  }

  function removeRow(type: "earnings" | "deductions", index: number) {
    if (!company) return;
    const current =
      type === "earnings"
        ? company.earningsTemplate
        : company.deductionsTemplate;
    const updated = current.filter((_, i) => i !== index);
    if (type === "earnings") updateEarnings(updated);
    else updateDeductions(updated);
  }

  function updateRow(
    type: "earnings" | "deductions",
    index: number,
    field: "name" | "amount",
    value: string | number,
  ) {
    if (!company) return;
    const current =
      type === "earnings"
        ? [...company.earningsTemplate]
        : [...company.deductionsTemplate];
    current[index] = { ...current[index], [field]: value };
    if (type === "earnings") updateEarnings(current);
    else updateDeductions(current);
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
          Select a company to manage its pay component templates.
        </p>
      )}

      {company && (
        <div className="grid gap-6 md:grid-cols-2">
          <TemplateSection
            title="Earnings Template"
            description="Default earnings components for payslip generation"
            items={company.earningsTemplate}
            currencySymbol={currencySymbol}
            onAdd={() => addRow("earnings")}
            onRemove={(i) => removeRow("earnings", i)}
            onUpdate={(i, field, val) => updateRow("earnings", i, field, val)}
            maxItems={LIMITS.MAX_PAY_COMPONENTS}
          />
          <TemplateSection
            title="Deductions Template"
            description="Default deduction components for payslip generation"
            items={company.deductionsTemplate}
            currencySymbol={currencySymbol}
            onAdd={() => addRow("deductions")}
            onRemove={(i) => removeRow("deductions", i)}
            onUpdate={(i, field, val) => updateRow("deductions", i, field, val)}
            maxItems={LIMITS.MAX_PAY_COMPONENTS}
          />
        </div>
      )}
    </div>
  );
}

function TemplateSection({
  title,
  description,
  items,
  currencySymbol,
  onAdd,
  onRemove,
  onUpdate,
  maxItems,
}: {
  title: string;
  description: string;
  items: PayComponent[];
  currencySymbol: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (
    index: number,
    field: "name" | "amount",
    value: string | number,
  ) => void;
  maxItems: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No components added yet.
          </p>
        )}
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              placeholder="Component name"
              value={item.name}
              onChange={(e) => onUpdate(index, "name", e.target.value)}
              className="flex-1"
            />
            <div className="relative w-32">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {currencySymbol}
              </span>
              <Input
                type="number"
                min={0}
                value={item.amount || ""}
                onChange={(e) =>
                  onUpdate(
                    index,
                    "amount",
                    e.target.value ? Number(e.target.value) : 0,
                  )
                }
                className="pl-8"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(index)}
              className="shrink-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={onAdd}
          disabled={items.length >= maxItems}
          className="w-full"
        >
          <Plus className="mr-1 size-4" />
          Add Component
          {items.length >= maxItems && " (limit reached)"}
        </Button>
      </CardContent>
    </Card>
  );
}
