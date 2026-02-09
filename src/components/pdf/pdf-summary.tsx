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
  return (
    <View style={styles.summaryBox}>
      <Text style={styles.netPayableLabel}>NET PAYABLE</Text>
      <Text style={styles.netPayableAmount}>
        {currencySymbol} {netPayable.toLocaleString("en-IN")}
      </Text>
      <Text style={styles.amountInWords}>Amount in Words: {amountInWords}</Text>
    </View>
  );
}
