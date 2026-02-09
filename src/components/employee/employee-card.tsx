"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Employee } from "@/types";

interface EmployeeCardProps {
  employee: Employee;
  companyId: string;
}

export function EmployeeCard({ employee, companyId }: EmployeeCardProps) {
  return (
    <Link href={`/company/${companyId}/employee/${employee.id}`}>
      <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
        <CardHeader>
          <CardTitle className="text-base">{employee.name}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            {employee.employeeId && (
              <Badge variant="secondary">{employee.employeeId}</Badge>
            )}
            {employee.designation && (
              <span className="text-muted-foreground text-sm">
                {employee.designation}
              </span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
