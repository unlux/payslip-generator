"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companySchema, type CompanyFormValues } from "@/lib/validators";
import type { Company } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoUpload } from "@/components/company/logo-upload";
import { CurrencySelect } from "@/components/company/currency-select";

interface CompanyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company;
  onSubmit: (data: CompanyFormValues) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resolver = zodResolver(companySchema) as any;

export function CompanyForm({
  open,
  onOpenChange,
  company,
  onSubmit,
}: CompanyFormProps) {
  const isEdit = !!company;

  const form = useForm<CompanyFormValues>({
    resolver,
    defaultValues: {
      name: "",
      address: "",
      city: "",
      pincode: "",
      logo: "",
      currency: "INR",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: company?.name ?? "",
        address: company?.address ?? "",
        city: company?.city ?? "",
        pincode: company?.pincode ?? "",
        logo: company?.logo ?? "",
        currency: company?.currency ?? "INR",
      });
    }
  }, [open, company, form]);

  const logoValue = useWatch({ control: form.control, name: "logo" });
  const currencyValue = useWatch({ control: form.control, name: "currency" });

  function handleSubmit(data: CompanyFormValues) {
    onSubmit(data);
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Company" : "Add Company"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update company details."
              : "Add a new company to generate payslips for."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...form.register("address")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...form.register("city")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" {...form.register("pincode")} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Logo</Label>
            <LogoUpload
              value={logoValue ?? ""}
              onChange={(val) => form.setValue("logo", val)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Currency *</Label>
            <CurrencySelect
              value={currencyValue}
              onValueChange={(val) =>
                form.setValue("currency", val, { shouldValidate: true })
              }
            />
            {form.formState.errors.currency && (
              <p className="text-sm text-destructive">
                {form.formState.errors.currency.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
