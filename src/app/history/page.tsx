"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Eye, Trash2 } from "lucide-react";
import { usePayslips } from "@/hooks/use-payslips";
import { useCompanies } from "@/hooks/use-companies";
import { useEmployees } from "@/hooks/use-employees";
import { getCurrencySymbol } from "@/lib/currencies";
import { MONTHS } from "@/lib/constants";
import type { PayslipRecord } from "@/types";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PayslipPreview = dynamic(
  () =>
    import("@/components/payslip/payslip-preview").then(
      (mod) => mod.PayslipPreview,
    ),
  { ssr: false },
);

const ALL_VALUE = "__all__";

export default function HistoryPage() {
  const { payslips, deletePayslip } = usePayslips();
  const { companies, getCompanyById } = useCompanies();
  const { employees, getEmployeeById, getByCompany } = useEmployees();

  const [companyFilter, setCompanyFilter] = useState<string>(ALL_VALUE);
  const [employeeFilter, setEmployeeFilter] = useState<string>(ALL_VALUE);
  const [yearFilter, setYearFilter] = useState<string>(ALL_VALUE);
  const [viewingPayslip, setViewingPayslip] = useState<PayslipRecord | null>(
    null,
  );

  const filteredEmployees = useMemo(() => {
    if (companyFilter === ALL_VALUE) return employees;
    return getByCompany(companyFilter);
  }, [companyFilter, employees, getByCompany]);

  const years = useMemo(() => {
    const set = new Set(payslips.map((p) => p.payPeriod.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [payslips]);

  const filtered = useMemo(() => {
    return payslips.filter((p) => {
      if (companyFilter !== ALL_VALUE && p.companyId !== companyFilter)
        return false;
      if (employeeFilter !== ALL_VALUE && p.employeeId !== employeeFilter)
        return false;
      if (yearFilter !== ALL_VALUE && p.payPeriod.year !== Number(yearFilter))
        return false;
      return true;
    });
  }, [payslips, companyFilter, employeeFilter, yearFilter]);

  function handleCompanyFilterChange(value: string) {
    setCompanyFilter(value);
    setEmployeeFilter(ALL_VALUE);
  }

  const viewingCompany = viewingPayslip
    ? getCompanyById(viewingPayslip.companyId)
    : undefined;
  const viewingEmployee = viewingPayslip
    ? getEmployeeById(viewingPayslip.employeeId)
    : undefined;

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="History"
        description="View and manage generated payslips"
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Select value={companyFilter} onValueChange={handleCompanyFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Companies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All Companies</SelectItem>
            {companies.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Employees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All Employees</SelectItem>
            {filteredEmployees.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All Years</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            No payslips found
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {payslips.length === 0
              ? "Generate your first payslip to see it here."
              : "Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Pay Period</TableHead>
              <TableHead className="text-right">Net Payable</TableHead>
              <TableHead>Generated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((payslip) => {
              const company = getCompanyById(payslip.companyId);
              const employee = getEmployeeById(payslip.employeeId);
              const symbol = company ? getCurrencySymbol(company.currency) : "";
              return (
                <TableRow key={payslip.id}>
                  <TableCell>{company?.name ?? "Unknown"}</TableCell>
                  <TableCell>{employee?.name ?? "Unknown"}</TableCell>
                  <TableCell>
                    {MONTHS[payslip.payPeriod.month - 1]}{" "}
                    {payslip.payPeriod.year}
                  </TableCell>
                  <TableCell className="text-right">
                    {symbol}
                    {payslip.netPayable.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(payslip.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewingPayslip(payslip)}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deletePayslip(payslip.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <Dialog
        open={!!viewingPayslip}
        onOpenChange={(open) => !open && setViewingPayslip(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payslip Preview</DialogTitle>
          </DialogHeader>
          {viewingPayslip && viewingCompany && viewingEmployee && (
            <PayslipPreview
              company={viewingCompany}
              employee={viewingEmployee}
              payPeriod={viewingPayslip.payPeriod}
              paidDays={viewingPayslip.paidDays}
              lopDays={viewingPayslip.lopDays}
              paymentDate={viewingPayslip.paymentDate}
              earnings={viewingPayslip.earnings}
              deductions={viewingPayslip.deductions}
              customFields={viewingPayslip.customFields}
              grossEarnings={viewingPayslip.grossEarnings}
              totalDeductions={viewingPayslip.totalDeductions}
              netPayable={viewingPayslip.netPayable}
              amountInWords={viewingPayslip.amountInWords}
              fieldVisibility={viewingPayslip.fieldVisibility}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
