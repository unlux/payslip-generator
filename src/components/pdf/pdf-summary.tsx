import { View, Text } from "@react-pdf/renderer";
import { styles } from "@/components/pdf/pdf-styles";

interface PdfSummaryProps {
  netPayable: number;
  currencySymbol: string;
  amountInWords: string;
}

export function PdfSummary({
  netPayable,
  currencySymbol,
  amountInWords,
}: PdfSummaryProps) {
  const formatted = `${currencySymbol}${netPayable.toLocaleString("en-IN")}`;

  return (
    <>
      <View style={styles.netPayableBox}>
        <View>
          <Text style={styles.netPayableLabel}>Total Net Payable</Text>
          <Text style={styles.netPayableSubtext}>
            Gross Earnings - Total Deductions
          </Text>
        </View>
        <Text style={styles.netPayableAmount}>{formatted}</Text>
      </View>
      <View style={styles.amountWordsContainer}>
        <Text style={styles.amountWordsLabel}>Amount In Words : </Text>
        <Text style={styles.amountWordsValue}>{amountInWords}</Text>
      </View>
    </>
  );
}
