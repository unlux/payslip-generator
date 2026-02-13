import { SKILLION_LOGO } from "./default-logo";
import type { PayComponent } from "@/types";

// ─── Company ─────────────────────────────────────────────
export const COMPANY = {
  name: "Skillion",
  address: "E North St, 18018",
  city: "Bethlehem",
  logo: SKILLION_LOGO,
  currency: "USD",
} as const;

// ─── CEO / Signatory ────────────────────────────────────
export const CEO_NAME = "Pete Cooper";

// ─── Employees ──────────────────────────────────────────
// Add/remove employees here. The boss picks from this list.
export const EMPLOYEES = [
  {
    id: "1",
    name: "Lakshay Choudhary",
    employeeId: "011025",
    designation: "Web Developer",
  },
  {
    id: "2",
    name: "Manya Sharma",
    employeeId: "tbd",
    designation: "Marketing Manager",
  },

] as const;

// ─── Default Earnings ───────────────────────────────────
// Pre-filled earnings rows. Boss only needs to fill amounts.
export const DEFAULT_EARNINGS: PayComponent[] = [
  { name: "Base Pay", amount: 0 },
];

// ─── Default Deductions ─────────────────────────────────
export const DEFAULT_DEDUCTIONS: PayComponent[] = [];
