/* eslint-disable jsx-a11y/alt-text */
import { Document, Image, Page, View, Text } from "@react-pdf/renderer";
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
  signedBy?: string;
  signatureImage?: string;
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
  signedBy,
  signatureImage,
}: PayslipDocumentProps) {
  const currencySymbol = getCurrencySymbol(company.currency);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PdfHeader
          company={company}
          payPeriod={payPeriod}
          fieldVisibility={fieldVisibility}
        />

        <PdfEmployeeDetails
          employee={employee}
          payPeriod={payPeriod}
          paidDays={paidDays}
          lopDays={lopDays}
          paymentDate={paymentDate}
          customFields={customFields}
          fieldVisibility={fieldVisibility}
        />

        <View style={styles.tablesBorder}>
          <View style={styles.tablesRow}>
            <PdfEarningsTable
              earnings={earnings}
              grossEarnings={grossEarnings}
              currencySymbol={currencySymbol}
            />
            <View style={styles.tableDivider} />
            <PdfDeductionsTable
              deductions={deductions}
              totalDeductions={totalDeductions}
              currencySymbol={currencySymbol}
            />
          </View>
        </View>

        <PdfSummary
          netPayable={netPayable}
          currencySymbol={currencySymbol}
          amountInWords={amountInWords}
        />

        <View style={{ flex: 1 }} />

        {(signedBy || signatureImage) && (
          <View style={styles.signatoryContainer}>
            <View style={styles.signatoryBlock}>
              {signatureImage && (
                <Image style={styles.signatoryImage} src={signatureImage} />
              )}
              <View style={styles.signatoryLine}>
                {signedBy && (
                  <Text style={styles.signatoryName}>{signedBy}</Text>
                )}
                <Text style={styles.signatoryText}>CEO Skillion</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
