import type { FieldVisibilitySettings } from "@/types";

export const STORAGE_KEYS = {
  COMPANIES: "payslip-gen:companies",
  EMPLOYEES: "payslip-gen:employees",
  PAYSLIPS: "payslip-gen:payslips",
} as const;

export const DEFAULT_FIELD_VISIBILITY: FieldVisibilitySettings = {
  companyAddress: true,
  companyCity: true,
  companyPincode: true,
  companyLogo: true,
  employeeId: true,
  uan: true,
  pan: true,
  bankAccountNumber: true,
  designation: true,
  paidDays: true,
  lopDays: true,
  paymentDate: true,
  payPeriod: true,
  customFields: true,
};

export const LIMITS = {
  MAX_CUSTOM_FIELDS: 20,
  MAX_PAY_COMPONENTS: 20,
  LOGO_MAX_SIZE: 200,
  LOGO_QUALITY: 0.8,
  LOCAL_STORAGE_WARN_MB: 4,
} as const;

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
