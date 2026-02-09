"use client";

import { useCallback } from "react";
import { PDFViewer, pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  PayslipDocument,
  type PayslipDocumentProps,
} from "@/components/pdf/payslip-document";
import { MONTHS } from "@/lib/constants";

export function PayslipPreview(props: PayslipDocumentProps) {
  const { company, employee, payPeriod } = props;

  const handleDownload = useCallback(async () => {
    const blob = await pdf(<PayslipDocument {...props} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const month = MONTHS[payPeriod.month - 1];
    link.href = url;
    link.download = `${company.name}_${employee.name}_${month}_${payPeriod.year}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [props, company.name, employee.name, payPeriod]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={handleDownload}>
          <Download className="size-4" />
          Download PDF
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden bg-white">
        <PDFViewer width="100%" height={600} showToolbar={false}>
          <PayslipDocument {...props} />
        </PDFViewer>
      </div>
    </div>
  );
}
