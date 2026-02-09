import { Document, Page, View } from "@react-pdf/renderer";
import { styles } from "@/components/pdf/pdf-styles";
import { PdfHeader } from "@/components/pdf/pdf-header";
import { PdfEmployeeDetails } from "@/components/pdf/pdf-employee-details";
import { PdfEarningsTable } from "@/components/pdf/pdf-earnings-table";
import { PdfDeductionsTable } from "@/components/pdf/pdf-deductions-table";
import { PdfSummary } from "@/components/pdf/pdf-summary";
import { getCurrencySymbol } from "@/lib/currencies";
import type {
  Company,
  Employee,
  PayPeriod,
  PayComponent,
  CustomField,
  FieldVisibilitySettings,
} from "@/types";

export interface PayslipDocumentProps {
  company: Company;
  employee: Employee;
  payPeriod: PayPeriod;
  paidDays: number;
  lopDays: number;
  paymentDate: string;
  earnings: PayComponent[];
  deductions: PayComponent[];
  customFields: CustomField[];
  grossEarnings: number;
  totalDeductions: number;
  netPayable: number;
  amountInWords: string;
  fieldVisibility: FieldVisibilitySettings;
}

export function PayslipDocument({
  company,
  employee,
  payPeriod,
  paidDays,
  lopDays,
  paymentDate,
  earnings,
  deductions,
  customFields,
  grossEarnings,
  totalDeductions,
  netPayable,
  amountInWords,
  fieldVisibility,
}: PayslipDocumentProps) {
  const currencySymbol = getCurrencySymbol(company.currency);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PdfHeader
          company={company}
          payPeriod={payPeriod}
          paymentDate={paymentDate}
          fieldVisibility={fieldVisibility}
        />
        <PdfEmployeeDetails
          employee={employee}
          paidDays={paidDays}
          lopDays={lopDays}
          customFields={customFields}
          fieldVisibility={fieldVisibility}
        />
        <View style={styles.tablesRow}>
          <PdfEarningsTable
            earnings={earnings}
            grossEarnings={grossEarnings}
            currencySymbol={currencySymbol}
          />
          <PdfDeductionsTable
            deductions={deductions}
            totalDeductions={totalDeductions}
            currencySymbol={currencySymbol}
          />
        </View>
        <PdfSummary
          netPayable={netPayable}
          currencySymbol={currencySymbol}
          amountInWords={amountInWords}
        />
      </Page>
    </Document>
  );
}
