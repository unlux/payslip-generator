import { describe, expect, test } from "bun:test";
import type { DbHiddenPayslip, DbPayslipSubmission } from "@/types";
import { splitPayslipsByVisibility } from "./payslip-visibility";

function payslip(id: bigint): DbPayslipSubmission {
  return {
    id,
    employeeId: 1n,
    payMonth: 1,
    payYear: 2026,
    paidDays: 30,
    lopDays: 0,
    paymentDate: "",
    earningsJson: "[]",
    deductionsJson: "[]",
    customFieldsJson: "[]",
    grossEarnings: 0n,
    totalDeductions: 0n,
    netPayable: 0n,
    amountInWords: "",
    status: "signed",
    createdAt: { microsSinceUnixEpoch: id },
    updatedAt: { microsSinceUnixEpoch: id },
  };
}

function hiddenPayslip(submissionId: bigint): DbHiddenPayslip {
  return {
    submissionId,
    employeeId: 1n,
    reason: "Wrong amount",
    hiddenByUserId: 9n,
    hiddenAt: { microsSinceUnixEpoch: 123n },
  };
}

describe("splitPayslipsByVisibility", () => {
  test("separates hidden payslips from normal payslips without reordering", () => {
    const result = splitPayslipsByVisibility(
      [payslip(1n), payslip(2n), payslip(3n)],
      [hiddenPayslip(2n)],
    );

    expect(result.visible.map((p) => p.id)).toEqual([1n, 3n]);
    expect(result.hidden.map((p) => p.id)).toEqual([2n]);
    expect(result.hidden[0].hiddenReason).toEqual("Wrong amount");
  });
});
