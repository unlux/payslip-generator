"use client";

import { useState } from "react";
import { useEmployees } from "@/hooks/use-employees";
import { EmployeeCard } from "@/components/employee/employee-card";
import { EmployeeForm } from "@/components/employee/employee-form";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import type { EmployeeFormValues } from "@/lib/validators";

interface EmployeeListProps {
  companyId: string;
}

export function EmployeeList({ companyId }: EmployeeListProps) {
  const { getByCompany, addEmployee } = useEmployees();
  const [formOpen, setFormOpen] = useState(false);

  const employees = getByCompany(companyId);

  const handleCreate = (data: EmployeeFormValues) => {
    addEmployee(companyId, data);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Employees</h3>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          Add Employee
        </Button>
      </div>

      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <Users className="text-muted-foreground mb-3 size-10" />
          <p className="text-muted-foreground text-sm">No employees yet</p>
          <Button
            variant="link"
            size="sm"
            className="mt-1"
            onClick={() => setFormOpen(true)}
          >
            Add your first employee
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {employees.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} companyId={companyId} />
          ))}
        </div>
      )}

      <EmployeeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        companyId={companyId}
      />
    </div>
  );
}
