import spacetimedb from "./schema";
import { t, SenderError } from "spacetimedb/server";
export default spacetimedb;

// --- Pure JS SHA-256 ---
const SHA256_K: number[] = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function sha256(message: string): string {
  const K = SHA256_K;

  function rr(v: number, n: number) {
    return (v >>> n) | (v << (32 - n));
  }

  // Encode string to UTF-8 bytes
  const bytes: number[] = [];
  for (let i = 0; i < message.length; i++) {
    const c = message.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff && i + 1 < message.length) {
      const c2 = message.charCodeAt(++i);
      const cp = 0x10000 + ((c & 0x3ff) << 10) + (c2 & 0x3ff);
      bytes.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f),
      );
    } else if (c < 0x80) bytes.push(c);
    else if (c < 0x800) {
      bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    } else {
      bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
  }

  // Padding
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  // Append length as 64-bit big-endian
  for (let i = 56; i >= 0; i -= 8) bytes.push((bitLen >>> i) & 0xff);

  let h0 = 0x6a09e667,
    h1 = 0xbb67ae85,
    h2 = 0x3c6ef372,
    h3 = 0xa54ff53a,
    h4 = 0x510e527f,
    h5 = 0x9b05688c,
    h6 = 0x1f83d9ab,
    h7 = 0x5be0cd19;

  for (let offset = 0; offset < bytes.length; offset += 64) {
    const w = new Array<number>(64);
    for (let i = 0; i < 16; i++) {
      w[i] =
        (bytes[offset + i * 4] << 24) |
        (bytes[offset + i * 4 + 1] << 16) |
        (bytes[offset + i * 4 + 2] << 8) |
        bytes[offset + i * 4 + 3];
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }

    let a = h0,
      b = h1,
      c = h2,
      d = h3,
      e = h4,
      f = h5,
      g = h6,
      h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + w[i]) | 0;
      const S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + t1) | 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) | 0;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }

  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, "0");
  return (
    hex(h0) +
    hex(h1) +
    hex(h2) +
    hex(h3) +
    hex(h4) +
    hex(h5) +
    hex(h6) +
    hex(h7)
  );
}

function hashPassword(password: string, salt: string): string {
  return sha256(salt + password);
}

function generateSalt(
  ctx: { timestamp: { microsSinceUnixEpoch: bigint } },
  extra: string,
): string {
  return sha256(ctx.timestamp.microsSinceUnixEpoch.toString() + extra);
}

// --- Auth helpers ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getUserByIdentity(ctx: any, sender: any) {
  const senderHex = sender.toHexString();
  for (const u of ctx.db.user.iter()) {
    if (u.identity && u.identity.toHexString() === senderHex) return u;
  }
  return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function assertBoss(ctx: any) {
  const user = getUserByIdentity(ctx, ctx.sender);
  if (!user || user.role !== "boss")
    throw new SenderError("Boss access required");
  return user;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function assertEmployee(ctx: any) {
  const user = getUserByIdentity(ctx, ctx.sender);
  if (!user || user.role !== "employee")
    throw new SenderError("Employee access required");
  return user;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getUserByUsername(ctx: any, username: string) {
  return ctx.db.user.username.find(username) ?? undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function assertOwnSubmission(ctx: any) {
  const user = assertEmployee(ctx);
  if (!user.employeeId) throw new SenderError("No employee profile linked");
  return user;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findOwnSubmission(ctx: any, submissionId: bigint) {
  const user = assertOwnSubmission(ctx);
  const sub = ctx.db.payslipSubmission.id.find(submissionId);
  if (!sub) throw new SenderError("Submission not found");
  if (sub.employeeId !== user.employeeId)
    throw new SenderError("Not your submission");
  return { user, sub };
}

// --- Lifecycle ---

export const init = spacetimedb.init((ctx) => {
  // Seed boss account
  const bossUser = ctx.db.user.insert({
    id: 0n,
    username: "admin",
    name: "Admin",
    role: "boss",
    identity: undefined,
    employeeId: undefined,
    createdAt: ctx.timestamp,
  });

  const salt = generateSalt(ctx, "admin-init");
  ctx.db.credential.insert({
    userId: bossUser.id,
    passwordHash: hashPassword("admin", salt),
    salt,
  });

  // Seed company defaults
  ctx.db.company.insert({
    id: 1n,
    name: "Company Name",
    address: "",
    city: "",
    pincode: "",
    logo: "",
    currency: "USD",
    bossName: "Boss Name",
    updatedAt: ctx.timestamp,
  });

  // Seed field visibility defaults
  ctx.db.fieldVisibility.insert({
    id: 1n,
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
  });

  // Seed default earnings template
  ctx.db.earningsTemplate.insert({
    id: 0n,
    name: "Base Pay",
    defaultAmount: 0n,
    sortOrder: 0,
  });

  console.info("Database initialized with default boss account and company");
});

export const onConnect = spacetimedb.clientConnected((_ctx) => {});
export const onDisconnect = spacetimedb.clientDisconnected((_ctx) => {});

// --- Auth reducers ---

export const login = spacetimedb.reducer(
  { username: t.string(), password: t.string() },
  (ctx, { username, password }) => {
    const user = getUserByUsername(ctx, username);
    if (!user) throw new SenderError("Invalid username or password");

    const cred = ctx.db.credential.userId.find(user.id);
    if (!cred) throw new SenderError("Invalid username or password");

    const hash = hashPassword(password, cred.salt);
    if (hash !== cred.passwordHash)
      throw new SenderError("Invalid username or password");

    // Clear any existing identity binding for this sender
    const existingSession = getUserByIdentity(ctx, ctx.sender);
    if (existingSession) {
      ctx.db.user.id.update({ ...existingSession, identity: undefined });
    }
    // Link identity to user
    ctx.db.user.id.update({ ...user, identity: ctx.sender });
  },
);

export const logout = spacetimedb.reducer((ctx) => {
  const user = getUserByIdentity(ctx, ctx.sender);
  if (!user) throw new SenderError("Not logged in");
  ctx.db.user.id.update({ ...user, identity: undefined });
});

export const changePassword = spacetimedb.reducer(
  { oldPassword: t.string(), newPassword: t.string() },
  (ctx, { oldPassword, newPassword }) => {
    const user = getUserByIdentity(ctx, ctx.sender);
    if (!user) throw new SenderError("Not logged in");

    const cred = ctx.db.credential.userId.find(user.id);
    if (!cred) throw new SenderError("Credential not found");

    const oldHash = hashPassword(oldPassword, cred.salt);
    if (oldHash !== cred.passwordHash)
      throw new SenderError("Current password is incorrect");

    if (!newPassword || newPassword.length < 4)
      throw new SenderError("Password must be at least 4 characters");

    const newSalt = generateSalt(ctx, user.username);
    ctx.db.credential.userId.update({
      ...cred,
      passwordHash: hashPassword(newPassword, newSalt),
      salt: newSalt,
    });
  },
);

// --- Boss: Company ---

export const updateCompany = spacetimedb.reducer(
  {
    name: t.string(),
    address: t.string(),
    city: t.string(),
    pincode: t.string(),
    logo: t.string(),
    currency: t.string(),
    bossName: t.string(),
  },
  (ctx, args) => {
    assertBoss(ctx);
    const existing = ctx.db.company.id.find(1n);
    if (!existing) throw new SenderError("Company not found");
    ctx.db.company.id.update({
      ...existing,
      ...args,
      updatedAt: ctx.timestamp,
    });
  },
);

// --- Boss: Field Visibility ---

export const updateFieldVisibility = spacetimedb.reducer(
  {
    companyAddress: t.bool(),
    companyCity: t.bool(),
    companyPincode: t.bool(),
    companyLogo: t.bool(),
    employeeId: t.bool(),
    uan: t.bool(),
    pan: t.bool(),
    bankAccountNumber: t.bool(),
    designation: t.bool(),
    paidDays: t.bool(),
    lopDays: t.bool(),
    paymentDate: t.bool(),
    payPeriod: t.bool(),
    customFields: t.bool(),
  },
  (ctx, args) => {
    assertBoss(ctx);
    const existing = ctx.db.fieldVisibility.id.find(1n);
    if (!existing) throw new SenderError("Field visibility not found");
    ctx.db.fieldVisibility.id.update({ ...existing, ...args });
  },
);

// --- Boss: Employee Management ---

export const createEmployeeAccount = spacetimedb.reducer(
  {
    username: t.string(),
    password: t.string(),
    name: t.string(),
    employeeCode: t.string(),
    designation: t.string(),
  },
  (ctx, { username, password, name, employeeCode, designation }) => {
    assertBoss(ctx);

    if (!username || !password || !name)
      throw new SenderError("Username, password, and name are required");

    const existingUser = getUserByUsername(ctx, username);
    if (existingUser) throw new SenderError("Username already taken");

    // Create employee row first
    const emp = ctx.db.employee.insert({
      id: 0n,
      userId: 0n, // placeholder, updated below
      name,
      employeeCode,
      designation,
      uan: "",
      pan: "",
      bankAccountNumber: "",
      customFieldsJson: "[]",
      createdAt: ctx.timestamp,
      updatedAt: ctx.timestamp,
    });

    // Create user
    const newUser = ctx.db.user.insert({
      id: 0n,
      username,
      name,
      role: "employee",
      identity: undefined,
      employeeId: emp.id,
      createdAt: ctx.timestamp,
    });

    // Update employee with userId
    ctx.db.employee.id.update({ ...emp, userId: newUser.id });

    // Create credential
    const salt = generateSalt(ctx, username);
    ctx.db.credential.insert({
      userId: newUser.id,
      passwordHash: hashPassword(password, salt),
      salt,
    });
  },
);

export const updateEmployee = spacetimedb.reducer(
  {
    empId: t.u64(),
    name: t.string(),
    employeeCode: t.string(),
    designation: t.string(),
    uan: t.string(),
    pan: t.string(),
    bankAccountNumber: t.string(),
    customFieldsJson: t.string(),
  },
  (ctx, { empId, ...fields }) => {
    assertBoss(ctx);
    const emp = ctx.db.employee.id.find(empId);
    if (!emp) throw new SenderError("Employee not found");
    ctx.db.employee.id.update({
      ...emp,
      ...fields,
      updatedAt: ctx.timestamp,
    });
    // Also update user name
    const user = ctx.db.user.id.find(emp.userId);
    if (user) {
      ctx.db.user.id.update({ ...user, name: fields.name });
    }
  },
);

export const deleteEmployee = spacetimedb.reducer(
  { empId: t.u64() },
  (ctx, { empId }) => {
    assertBoss(ctx);
    const emp = ctx.db.employee.id.find(empId);
    if (!emp) throw new SenderError("Employee not found");

    // Clean up payslip submissions and signed payslips
    for (const sub of ctx.db.payslipSubmission.byEmployeeId.filter(empId)) {
      if (sub.status === "signed") {
        ctx.db.signedPayslip.submissionId.delete(sub.id);
      }
      ctx.db.payslipSubmission.id.delete(sub.id);
    }
    // Delete credential, user, employee
    ctx.db.credential.userId.delete(emp.userId);
    ctx.db.user.id.delete(emp.userId);
    ctx.db.employee.id.delete(empId);
  },
);

// --- Boss: Templates ---

export const addEarningsTemplate = spacetimedb.reducer(
  { name: t.string(), defaultAmount: t.u64(), sortOrder: t.u16() },
  (ctx, args) => {
    assertBoss(ctx);
    ctx.db.earningsTemplate.insert({ id: 0n, ...args });
  },
);

export const updateEarningsTemplate = spacetimedb.reducer(
  {
    templateId: t.u64(),
    name: t.string(),
    defaultAmount: t.u64(),
    sortOrder: t.u16(),
  },
  (ctx, { templateId, ...fields }) => {
    assertBoss(ctx);
    const existing = ctx.db.earningsTemplate.id.find(templateId);
    if (!existing) throw new SenderError("Template not found");
    ctx.db.earningsTemplate.id.update({ ...existing, ...fields });
  },
);

export const deleteEarningsTemplate = spacetimedb.reducer(
  { templateId: t.u64() },
  (ctx, { templateId }) => {
    assertBoss(ctx);
    ctx.db.earningsTemplate.id.delete(templateId);
  },
);

export const addDeductionsTemplate = spacetimedb.reducer(
  { name: t.string(), defaultAmount: t.u64(), sortOrder: t.u16() },
  (ctx, args) => {
    assertBoss(ctx);
    ctx.db.deductionsTemplate.insert({ id: 0n, ...args });
  },
);

export const updateDeductionsTemplate = spacetimedb.reducer(
  {
    templateId: t.u64(),
    name: t.string(),
    defaultAmount: t.u64(),
    sortOrder: t.u16(),
  },
  (ctx, { templateId, ...fields }) => {
    assertBoss(ctx);
    const existing = ctx.db.deductionsTemplate.id.find(templateId);
    if (!existing) throw new SenderError("Template not found");
    ctx.db.deductionsTemplate.id.update({ ...existing, ...fields });
  },
);

export const deleteDeductionsTemplate = spacetimedb.reducer(
  { templateId: t.u64() },
  (ctx, { templateId }) => {
    assertBoss(ctx);
    ctx.db.deductionsTemplate.id.delete(templateId);
  },
);

// --- Boss: Payslip signing ---

export const signPayslip = spacetimedb.reducer(
  { submissionId: t.u64(), pdfBase64: t.string() },
  (ctx, { submissionId, pdfBase64 }) => {
    assertBoss(ctx);
    const sub = ctx.db.payslipSubmission.id.find(submissionId);
    if (!sub) throw new SenderError("Submission not found");
    if (sub.status !== "submitted")
      throw new SenderError("Can only sign submitted payslips");

    ctx.db.payslipSubmission.id.update({
      ...sub,
      status: "signed",
      updatedAt: ctx.timestamp,
    });

    ctx.db.signedPayslip.insert({
      submissionId,
      pdfBase64,
      signedAt: ctx.timestamp,
    });
  },
);

export const rejectPayslip = spacetimedb.reducer(
  { submissionId: t.u64() },
  (ctx, { submissionId }) => {
    assertBoss(ctx);
    const sub = ctx.db.payslipSubmission.id.find(submissionId);
    if (!sub) throw new SenderError("Submission not found");
    if (sub.status !== "submitted")
      throw new SenderError("Can only reject submitted payslips");

    ctx.db.payslipSubmission.id.update({
      ...sub,
      status: "draft",
      updatedAt: ctx.timestamp,
    });
  },
);

// --- Employee: Profile ---

export const updateMyProfile = spacetimedb.reducer(
  {
    uan: t.string(),
    pan: t.string(),
    bankAccountNumber: t.string(),
    customFieldsJson: t.string(),
  },
  (ctx, fields) => {
    const user = assertEmployee(ctx);
    if (!user.employeeId) throw new SenderError("No employee profile linked");

    const emp = ctx.db.employee.id.find(user.employeeId);
    if (!emp) throw new SenderError("Employee record not found");

    ctx.db.employee.id.update({
      ...emp,
      ...fields,
      updatedAt: ctx.timestamp,
    });
  },
);

// --- Employee: Payslip Submissions ---

export const submitPayslip = spacetimedb.reducer(
  {
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
  },
  (ctx, args) => {
    const user = assertOwnSubmission(ctx);

    ctx.db.payslipSubmission.insert({
      id: 0n,
      employeeId: user.employeeId!,
      ...args,
      status: "submitted",
      createdAt: ctx.timestamp,
      updatedAt: ctx.timestamp,
    });
  },
);

export const updateDraft = spacetimedb.reducer(
  {
    submissionId: t.u64(),
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
  },
  (ctx, { submissionId, ...fields }) => {
    const { sub } = findOwnSubmission(ctx, submissionId);
    if (sub.status !== "draft") throw new SenderError("Can only edit drafts");

    ctx.db.payslipSubmission.id.update({
      ...sub,
      ...fields,
      updatedAt: ctx.timestamp,
    });
  },
);

export const deleteDraft = spacetimedb.reducer(
  { submissionId: t.u64() },
  (ctx, { submissionId }) => {
    const { sub } = findOwnSubmission(ctx, submissionId);
    if (sub.status === "signed")
      throw new SenderError("Cannot delete signed payslips");

    ctx.db.payslipSubmission.id.delete(submissionId);
  },
);

export const resubmitPayslip = spacetimedb.reducer(
  { submissionId: t.u64() },
  (ctx, { submissionId }) => {
    const { sub } = findOwnSubmission(ctx, submissionId);
    if (sub.status !== "draft")
      throw new SenderError("Can only resubmit drafts");

    ctx.db.payslipSubmission.id.update({
      ...sub,
      status: "submitted",
      updatedAt: ctx.timestamp,
    });
  },
);
