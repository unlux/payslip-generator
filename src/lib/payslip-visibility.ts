import type { DbHiddenPayslip, DbPayslipSubmission } from "@/types";

export type HiddenPayslipListItem = DbPayslipSubmission & {
  hiddenReason: string;
  hiddenByUserId: bigint;
  hiddenAt: { microsSinceUnixEpoch: bigint };
};

export function splitPayslipsByVisibility(
  submissions: DbPayslipSubmission[],
  hiddenPayslips: DbHiddenPayslip[],
): {
  visible: DbPayslipSubmission[];
  hidden: HiddenPayslipListItem[];
} {
  const hiddenBySubmissionId = new Map<bigint, DbHiddenPayslip>();
  for (const hidden of hiddenPayslips) {
    hiddenBySubmissionId.set(hidden.submissionId, hidden);
  }

  const visible: DbPayslipSubmission[] = [];
  const hidden: HiddenPayslipListItem[] = [];

  for (const submission of submissions) {
    const hiddenPayslip = hiddenBySubmissionId.get(submission.id);
    if (!hiddenPayslip) {
      visible.push(submission);
      continue;
    }

    hidden.push({
      ...submission,
      hiddenReason: hiddenPayslip.reason,
      hiddenByUserId: hiddenPayslip.hiddenByUserId,
      hiddenAt: hiddenPayslip.hiddenAt,
    });
  }

  return { visible, hidden };
}
