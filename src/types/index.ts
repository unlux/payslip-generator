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

export interface Company {
  id: string;
  name: string;
  address: string;
  city: string;
  pincode: string;
  logo: string;
  currency: string;
  fieldVisibility: FieldVisibilitySettings;
  earningsTemplate: PayComponent[];
  deductionsTemplate: PayComponent[];
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  companyId: string;
  name: string;
  employeeId: string;
  uan: string;
  pan: string;
  bankAccountNumber: string;
  designation: string;
  customFields: CustomField[];
  createdAt: string;
  updatedAt: string;
}

export interface PayPeriod {
  month: number;
  year: number;
}

export interface PayslipRecord {
  id: string;
  companyId: string;
  employeeId: string;
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
  createdAt: string;
}
