"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { useStdb } from "@/providers/spacetimedb-provider";
import { useEmployee, parseJsonCustomFields } from "@/hooks/use-db";
import { LIMITS } from "@/lib/constants";
import type { CustomField } from "@/types";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmployeeProfilePage() {
  const { employeeId } = useAuth();
  const { conn } = useStdb();
  const employee = useEmployee(employeeId);
  const [loaded, setLoaded] = useState(false);

  const [uan, setUan] = useState("");
  const [pan, setPan] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  if (employee && !loaded) {
    setLoaded(true);
    setUan(employee.uan);
    setPan(employee.pan);
    setBankAccountNumber(employee.bankAccountNumber);
    setCustomFields(parseJsonCustomFields(employee.customFieldsJson));
  }

  function addCustomField() {
    if (customFields.length >= LIMITS.MAX_CUSTOM_FIELDS) {
      toast.error(`Maximum ${LIMITS.MAX_CUSTOM_FIELDS} custom fields allowed`);
      return;
    }
    setCustomFields([...customFields, { key: "", value: "" }]);
  }

  function updateCustomField(
    index: number,
    field: "key" | "value",
    val: string,
  ) {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [field]: val };
    setCustomFields(updated);
  }

  function removeCustomField(index: number) {
    setCustomFields(customFields.filter((_, i) => i !== index));
  }

  function handleSave() {
    try {
      const validFields = customFields.filter((f) => f.key && f.value);
      conn?.reducers.updateMyProfile({
        uan,
        pan,
        bankAccountNumber,
        customFieldsJson: JSON.stringify(validFields),
      });
      toast.success("Profile updated");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update profile",
      );
    }
  }

  if (!employee) {
    return (
      <div className="container mx-auto px-4 py-6">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader title="My Profile" />

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Employee Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="mt-1 font-medium">{employee.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Employee Code</Label>
                <p className="mt-1 font-medium">
                  {employee.employeeCode || "-"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Designation</Label>
                <p className="mt-1 font-medium">
                  {employee.designation || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Editable Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="uan">UAN</Label>
                <Input
                  id="uan"
                  value={uan}
                  onChange={(e) => setUan(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="pan">PAN</Label>
                <Input
                  id="pan"
                  value={pan}
                  onChange={(e) => setPan(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="bank">Bank Account Number</Label>
                <Input
                  id="bank"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Custom Fields</CardTitle>
            <Button variant="outline" size="sm" onClick={addCustomField}>
              <Plus className="mr-1 size-4" />
              Add Field
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {customFields.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No custom fields added.
              </p>
            )}
            {customFields.map((field, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1">
                  <Label className="text-xs">Key</Label>
                  <Input
                    value={field.key}
                    onChange={(e) =>
                      updateCustomField(i, "key", e.target.value)
                    }
                    placeholder="Field name"
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Value</Label>
                  <Input
                    value={field.value}
                    onChange={(e) =>
                      updateCustomField(i, "value", e.target.value)
                    }
                    placeholder="Field value"
                    className="mt-1"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeCustomField(i)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
