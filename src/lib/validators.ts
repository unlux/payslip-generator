import { z } from "zod/v4";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(4, "New password must be at least 4 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

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
  bossName: z.string().min(1, "Signatory name is required"),
});

export const employeeAccountSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  name: z.string().min(1, "Employee name is required"),
  employeeCode: z.string().default(""),
  designation: z.string().default(""),
});

export const employeeSchema = z.object({
  name: z.string().min(1, "Employee name is required"),
  employeeCode: z.string().default(""),
  designation: z.string().default(""),
  customFields: z.array(customFieldSchema).default([]),
});

export const submissionSchema = z.object({
  payMonth: z.number().min(1).max(12),
  payYear: z.number().min(2000).max(2100),
  paidDays: z.number().min(0).max(31),
  lopDays: z.number().min(0).max(31),
  paymentDate: z.string().optional().default(""),
  earnings: z.array(payComponentSchema).min(1, "Add at least one earning"),
  deductions: z.array(payComponentSchema).optional().default([]),
  customFields: z.array(customFieldSchema).optional().default([]),
});

export type LoginFormValues = z.output<typeof loginSchema>;
export type ChangePasswordFormValues = z.output<typeof changePasswordSchema>;
export type CompanyFormValues = z.output<typeof companySchema>;
export type EmployeeAccountFormValues = z.output<typeof employeeAccountSchema>;
export type EmployeeFormValues = z.output<typeof employeeSchema>;
export type SubmissionFormValues = z.output<typeof submissionSchema>;
