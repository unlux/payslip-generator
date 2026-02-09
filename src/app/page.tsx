"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { CompanyList } from "@/components/company/company-list";
import { FileTextIcon } from "lucide-react";

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        action={
          <Button asChild>
            <Link href="/generate">
              <FileTextIcon />
              Generate Payslip
            </Link>
          </Button>
        }
      />
      <CompanyList />
    </div>
  );
}
