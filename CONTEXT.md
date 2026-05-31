# Payslip Generator

This context describes the payslip lifecycle and the authority boundaries around signing, correction, and traceability.

## Language

**Signing Authority**:
The person who can approve and sign submitted payslips. Signing authority is not administrative precedence over payslip visibility or audit access.
_Avoid_: boss-as-admin, owner, superuser

**Hidden Payslip**:
A signed payslip removed from normal payslip lists because it should no longer be treated as the active visible record, while still remaining traceable in a deliberate hidden list. Hidden payslips are visible in the hidden list only to users who would otherwise be allowed to see that payslip, may be hidden by either the employee it belongs to or the signing authority, require a short reason when hidden, and may be restored from the hidden list. Hidden payslips remain openable and downloadable for permitted users, but they are not included in normal payslip counts.
_Avoid_: deleted payslip, boss-only archive, admin archive

**Corrected Payslip**:
A new normal payslip created after a mistaken signed payslip is hidden. Corrected payslips are not explicitly linked to the hidden mistaken payslip in the initial workflow.
_Avoid_: replacement chain, correction graph

## Example Dialogue

Dev: "Can the signing authority see hidden payslips when employees cannot?"
Domain expert: "No. Signing authority only means they can sign submitted payslips; it does not give them special visibility."

Dev: "So a hidden payslip is gone from the main dashboards?"
Domain expert: "Yes. It is hidden everywhere normal payslips are shown, but the same permitted users can find it in the hidden list."

Dev: "Should the corrected payslip point back to the hidden one?"
Domain expert: "No. Keep the first workflow simple: hide the mistaken signed payslip, then create a corrected payslip normally."

Dev: "Can someone open a hidden payslip directly?"
Domain expert: "Yes, if they would otherwise be allowed to see that payslip. The page should make clear that it is hidden."
