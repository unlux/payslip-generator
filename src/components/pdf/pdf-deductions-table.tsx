import { View, Text } from "@react-pdf/renderer";
import { styles } from "@/components/pdf/pdf-styles";
import type { PayComponent } from "@/types";

interface PdfDeductionsTableProps {
  deductions: PayComponent[];
  totalDeductions: number;
  currencySymbol: string;
}

function formatAmount(amount: number, symbol: string): string {
  return `${symbol}${amount.toLocaleString("en-IN")}`;
}

export function PdfDeductionsTable({
  deductions,
  totalDeductions,
  currencySymbol,
}: PdfDeductionsTableProps) {
  return (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>Deductions</Text>
        <Text style={styles.tableHeaderText}>Amount</Text>
      </View>
      {deductions.map((item) => (
        <View key={item.name} style={styles.tableRow}>
          <Text style={styles.tableCellName}>{item.name}</Text>
          <Text style={styles.tableCellAmount}>
            {formatAmount(item.amount, currencySymbol)}
          </Text>
        </View>
      ))}
      <View style={styles.tableFooter}>
        <Text style={styles.tableFooterLabel}>Total Deductions</Text>
        <Text style={styles.tableFooterAmount}>
          {formatAmount(totalDeductions, currencySymbol)}
        </Text>
      </View>
    </View>
  );
}
