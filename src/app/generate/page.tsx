"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout/page-header";
import { PayslipForm } from "@/components/payslip/payslip-form";
import type { PayslipDocumentProps } from "@/components/pdf/payslip-document";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PayslipPreview = dynamic(
  () =>
    import("@/components/payslip/payslip-preview").then(
      (mod) => mod.PayslipPreview,
    ),
  { ssr: false },
);

export default function GeneratePage() {
  const [previewData, setPreviewData] = useState<PayslipDocumentProps | null>(
    null,
  );

  if (previewData) {
    return (
      <div>
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPreviewData(null)}
          >
            <ArrowLeft className="size-4" />
            Back to form
          </Button>
        </div>
        <PayslipPreview {...previewData} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Generate Payslip"
        description="Fill in the details to generate a payslip"
      />
      <div className="mx-auto max-w-2xl">
        <PayslipForm onPreview={setPreviewData} />
      </div>
    </div>
  );
}
