import { View, Text } from "@react-pdf/renderer";
import { styles } from "@/components/pdf/pdf-styles";
import { MONTHS } from "@/lib/constants";
import type {
  Employee,
  PayPeriod,
  CustomField,
  FieldVisibilitySettings,
} from "@/types";

interface PdfEmployeeDetailsProps {
  employee: Employee;
  payPeriod: PayPeriod;
  paidDays: number;
  lopDays: number;
  paymentDate: string;
  customFields: CustomField[];
  fieldVisibility: FieldVisibilitySettings;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.employeeField}>
      <Text style={styles.employeeLabel}>{label}</Text>
      <Text style={styles.employeeColon}>:</Text>
      <Text style={styles.employeeValue}>{value}</Text>
    </View>
  );
}

export function PdfEmployeeDetails({
  employee,
  payPeriod,
  paidDays,
  lopDays,
  paymentDate,
  customFields,
  fieldVisibility,
}: PdfEmployeeDetailsProps) {
  return (
    <View style={styles.employeeSection}>
      <Text style={styles.sectionHeading}>Employee Summary</Text>
      <View style={styles.employeeGrid}>
        <Field label="Employee Name" value={employee.name} />
        {fieldVisibility.employeeId && employee.employeeId && (
          <Field label="Employee ID" value={employee.employeeId} />
        )}
        {fieldVisibility.designation && employee.designation && (
          <Field label="Designation" value={employee.designation} />
        )}
        {fieldVisibility.payPeriod && (
          <Field
            label="Pay Period"
            value={`${MONTHS[payPeriod.month - 1]} ${payPeriod.year}`}
          />
        )}
        {fieldVisibility.paymentDate && paymentDate && (
          <Field label="Pay Date" value={paymentDate} />
        )}
        {fieldVisibility.paidDays && (
          <Field label="Paid Days" value={String(paidDays)} />
        )}
        {fieldVisibility.lopDays && (
          <Field label="LOP Days" value={String(lopDays)} />
        )}
        {fieldVisibility.customFields &&
          customFields.map((field) => (
            <Field key={field.key} label={field.key} value={field.value} />
          ))}
      </View>
    </View>
  );
}
