/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import {
  useCompany,
  useFieldVisibility,
  useEarningsTemplates,
  useDeductionsTemplates,
  centsToAmount,
  amountToCents,
} from "@/hooks/use-db";
import { useStdb } from "@/providers/spacetimedb-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { CURRENCIES, getCurrencySymbol } from "@/lib/currencies";
import { LIMITS } from "@/lib/constants";
import { companySchema } from "@/lib/validators";
import { toast } from "sonner";
import type {
  FieldVisibilitySettings,
  DbEarningsTemplate,
  DbDeductionsTemplate,
} from "@/types";

const FIELD_LABELS: Record<keyof FieldVisibilitySettings, string> = {
  companyAddress: "Company Address",
  companyCity: "Company City",
  companyPincode: "Company Pincode",
  companyLogo: "Company Logo",
  employeeId: "Employee ID",
  uan: "UAN",
  pan: "PAN",
  bankAccountNumber: "Bank Account Number",
  designation: "Designation",
  paidDays: "Paid Days",
  lopDays: "LOP Days",
  paymentDate: "Payment Date",
  payPeriod: "Pay Period",
  customFields: "Custom Fields",
};

export default function SettingsPage() {
  const company = useCompany();
  const fieldVisibility = useFieldVisibility();
  const earningsTemplates = useEarningsTemplates();
  const deductionsTemplates = useDeductionsTemplates();
  const { conn } = useStdb();

  const [companyForm, setCompanyForm] = useState({
    name: "",
    address: "",
    city: "",
    pincode: "",
    currency: "INR",
    bossName: "",
    logo: "",
  });

  const [visForm, setVisForm] = useState<FieldVisibilitySettings>({
    companyAddress: true,
    companyCity: true,
    companyPincode: true,
    companyLogo: true,
    employeeId: true,
    uan: true,
    pan: true,
    bankAccountNumber: true,
    designation: true,
    paidDays: true,
    lopDays: true,
    paymentDate: true,
    payPeriod: true,
    customFields: true,
  });

  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateType, setTemplateType] = useState<"earnings" | "deductions">(
    "earnings",
  );
  const [editingTemplate, setEditingTemplate] = useState<
    DbEarningsTemplate | DbDeductionsTemplate | null
  >(null);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    defaultAmount: "",
    sortOrder: "0",
  });

  useEffect(() => {
    if (company) {
      setCompanyForm({
        name: company.name,
        address: company.address,
        city: company.city,
        pincode: company.pincode,
        currency: company.currency,
        bossName: company.bossName,
        logo: company.logo,
      });
    }
  }, [company]);

  useEffect(() => {
    setVisForm(fieldVisibility);
  }, [fieldVisibility]);

  function handleCompanySave() {
    const result = companySchema.safeParse(companyForm);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    if (!conn) return;
    try {
      conn.reducers.updateCompany({
        name: result.data.name,
        address: result.data.address,
        city: result.data.city,
        pincode: result.data.pincode,
        currency: result.data.currency,
        bossName: result.data.bossName,
        logo: result.data.logo,
      });
      toast.success("Company updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update company");
    }
  }

  function handleVisibilitySave() {
    if (!conn) return;
    try {
      conn.reducers.updateFieldVisibility({ ...visForm });
      toast.success("Field visibility updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update field visibility");
    }
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = LIMITS.LOGO_MAX_SIZE;
        let w = img.width;
        let h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) {
            h = (h / w) * maxSize;
            w = maxSize;
          } else {
            w = (w / h) * maxSize;
            h = maxSize;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/png", LIMITS.LOGO_QUALITY);
        setCompanyForm((prev) => ({ ...prev, logo: dataUrl }));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  function openTemplateDialog(
    type: "earnings" | "deductions",
    template?: DbEarningsTemplate | DbDeductionsTemplate,
  ) {
    setTemplateType(type);
    setEditingTemplate(template ?? null);
    setTemplateForm({
      name: template?.name ?? "",
      defaultAmount: template
        ? String(centsToAmount(template.defaultAmount))
        : "",
      sortOrder: template ? String(template.sortOrder) : "0",
    });
    setTemplateDialogOpen(true);
  }

  function handleTemplateSave() {
    if (!conn) return;
    const name = templateForm.name.trim();
    if (!name) {
      toast.error("Template name is required");
      return;
    }
    const amount = parseFloat(templateForm.defaultAmount) || 0;
    const sortOrder = parseInt(templateForm.sortOrder) || 0;
    const defaultAmount = amountToCents(amount);

    try {
      if (editingTemplate) {
        if (templateType === "earnings") {
          conn.reducers.updateEarningsTemplate({
            templateId: editingTemplate.id,
            name,
            defaultAmount,
            sortOrder,
          });
        } else {
          conn.reducers.updateDeductionsTemplate({
            templateId: editingTemplate.id,
            name,
            defaultAmount,
            sortOrder,
          });
        }
        toast.success("Template updated");
      } else {
        if (templateType === "earnings") {
          conn.reducers.addEarningsTemplate({ name, defaultAmount, sortOrder });
        } else {
          conn.reducers.addDeductionsTemplate({
            name,
            defaultAmount,
            sortOrder,
          });
        }
        toast.success("Template added");
      }
      setTemplateDialogOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save template");
    }
  }

  function handleTemplateDelete(type: "earnings" | "deductions", id: bigint) {
    if (!conn) return;
    try {
      if (type === "earnings") {
        conn.reducers.deleteEarningsTemplate({ templateId: id });
      } else {
        conn.reducers.deleteDeductionsTemplate({ templateId: id });
      }
      toast.success("Template deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete template");
    }
  }

  const currencySymbol = getCurrencySymbol(companyForm.currency);

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Settings"
        description="Company, visibility, and templates"
      />

      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="visibility">Field Visibility</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-6">
          <Card className="p-6">
            <div className="grid gap-4 max-w-lg">
              <div className="grid gap-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={companyForm.name}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-address">Address</Label>
                <Input
                  id="company-address"
                  value={companyForm.address}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, address: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="company-city">City</Label>
                  <Input
                    id="company-city"
                    value={companyForm.city}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, city: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company-pincode">Pincode</Label>
                  <Input
                    id="company-pincode"
                    value={companyForm.pincode}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        pincode: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-currency">Currency</Label>
                <Select
                  value={companyForm.currency}
                  onValueChange={(val) =>
                    setCompanyForm({ ...companyForm, currency: val })
                  }
                >
                  <SelectTrigger id="company-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.symbol} {c.name} ({c.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-boss">Signatory Name</Label>
                <Input
                  id="company-boss"
                  value={companyForm.bossName}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, bossName: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-logo">Logo</Label>
                <Input
                  id="company-logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
                {companyForm.logo && (
                  <div className="flex items-center gap-2">
                    <img
                      src={companyForm.logo}
                      alt="Logo preview"
                      className="h-12 w-12 rounded object-contain border"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setCompanyForm({ ...companyForm, logo: "" })
                      }
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
              <Button onClick={handleCompanySave} className="w-fit">
                Save Company
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="visibility" className="mt-6">
          <Card className="p-6">
            <div className="grid gap-4 max-w-lg">
              {(
                Object.keys(FIELD_LABELS) as (keyof FieldVisibilitySettings)[]
              ).map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={`vis-${key}`}>{FIELD_LABELS[key]}</Label>
                  <Switch
                    id={`vis-${key}`}
                    checked={visForm[key]}
                    onCheckedChange={(checked) =>
                      setVisForm({ ...visForm, [key]: checked })
                    }
                  />
                </div>
              ))}
              <Button onClick={handleVisibilitySave} className="w-fit">
                Save Visibility
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-6 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Earnings Templates</h3>
              <Button size="sm" onClick={() => openTemplateDialog("earnings")}>
                Add
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Default Amount</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earningsTemplates.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      No earnings templates
                    </TableCell>
                  </TableRow>
                )}
                {earningsTemplates.map((t) => (
                  <TableRow key={Number(t.id)}>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>
                      {currencySymbol}
                      {centsToAmount(t.defaultAmount).toLocaleString()}
                    </TableCell>
                    <TableCell>{t.sortOrder}</TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openTemplateDialog("earnings", t)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleTemplateDelete("earnings", t.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Deductions Templates</h3>
              <Button
                size="sm"
                onClick={() => openTemplateDialog("deductions")}
              >
                Add
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Default Amount</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deductionsTemplates.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      No deductions templates
                    </TableCell>
                  </TableRow>
                )}
                {deductionsTemplates.map((t) => (
                  <TableRow key={Number(t.id)}>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>
                      {currencySymbol}
                      {centsToAmount(t.defaultAmount).toLocaleString()}
                    </TableCell>
                    <TableCell>{t.sortOrder}</TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openTemplateDialog("deductions", t)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleTemplateDelete("deductions", t.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit" : "Add"}{" "}
              {templateType === "earnings" ? "Earnings" : "Deductions"} Template
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tpl-name">Name</Label>
              <Input
                id="tpl-name"
                value={templateForm.name}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tpl-amount">Default Amount</Label>
              <Input
                id="tpl-amount"
                type="number"
                min="0"
                step="0.01"
                value={templateForm.defaultAmount}
                onChange={(e) =>
                  setTemplateForm({
                    ...templateForm,
                    defaultAmount: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tpl-order">Sort Order</Label>
              <Input
                id="tpl-order"
                type="number"
                value={templateForm.sortOrder}
                onChange={(e) =>
                  setTemplateForm({
                    ...templateForm,
                    sortOrder: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTemplateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleTemplateSave}>
              {editingTemplate ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
