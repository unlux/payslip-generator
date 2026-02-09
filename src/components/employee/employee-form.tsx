"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, type EmployeeFormValues } from "@/lib/validators";
import type { Resolver } from "react-hook-form";
import { CustomFieldsEditor } from "@/components/employee/custom-fields-editor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Employee } from "@/types";

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee;
  onSubmit: (data: EmployeeFormValues) => void;
  companyId: string;
}

export function EmployeeForm({
  open,
  onOpenChange,
  employee,
  onSubmit,
}: EmployeeFormProps) {
  const isEdit = !!employee;

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(
      employeeSchema,
    ) as unknown as Resolver<EmployeeFormValues>,
    defaultValues: employee
      ? {
          name: employee.name,
          employeeId: employee.employeeId,
          uan: employee.uan,
          pan: employee.pan,
          bankAccountNumber: employee.bankAccountNumber,
          designation: employee.designation,
          customFields: employee.customFields,
        }
      : {
          name: "",
          employeeId: "",
          uan: "",
          pan: "",
          bankAccountNumber: "",
          designation: "",
          customFields: [],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "customFields",
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
    onOpenChange(false);
    form.reset();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Employee" : "Add Employee"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update employee details below."
              : "Fill in the employee details below."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-destructive text-xs">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input id="employeeId" {...form.register("employeeId")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="designation">Designation</Label>
            <Input id="designation" {...form.register("designation")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="uan">UAN</Label>
            <Input id="uan" {...form.register("uan")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pan">PAN</Label>
            <Input id="pan" {...form.register("pan")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
            <Input
              id="bankAccountNumber"
              {...form.register("bankAccountNumber")}
            />
          </div>

          <div className="space-y-2">
            <Label>Custom Fields</Label>
            <CustomFieldsEditor
              fields={fields}
              append={append}
              remove={remove}
              register={form.register}
              errors={
                form.formState.errors.customFields as Record<
                  number,
                  { key?: { message?: string }; value?: { message?: string } }
                >
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? "Save Changes" : "Add Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
