import { View, Text } from "@react-pdf/renderer";
import { styles } from "@/components/pdf/pdf-styles";
import type { Employee, CustomField, FieldVisibilitySettings } from "@/types";

interface PdfEmployeeDetailsProps {
  employee: Employee;
  paidDays: number;
  lopDays: number;
  customFields: CustomField[];
  fieldVisibility: FieldVisibilitySettings;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.employeeField}>
      <Text style={styles.employeeFieldLabel}>{label}</Text>
      <Text style={styles.employeeFieldValue}>{value}</Text>
    </View>
  );
}

export function PdfEmployeeDetails({
  employee,
  paidDays,
  lopDays,
  customFields,
  fieldVisibility,
}: PdfEmployeeDetailsProps) {
  return (
    <View style={styles.employeeSection}>
      <Text style={styles.employeeSectionTitle}>Employee Details</Text>
      <View style={styles.employeeGrid}>
        <Field label="Employee Name" value={employee.name} />
        {fieldVisibility.employeeId && employee.employeeId && (
          <Field label="Employee ID" value={employee.employeeId} />
        )}
        {fieldVisibility.designation && employee.designation && (
          <Field label="Designation" value={employee.designation} />
        )}
        {fieldVisibility.uan && employee.uan && (
          <Field label="UAN" value={employee.uan} />
        )}
        {fieldVisibility.pan && employee.pan && (
          <Field label="PAN" value={employee.pan} />
        )}
        {fieldVisibility.bankAccountNumber && employee.bankAccountNumber && (
          <Field label="Bank A/C No." value={employee.bankAccountNumber} />
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
