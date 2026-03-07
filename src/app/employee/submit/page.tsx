"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useStdb } from "@/providers/spacetimedb-provider";
import {
  useEarningsTemplates,
  useDeductionsTemplates,
  useCompany,
  centsToAmount,
  amountToCents,
} from "@/hooks/use-db";
import { MONTHS, LIMITS } from "@/lib/constants";
import { getCurrencySymbol } from "@/lib/currencies";
import { amountToWords } from "@/lib/amount-to-words";
import type { PayComponent } from "@/types";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();

export default function SubmitPayslipPage() {
  const router = useRouter();
  const { conn } = useStdb();
  const company = useCompany();
  const earningsTemplates = useEarningsTemplates();
  const deductionsTemplates = useDeductionsTemplates();

  const symbol = company ? getCurrencySymbol(company.currency) : "";

  const [payMonth, setPayMonth] = useState(currentMonth);
  const [payYear, setPayYear] = useState(currentYear);
  const [paidDays, setPaidDays] = useState(30);
  const [lopDays, setLopDays] = useState(0);
  const [paymentDate, setPaymentDate] = useState("");
  const [initialized, setInitialized] = useState(false);

  const [earnings, setEarnings] = useState<PayComponent[]>([]);
  const [deductions, setDeductions] = useState<PayComponent[]>([]);

  if (
    !initialized &&
    (earningsTemplates.length > 0 || deductionsTemplates.length > 0)
  ) {
    setEarnings(
      earningsTemplates.map((t) => ({
        name: t.name,
        amount: centsToAmount(t.defaultAmount),
      })),
    );
    setDeductions(
      deductionsTemplates.map((t) => ({
        name: t.name,
        amount: centsToAmount(t.defaultAmount),
      })),
    );
    setInitialized(true);
  }

  const grossEarnings = useMemo(
    () => earnings.reduce((sum, e) => sum + (e.amount || 0), 0),
    [earnings],
  );

  const totalDeductions = useMemo(
    () => deductions.reduce((sum, d) => sum + (d.amount || 0), 0),
    [deductions],
  );

  const netPayable = grossEarnings - totalDeductions;
  const amountInWords = amountToWords(netPayable);

  function updateEarning(index: number, field: "name" | "amount", val: string) {
    const updated = [...earnings];
    updated[index] = {
      ...updated[index],
      [field]: field === "amount" ? parseFloat(val) || 0 : val,
    };
    setEarnings(updated);
  }

  function updateDeduction(
    index: number,
    field: "name" | "amount",
    val: string,
  ) {
    const updated = [...deductions];
    updated[index] = {
      ...updated[index],
      [field]: field === "amount" ? parseFloat(val) || 0 : val,
    };
    setDeductions(updated);
  }

  function addEarning() {
    if (earnings.length >= LIMITS.MAX_PAY_COMPONENTS) {
      toast.error(`Maximum ${LIMITS.MAX_PAY_COMPONENTS} earnings allowed`);
      return;
    }
    setEarnings([...earnings, { name: "", amount: 0 }]);
  }

  function addDeduction() {
    if (deductions.length >= LIMITS.MAX_PAY_COMPONENTS) {
      toast.error(`Maximum ${LIMITS.MAX_PAY_COMPONENTS} deductions allowed`);
      return;
    }
    setDeductions([...deductions, { name: "", amount: 0 }]);
  }

  function removeEarning(index: number) {
    setEarnings(earnings.filter((_, i) => i !== index));
  }

  function removeDeduction(index: number) {
    setDeductions(deductions.filter((_, i) => i !== index));
  }

  const handleSubmit = useCallback(() => {
    const validEarnings = earnings.filter((e) => e.name && e.amount >= 0);
    if (validEarnings.length === 0) {
      toast.error("Add at least one earning");
      return;
    }

    try {
      conn?.reducers.submitPayslip({
        payMonth,
        payYear,
        paidDays,
        lopDays,
        paymentDate,
        earningsJson: JSON.stringify(validEarnings),
        deductionsJson: JSON.stringify(
          deductions.filter((d) => d.name && d.amount >= 0),
        ),
        customFieldsJson: JSON.stringify([]),
        grossEarnings: amountToCents(grossEarnings),
        totalDeductions: amountToCents(totalDeductions),
        netPayable: amountToCents(netPayable),
        amountInWords,
      });
      toast.success("Payslip submitted");
      router.push("/employee");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit payslip");
    }
  }, [
    conn,
    payMonth,
    payYear,
    paidDays,
    lopDays,
    paymentDate,
    earnings,
    deductions,
    grossEarnings,
    totalDeductions,
    netPayable,
    amountInWords,
    router,
  ]);

  const years = useMemo(() => {
    const result = [];
    for (let y = currentYear - 2; y <= currentYear + 1; y++) {
      result.push(y);
    }
    return result;
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader title="Submit Payslip" />

      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pay Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              <div>
                <Label>Month</Label>
                <Select
                  value={String(payMonth)}
                  onValueChange={(v) => setPayMonth(Number(v))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={i} value={String(i + 1)}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Year</Label>
                <Select
                  value={String(payYear)}
                  onValueChange={(v) => setPayYear(Number(v))}
                >
                  <SelectTrigger className="mt-1">
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
              </div>
              <div>
                <Label htmlFor="paidDays">Paid Days</Label>
                <Input
                  id="paidDays"
                  type="number"
                  min={0}
                  max={31}
                  value={paidDays}
                  onChange={(e) => setPaidDays(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lopDays">LOP Days</Label>
                <Input
                  id="lopDays"
                  type="number"
                  min={0}
                  max={31}
                  value={lopDays}
                  onChange={(e) => setLopDays(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Earnings</CardTitle>
            <Button variant="outline" size="sm" onClick={addEarning}>
              <Plus className="mr-1 size-4" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {earnings.map((e, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1">
                  {i === 0 && <Label className="text-xs">Component</Label>}
                  <Input
                    value={e.name}
                    onChange={(ev) => updateEarning(i, "name", ev.target.value)}
                    placeholder="Component name"
                  />
                </div>
                <div className="w-36">
                  {i === 0 && (
                    <Label className="text-xs">Amount ({symbol})</Label>
                  )}
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={e.amount || ""}
                    onChange={(ev) =>
                      updateEarning(i, "amount", ev.target.value)
                    }
                    placeholder="0.00"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeEarning(i)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
            {earnings.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No earnings added. Click Add to start.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Deductions</CardTitle>
            <Button variant="outline" size="sm" onClick={addDeduction}>
              <Plus className="mr-1 size-4" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {deductions.map((d, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1">
                  {i === 0 && <Label className="text-xs">Component</Label>}
                  <Input
                    value={d.name}
                    onChange={(ev) =>
                      updateDeduction(i, "name", ev.target.value)
                    }
                    placeholder="Component name"
                  />
                </div>
                <div className="w-36">
                  {i === 0 && (
                    <Label className="text-xs">Amount ({symbol})</Label>
                  )}
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={d.amount || ""}
                    onChange={(ev) =>
                      updateDeduction(i, "amount", ev.target.value)
                    }
                    placeholder="0.00"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeDeduction(i)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
            {deductions.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No deductions added.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gross Earnings</span>
              <span className="font-medium">
                {symbol}
                {grossEarnings.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Deductions</span>
              <span className="font-medium">
                {symbol}
                {totalDeductions.toLocaleString()}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-semibold">Net Payable</span>
              <span className="font-semibold">
                {symbol}
                {netPayable.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground italic">
              {amountInWords}
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push("/employee")}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit Payslip</Button>
        </div>
      </div>
    </div>
  );
}
