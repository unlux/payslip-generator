# Hidden Payslips Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a same-dashboard Hidden payslips section for signed payslips that should leave normal lists while remaining traceable.

**Architecture:** Store hidden state on `payslip_submission` and append hide/restore audit entries to a dedicated visibility event table. Keep the existing identity-aware views, expose hidden rows to the same permitted users, and split visible vs hidden client-side through a small pure helper used by both dashboards.

**Tech Stack:** SpacetimeDB TypeScript module, generated SpacetimeDB TS bindings, Next.js App Router, React 19, shadcn/ui, Bun test for pure helpers, TypeScript/build verification.

---

### Task 1: Client Split Helper

**Files:**
- Create: `src/lib/payslip-visibility.ts`
- Create: `src/lib/payslip-visibility.test.ts`

- [ ] **Step 1: Write a failing Bun test**

```ts
import { describe, expect, test } from "bun:test";
import { splitPayslipsByVisibility } from "./payslip-visibility";
import type { DbPayslipSubmission } from "@/types";

function payslip(id: bigint, isHidden: boolean): DbPayslipSubmission {
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
    isHidden,
    hiddenReason: "",
    hiddenByUserId: undefined,
    hiddenAt: undefined,
    restoredByUserId: undefined,
    restoredAt: undefined,
    visibilityEventsJson: "[]",
    createdAt: { microsSinceUnixEpoch: id },
    updatedAt: { microsSinceUnixEpoch: id },
  };
}

describe("splitPayslipsByVisibility", () => {
  test("separates hidden payslips from normal payslips without reordering", () => {
    const result = splitPayslipsByVisibility([
      payslip(1n, false),
      payslip(2n, true),
      payslip(3n, false),
    ]);

    expect(result.visible.map((p) => p.id)).toEqual([1n, 3n]);
    expect(result.hidden.map((p) => p.id)).toEqual([2n]);
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `bun test src/lib/payslip-visibility.test.ts`

Expected: FAIL because `src/lib/payslip-visibility.ts` does not exist yet.

- [ ] **Step 3: Add the minimal helper**

```ts
import type { DbPayslipSubmission } from "@/types";

export function splitPayslipsByVisibility(submissions: DbPayslipSubmission[]) {
  return {
    visible: submissions.filter((submission) => !submission.isHidden),
    hidden: submissions.filter((submission) => submission.isHidden),
  };
}
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `bun test src/lib/payslip-visibility.test.ts`

Expected: PASS.

### Task 2: Server Hidden State And Reducers

**Files:**
- Modify: `server/src/schema.ts`
- Modify: `server/src/index.ts`

- [ ] **Step 1: Add hidden state fields to `payslip_submission`**

Add:

```ts
isHidden: t.bool(),
hiddenReason: t.string(),
hiddenByUserId: t.u64().optional(),
hiddenAt: t.timestamp().optional(),
restoredByUserId: t.u64().optional(),
restoredAt: t.timestamp().optional(),
visibilityEventsJson: t.string(),
```

- [ ] **Step 2: Add `payslip_visibility_event` table**

Add a private table with `id`, `submissionId`, `actorUserId`, `action`, `reason`, and `createdAt`, indexed by `submissionId`.

- [ ] **Step 3: Seed hidden fields on new submissions**

In `submitPayslip`, initialize hidden fields to visible defaults and `visibilityEventsJson: "[]"`.

- [ ] **Step 4: Add `hidePayslip` reducer**

Allow the owning employee or boss/signing authority to hide only signed, currently visible payslips. Trim and require a 3-250 character reason. Set hidden fields and append a hide event.

- [ ] **Step 5: Add `restorePayslip` reducer**

Allow the owning employee or boss/signing authority to restore only hidden payslips. Clear the active hidden state, keep the hide reason/history, and append a restore event with an empty reason.

### Task 3: Generated Bindings And Types

**Files:**
- Modify: `src/types/index.ts`
- Regenerate: `src/module_bindings/**`

- [ ] **Step 1: Update frontend DB interfaces**

Add hidden state fields to `DbPayslipSubmission`.

- [ ] **Step 2: Regenerate SpacetimeDB bindings**

Run: `spacetime generate --lang typescript --out-dir src/module_bindings --project-path server/`

Expected: generated reducer and view schemas include the new fields and reducers.

### Task 4: Dashboard Hidden Sections

**Files:**
- Modify: `src/app/boss/page.tsx`
- Modify: `src/app/employee/page.tsx`
- Modify: `src/components/payslip/status-badge.tsx`

- [ ] **Step 1: Split visible and hidden rows**

Use `splitPayslipsByVisibility` before sorting/grouping normal rows. Normal year sections use visible rows only.

- [ ] **Step 2: Add always-visible Hidden section**

Render `Hidden Payslips (0)` on both dashboards, collapsed by default, at the bottom. Hidden rows use the same table/card patterns and direct links.

- [ ] **Step 3: Add row-only restore actions**

In the hidden section row/card, show a restore button that calls `restorePayslip`. Do not add restore controls to hidden detail pages.

### Task 5: Detail Pages And Hide Flow

**Files:**
- Modify: `src/app/boss/payslip/[id]/page.tsx`
- Modify: `src/app/employee/payslip/[id]/page.tsx`

- [ ] **Step 1: Show Hidden status on hidden details**

For direct links to hidden payslips, show a visible Hidden badge and reason metadata.

- [ ] **Step 2: Add bottom Hide action for visible signed payslips**

At the bottom of signed visible detail pages, render one confirmation dialog with a required free-text reason. On confirm, call `hidePayslip`.

- [ ] **Step 3: Keep download available for hidden signed payslips**

Allow PDF download on hidden signed details, but do not show restore there.

### Task 6: Verification

**Files:**
- All changed files

- [ ] **Step 1: Run focused helper test**

Run: `bun test src/lib/payslip-visibility.test.ts`

- [ ] **Step 2: Run frontend typecheck**

Run: `bunx tsc --noEmit`

- [ ] **Step 3: Run frontend lint**

Run: `bun run lint`

- [ ] **Step 4: Run production build**

Run: `bun run build`

- [ ] **Step 5: Run server typecheck**

Run: `cd server && bunx tsc --noEmit`
