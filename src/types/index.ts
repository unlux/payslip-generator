export type PayslipStatus = "draft" | "submitted" | "signed";
export type UserRole = "boss" | "employee";

export interface FieldVisibilitySettings {
  companyAddress: boolean;
  companyCity: boolean;
  companyPincode: boolean;
  companyLogo: boolean;
  employeeId: boolean;
  uan: boolean;
  pan: boolean;
  bankAccountNumber: boolean;
  designation: boolean;
  paidDays: boolean;
  lopDays: boolean;
  paymentDate: boolean;
  payPeriod: boolean;
  customFields: boolean;
}

export interface PayComponent {
  name: string;
  amount: number;
}

export interface CustomField {
  key: string;
  value: string;
}

export interface PayPeriod {
  month: number;
  year: number;
}

// Mirrors SpacetimeDB row types (used until module_bindings are generated)

export interface DbUser {
  id: bigint;
  username: string;
  name: string;
  role: UserRole;
  identity?: { toHexString(): string };
  employeeId?: bigint;
  createdAt: { microsSinceUnixEpoch: bigint };
}

export interface DbCompany {
  id: bigint;
  name: string;
  address: string;
  city: string;
  pincode: string;
  logo: string;
  currency: string;
  bossName: string;
  updatedAt: { microsSinceUnixEpoch: bigint };
}

export interface DbEmployee {
  id: bigint;
  userId: bigint;
  name: string;
  employeeCode: string;
  designation: string;
  uan: string;
  pan: string;
  bankAccountNumber: string;
  customFieldsJson: string;
  createdAt: { microsSinceUnixEpoch: bigint };
  updatedAt: { microsSinceUnixEpoch: bigint };
}

export interface DbPayslipSubmission {
  id: bigint;
  employeeId: bigint;
  payMonth: number;
  payYear: number;
  paidDays: number;
  lopDays: number;
  paymentDate: string;
  earningsJson: string;
  deductionsJson: string;
  customFieldsJson: string;
  grossEarnings: bigint;
  totalDeductions: bigint;
  netPayable: bigint;
  amountInWords: string;
  status: PayslipStatus;
  createdAt: { microsSinceUnixEpoch: bigint };
  updatedAt: { microsSinceUnixEpoch: bigint };
}

export interface DbSignedPayslip {
  submissionId: bigint;
  pdfBase64: string;
  signedAt: { microsSinceUnixEpoch: bigint };
}

export interface DbFieldVisibility extends FieldVisibilitySettings {
  id: bigint;
}

export interface DbEarningsTemplate {
  id: bigint;
  name: string;
  defaultAmount: bigint;
  sortOrder: number;
}

export interface DbDeductionsTemplate {
  id: bigint;
  name: string;
  defaultAmount: bigint;
  sortOrder: number;
}
