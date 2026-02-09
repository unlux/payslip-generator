"use client";

import type { PayComponent } from "@/types";
import { amountToWords } from "@/lib/amount-to-words";
import { getCurrencySymbol } from "@/lib/currencies";
import { Separator } from "@/components/ui/separator";

interface PayslipSummaryProps {
  earnings: PayComponent[];
  deductions: PayComponent[];
  currency: string;
}

export function PayslipSummary({
  earnings,
  deductions,
  currency,
}: PayslipSummaryProps) {
  const grossEarnings = earnings.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0,
  );
  const totalDeductions = deductions.reduce(
    (sum, d) => sum + (Number(d.amount) || 0),
    0,
  );
  const netPayable = grossEarnings - totalDeductions;
  const symbol = getCurrencySymbol(currency);

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <h3 className="text-sm font-semibold">Summary</h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Gross Earnings</span>
          <span>
            {symbol} {grossEarnings.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Total Deductions</span>
          <span>
            {symbol} {totalDeductions.toLocaleString("en-IN")}
          </span>
        </div>
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Net Payable</span>
          <span>
            {symbol} {netPayable.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {amountToWords(netPayable)}
      </p>
    </div>
  );
}
