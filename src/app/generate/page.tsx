"use client";

import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout/page-header";

const PayslipEditor = dynamic(
  () =>
    import("@/components/payslip/payslip-editor").then(
      (mod) => mod.PayslipEditor,
    ),
  { ssr: false },
);

export default function GeneratePage() {
  return (
    <div>
      <PageHeader
        title="Generate Payslip"
        description="Edit inline and download as PDF"
      />
      <PayslipEditor />
    </div>
  );
}
