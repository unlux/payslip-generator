"use client";

import { useState } from "react";
import { PlusIcon, BuildingIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompanies } from "@/hooks/use-companies";
import { CompanyCard } from "@/components/company/company-card";
import { CompanyForm } from "@/components/company/company-form";
import type { CompanyFormValues } from "@/lib/validators";

export function CompanyList() {
  const { companies, addCompany } = useCompanies();
  const [formOpen, setFormOpen] = useState(false);

  function handleCreate(data: CompanyFormValues) {
    addCompany(data);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Companies</h2>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <PlusIcon />
          Add Company
        </Button>
      </div>

      {companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <BuildingIcon className="mb-3 size-10 text-muted-foreground" />
          <p className="mb-1 font-medium">No companies yet</p>
          <p className="mb-4 text-sm text-muted-foreground">
            Add a company to start generating payslips.
          </p>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <PlusIcon />
            Add Company
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}

      <CompanyForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
      />
    </div>
  );
}
