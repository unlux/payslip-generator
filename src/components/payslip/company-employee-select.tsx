"use client";

import type { Company, Employee } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CompanyEmployeeSelectProps {
  companyId: string;
  employeeId: string;
  onCompanyChange: (companyId: string) => void;
  onEmployeeChange: (employeeId: string) => void;
  companies: Company[];
  employees: Employee[];
}

export function CompanyEmployeeSelect({
  companyId,
  employeeId,
  onCompanyChange,
  onEmployeeChange,
  companies,
  employees,
}: CompanyEmployeeSelectProps) {
  const filteredEmployees = employees.filter((e) => e.companyId === companyId);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Company</Label>
        <Select value={companyId} onValueChange={onCompanyChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a company" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Employee</Label>
        <Select
          value={employeeId}
          onValueChange={onEmployeeChange}
          disabled={!companyId}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                companyId ? "Select an employee" : "Select a company first"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {filteredEmployees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name}
                {employee.employeeId && ` (${employee.employeeId})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
