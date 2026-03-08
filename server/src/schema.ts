import { schema, table, t } from "spacetimedb/server";

// PRIVATE -- only reducers can access
const credential = table(
  { name: "credential" },
  {
    userId: t.u64().primaryKey(),
    passwordHash: t.string(),
    salt: t.string(),
  },
);

// PRIVATE -- exposed via views
const user = table(
  {
    name: "user",
    indexes: [
      {
        accessor: "byIdentity",
        name: "user_identity",
        algorithm: "btree" as const,
        columns: ["identity"],
      },
      {
        accessor: "byRole",
        name: "user_role",
        algorithm: "btree" as const,
        columns: ["role"],
      },
    ],
  },
  {
    id: t.u64().primaryKey().autoInc(),
    username: t.string().unique(),
    name: t.string(),
    role: t.string(), // "boss" | "employee"
    identity: t.identity().optional(),
    employeeId: t.u64().optional(),
    createdAt: t.timestamp(),
  },
);

const company = table(
  { name: "company" },
  {
    id: t.u64().primaryKey(), // singleton, always 1n
    name: t.string(),
    address: t.string(),
    city: t.string(),
    pincode: t.string(),
    logo: t.string(),
    currency: t.string(),
    bossName: t.string(),
    updatedAt: t.timestamp(),
  },
);

const employee = table(
  {
    name: "employee",
    indexes: [
      {
        accessor: "byUserId",
        name: "employee_user",
        algorithm: "btree" as const,
        columns: ["userId"],
      },
    ],
  },
  {
    id: t.u64().primaryKey().autoInc(),
    userId: t.u64(),
    name: t.string(),
    employeeCode: t.string(),
    designation: t.string(),
    customFieldsJson: t.string(),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  },
);

const payslipSubmission = table(
  {
    name: "payslip_submission",
    indexes: [
      {
        accessor: "byEmployeeId",
        name: "payslip_employee",
        algorithm: "btree" as const,
        columns: ["employeeId"],
      },
      {
        accessor: "byStatus",
        name: "payslip_status",
        algorithm: "btree" as const,
        columns: ["status"],
      },
    ],
  },
  {
    id: t.u64().primaryKey().autoInc(),
    employeeId: t.u64(),
    payMonth: t.u8(),
    payYear: t.u16(),
    paidDays: t.u8(),
    lopDays: t.u8(),
    paymentDate: t.string(),
    earningsJson: t.string(),
    deductionsJson: t.string(),
    customFieldsJson: t.string(),
    grossEarnings: t.u64(),
    totalDeductions: t.u64(),
    netPayable: t.u64(),
    amountInWords: t.string(),
    status: t.string(), // "draft" | "submitted" | "signed"
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  },
);

const signedPayslip = table(
  {
    name: "signed_payslip",
    indexes: [
      {
        accessor: "byEmployeeId",
        name: "signed_payslip_employee",
        algorithm: "btree" as const,
        columns: ["employeeId"],
      },
    ],
  },
  {
    submissionId: t.u64().primaryKey(),
    employeeId: t.u64(),
    pdfBase64: t.string(),
    signedAt: t.timestamp(),
  },
);

const fieldVisibility = table(
  { name: "field_visibility" },
  {
    id: t.u64().primaryKey(), // singleton, always 1n
    companyAddress: t.bool(),
    companyCity: t.bool(),
    companyPincode: t.bool(),
    companyLogo: t.bool(),
    employeeId: t.bool(),
    designation: t.bool(),
    paidDays: t.bool(),
    lopDays: t.bool(),
    paymentDate: t.bool(),
    payPeriod: t.bool(),
    customFields: t.bool(),
  },
);

const earningsTemplate = table(
  {
    name: "earnings_template",
    indexes: [
      {
        accessor: "byPartition",
        name: "earnings_template_partition",
        algorithm: "btree" as const,
        columns: ["_p"],
      },
    ],
  },
  {
    id: t.u64().primaryKey().autoInc(),
    name: t.string(),
    defaultAmount: t.u64(),
    sortOrder: t.u16(),
    _p: t.u8(), // sentinel for view "get all" (always 0)
  },
);

const deductionsTemplate = table(
  {
    name: "deductions_template",
    indexes: [
      {
        accessor: "byPartition",
        name: "deductions_template_partition",
        algorithm: "btree" as const,
        columns: ["_p"],
      },
    ],
  },
  {
    id: t.u64().primaryKey().autoInc(),
    name: t.string(),
    defaultAmount: t.u64(),
    sortOrder: t.u16(),
    _p: t.u8(), // sentinel for view "get all" (always 0)
  },
);

const spacetimedb = schema({
  credential,
  user,
  company,
  employee,
  payslipSubmission,
  signedPayslip,
  fieldVisibility,
  earningsTemplate,
  deductionsTemplate,
});

export {
  user,
  company,
  employee,
  payslipSubmission,
  signedPayslip,
  fieldVisibility,
  earningsTemplate,
  deductionsTemplate,
};

export default spacetimedb;
