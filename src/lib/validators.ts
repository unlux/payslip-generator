import { z } from "zod/v4";

export const payComponentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().min(0, "Amount must be non-negative"),
});

export const customFieldSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
});

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  address: z.string().default(""),
  city: z.string().default(""),
  pincode: z.string().default(""),
  logo: z.string().default(""),
  currency: z.string().min(1, "Currency is required"),
});

export const employeeSchema = z.object({
  name: z.string().min(1, "Employee name is required"),
  employeeId: z.string().default(""),
  uan: z.string().default(""),
  pan: z.string().default(""),
  bankAccountNumber: z.string().default(""),
  designation: z.string().default(""),
  customFields: z.array(customFieldSchema).default([]),
});

export const payslipFormSchema = z.object({
  companyId: z.string().min(1, "Select a company"),
  employeeId: z.string().min(1, "Select an employee"),
  payPeriod: z.object({
    month: z.number().min(1).max(12),
    year: z.number().min(2000).max(2100),
  }),
  paidDays: z.number().min(0).max(31),
  lopDays: z.number().min(0).max(31),
  paymentDate: z.string().optional().default(""),
  earnings: z.array(payComponentSchema).min(1, "Add at least one earning"),
  deductions: z.array(payComponentSchema).optional().default([]),
});

export type CompanyFormValues = z.output<typeof companySchema>;
export type EmployeeFormValues = z.output<typeof employeeSchema>;
export type PayslipFormValues = z.output<typeof payslipFormSchema>;
