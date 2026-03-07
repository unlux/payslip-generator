import type { FieldVisibilitySettings } from "@/types";

export const STDB_URI =
  process.env.NEXT_PUBLIC_STDB_URI || "ws://localhost:3000";
export const STDB_DATABASE =
  process.env.NEXT_PUBLIC_STDB_DATABASE || "payslip-gen";
export const STDB_TOKEN_KEY = "spacetimedb:payslip:token";
export const SIGNATURE_KEY = "payslip:boss:signature";

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
