/* eslint-disable jsx-a11y/alt-text */
import { View, Text, Image } from "@react-pdf/renderer";
import { styles } from "@/components/pdf/pdf-styles";
import { MONTHS } from "@/lib/constants";
import type { Company, PayPeriod, FieldVisibilitySettings } from "@/types";

interface PdfHeaderProps {
  company: Company;
  payPeriod: PayPeriod;
  fieldVisibility: FieldVisibilitySettings;
}

export function PdfHeader({
  company,
  payPeriod,
  fieldVisibility,
}: PdfHeaderProps) {
  const addressParts = [
    fieldVisibility.companyAddress ? company.address : "",
    fieldVisibility.companyCity ? company.city : "",
    fieldVisibility.companyPincode ? company.pincode : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {fieldVisibility.companyLogo && company.logo && (
            <Image style={styles.logo} src={company.logo} />
          )}
          <View>
            <Text style={styles.companyName}>{company.name}</Text>
            {addressParts && (
              <Text style={styles.companyDetail}>{addressParts}</Text>
            )}
          </View>
        </View>
        {fieldVisibility.payPeriod && (
          <View style={styles.headerRight}>
            <Text style={styles.payPeriodLabel}>Payslip For the Month</Text>
            <Text style={styles.payPeriodValue}>
              {MONTHS[payPeriod.month - 1]} {payPeriod.year}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.separator} />
    </>
  );
}
