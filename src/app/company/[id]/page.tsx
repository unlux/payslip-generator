/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PencilIcon, TrashIcon, BuildingIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/page-header";
import { CompanyForm } from "@/components/company/company-form";
import { EmployeeList } from "@/components/employee/employee-list";
import { useCompanies } from "@/hooks/use-companies";
import { getCurrencySymbol } from "@/lib/currencies";
import type { CompanyFormValues } from "@/lib/validators";

export default function CompanyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getCompanyById, updateCompany, deleteCompany } = useCompanies();

  const [editOpen, setEditOpen] = useState(false);

  const company = getCompanyById(params.id);

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <BuildingIcon className="mb-3 size-10 text-muted-foreground" />
        <p className="font-medium">Company not found</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => router.push("/")}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  function handleEdit(data: CompanyFormValues) {
    updateCompany(company!.id, data);
  }

  function handleDelete() {
    deleteCompany(company!.id);
    router.push("/");
  }

  return (
    <div>
      <PageHeader
        title={company.name}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: company.name },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              <PencilIcon />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <TrashIcon />
              Delete
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid gap-2 text-sm">
        <div className="flex items-center gap-2">
          {company.logo && (
            <img
              src={company.logo}
              alt={`${company.name} logo`}
              className="h-12 w-12 rounded-md border object-cover"
            />
          )}
          <div>
            <Badge variant="secondary">
              {company.currency} {getCurrencySymbol(company.currency)}
            </Badge>
          </div>
        </div>
        {(company.address || company.city || company.pincode) && (
          <p className="text-muted-foreground">
            {[company.address, company.city, company.pincode]
              .filter(Boolean)
              .join(", ")}
          </p>
        )}
      </div>

      <Separator className="mb-6" />

      <EmployeeList companyId={company.id} />

      <CompanyForm
        open={editOpen}
        onOpenChange={setEditOpen}
        company={company}
        onSubmit={handleEdit}
      />
    </div>
  );
}
