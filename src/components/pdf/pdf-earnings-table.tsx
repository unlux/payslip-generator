import { View, Text } from "@react-pdf/renderer";
import { styles } from "@/components/pdf/pdf-styles";
import type { PayComponent } from "@/types";

interface PdfEarningsTableProps {
  earnings: PayComponent[];
  grossEarnings: number;
  currencySymbol: string;
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("en-IN");
}

export function PdfEarningsTable({
  earnings,
  grossEarnings,
  currencySymbol,
}: PdfEarningsTableProps) {
  return (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>EARNINGS</Text>
        <Text style={styles.tableHeaderText}>AMOUNT ({currencySymbol})</Text>
      </View>
      {earnings.map((item, index) => (
        <View
          key={item.name}
          style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
        >
          <Text style={styles.tableCellName}>{item.name}</Text>
          <Text style={styles.tableCellAmount}>
            {formatAmount(item.amount)}
          </Text>
        </View>
      ))}
      <View style={styles.tableFooter}>
        <Text style={styles.tableFooterLabel}>Gross Earnings</Text>
        <Text style={styles.tableFooterAmount}>
          {currencySymbol} {formatAmount(grossEarnings)}
        </Text>
      </View>
    </View>
  );
}
