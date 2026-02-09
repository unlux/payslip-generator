/* eslint-disable jsx-a11y/alt-text */
import { View, Text, Image } from "@react-pdf/renderer";
import { styles } from "@/components/pdf/pdf-styles";
import { MONTHS } from "@/lib/constants";
import type { Company, PayPeriod, FieldVisibilitySettings } from "@/types";

interface PdfHeaderProps {
  company: Company;
  payPeriod: PayPeriod;
  paymentDate: string;
  fieldVisibility: FieldVisibilitySettings;
}

export function PdfHeader({
  company,
  payPeriod,
  paymentDate,
  fieldVisibility,
}: PdfHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {fieldVisibility.companyLogo && company.logo && (
          <Image style={styles.logo} src={company.logo} />
        )}
        <View>
          <Text style={styles.companyName}>{company.name}</Text>
          {fieldVisibility.companyAddress && company.address && (
            <Text style={styles.companyDetail}>{company.address}</Text>
          )}
          {(fieldVisibility.companyCity || fieldVisibility.companyPincode) && (
            <Text style={styles.companyDetail}>
              {[
                fieldVisibility.companyCity ? company.city : "",
                fieldVisibility.companyPincode ? company.pincode : "",
              ]
                .filter(Boolean)
                .join(" - ")}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.headerRight}>
        {fieldVisibility.payPeriod && (
          <>
            <Text style={styles.payslipLabel}>Payslip For</Text>
            <Text style={styles.payslipPeriod}>
              {MONTHS[payPeriod.month - 1]} {payPeriod.year}
            </Text>
          </>
        )}
        {fieldVisibility.paymentDate && paymentDate && (
          <Text style={styles.paymentDate}>Pay Date: {paymentDate}</Text>
        )}
      </View>
    </View>
  );
}
