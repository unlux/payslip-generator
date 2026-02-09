"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEmployees } from "@/hooks/use-employees";
import { usePayslips } from "@/hooks/use-payslips";
import { useCompanies } from "@/hooks/use-companies";
import { EmployeeForm } from "@/components/employee/employee-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrencySymbol } from "@/lib/currencies";
import { MONTHS } from "@/lib/constants";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import type { EmployeeFormValues } from "@/lib/validators";

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string; empId: string }>();
  const router = useRouter();
  const { getEmployeeById, updateEmployee, deleteEmployee } = useEmployees();
  const { getByEmployee } = usePayslips();
  const { getCompanyById } = useCompanies();

  const [editOpen, setEditOpen] = useState(false);

  const companyId = params.id;
  const employeeId = params.empId;

  const employee = getEmployeeById(employeeId);
  const company = getCompanyById(companyId);
  const payslips = getByEmployee(employeeId);

  if (!employee || !company) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Employee not found.</p>
        <Button variant="link" asChild className="mt-2">
          <Link href={`/company/${companyId}`}>Back to company</Link>
        </Button>
      </div>
    );
  }

  const handleEdit = (data: EmployeeFormValues) => {
    updateEmployee(employee.id, data);
  };

  const handleDelete = () => {
    deleteEmployee(employee.id);
    router.push(`/company/${companyId}`);
  };

  const currencySymbol = getCurrencySymbol(company.currency);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="text-muted-foreground flex items-center gap-1 text-sm">
        <Link href="/" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <Link
          href={`/company/${companyId}`}
          className="hover:text-foreground transition-colors"
        >
          {company.name}
        </Link>
        <span>/</span>
        <span className="text-foreground">{employee.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/company/${companyId}`}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{employee.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              {employee.employeeId && (
                <Badge variant="secondary">{employee.employeeId}</Badge>
              )}
              {employee.designation && (
                <span className="text-muted-foreground text-sm">
                  {employee.designation}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>

      <Separator />

      {/* Employee Info */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2">
            {employee.uan && (
              <div>
                <dt className="text-muted-foreground text-sm">UAN</dt>
                <dd className="font-medium">{employee.uan}</dd>
              </div>
            )}
            {employee.pan && (
              <div>
                <dt className="text-muted-foreground text-sm">PAN</dt>
                <dd className="font-medium">{employee.pan}</dd>
              </div>
            )}
            {employee.bankAccountNumber && (
              <div>
                <dt className="text-muted-foreground text-sm">
                  Bank Account Number
                </dt>
                <dd className="font-medium">{employee.bankAccountNumber}</dd>
              </div>
            )}
            {employee.designation && (
              <div>
                <dt className="text-muted-foreground text-sm">Designation</dt>
                <dd className="font-medium">{employee.designation}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Custom Fields */}
      {employee.customFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Custom Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employee.customFields.map((field, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{field.key}</TableCell>
                    <TableCell>{field.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Payslip History */}
      <Card>
        <CardHeader>
          <CardTitle>Payslip History</CardTitle>
        </CardHeader>
        <CardContent>
          {payslips.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No payslips generated yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pay Period</TableHead>
                  <TableHead>Gross Earnings</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Payable</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslips.map((slip) => (
                  <TableRow key={slip.id}>
                    <TableCell>
                      {MONTHS[slip.payPeriod.month - 1]} {slip.payPeriod.year}
                    </TableCell>
                    <TableCell>
                      {currencySymbol}
                      {slip.grossEarnings.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {currencySymbol}
                      {slip.totalDeductions.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {currencySymbol}
                      {slip.netPayable.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(slip.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <EmployeeForm
        open={editOpen}
        onOpenChange={setEditOpen}
        employee={employee}
        onSubmit={handleEdit}
        companyId={companyId}
      />
    </div>
  );
}
