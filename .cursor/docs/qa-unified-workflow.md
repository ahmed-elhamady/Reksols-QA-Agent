# Unified QA Workflow

The Router Agent is the only workflow orchestrator. Specialist Agents execute their own activity after prerequisites are `READY`.

## Lifecycle

```text
INPUT (RECEIVED)
  ↓
VALIDATE PREREQUISITES + Needs Clarification catalog
  ├── REQUIRES_CLARIFICATION → precise questions → persist → resume after answers
  ├── BLOCKED → reason + required resolution → stop
  └── READY
       ↓
EXECUTE
       ├── BLOCKED
       └── UNKNOWN (insufficient or conflicting evidence; do not guess)
       ↓
ARTIFACT_CREATED
       ↓
APPROVAL_REQUIRED? → WAITING_FOR_QA_APPROVAL + audible notify
       ├── APPROVED → continue
       ├── REJECTED → stop
       └── REQUEST_CHANGES → owning Agent rework → approval gate again
```

States: `RECEIVED`, `VALIDATING_PREREQUISITES`, `REQUIRES_CLARIFICATION`, `READY`, `EXECUTING`, `BLOCKED`, `ARTIFACT_CREATED`, `WAITING_FOR_QA_APPROVAL`, `APPROVED`, `REJECTED`, `REQUEST_CHANGES`, `COMPLETED`.

## Persistence

- State: `.cursor/workflow/qa-workflow-state.json`
- Helper: `node .cursor/hooks/qa-workflow-state.js`
- Clarification catalog: `.cursor/skills/qa-needs-clarification/SKILL.md`
- Contract: `.cursor/rules/qa-workflow-contract.mdc`
- Approval sound: `node .cursor/hooks/qa-approval-notify.js`

Failed notification delivery is `BLOCKED`. Do not claim the notification was sent.

## Agent-specific Needs Clarification

Each Agent’s existing Needs Clarification list remains authoritative. The catalog assigns IDs (`RA-CL-*`, `PC-CL-*`, `TC-CL-*`, …). Evaluate every applicable ID. Do not re-ask RESOLVED items. Ask independent open items together.

## Protected writes

Jira, Confluence, pipeline files, pipeline execute, and other persistent external changes require explicit QA `APPROVED` through the Router.

## Validation scenarios

1. “Create test cases” with no story → `REQUIRES_CLARIFICATION` (`TC-CL-001` / `RTR-CL-003`). No test cases created.
2. Story and required artifacts present → VALIDATE → EXECUTE → ARTIFACT → CONTINUE or approval.
3. Environment URL exists but unreachable → `BLOCKED` (`ENV-CL-006`). No fabricated results.
4. Conflicting evidence / no reliable root cause → `UNKNOWN` (`AFT-CL-005` / `BC-CL-003`). No guessed cause.
5. Protected write after artifact → `WAITING_FOR_QA_APPROVAL`.
6. QA `APPROVED` → continue.
7. QA `REJECTED` → stop transition.
8. QA `REQUEST_CHANGES` → owning Agent updates artifact → approval gate again.
9. Audible notification cannot be delivered → `BLOCKED`.

## Files

| Kind | Path |
| --- | --- |
| Router identity | `.cursor/agents/router-agent.md` |
| Router rules | `.cursor/rules/router-rule.mdc` |
| Orchestration | `.cursor/skills/router/orchestration/SKILL.md` |
| Workflow skill | `.cursor/skills/qa-workflow/SKILL.md` |
| Specialist identity | `.cursor/agents/<agent>.md` |
| Specialist rules | `.cursor/rules/<agent-or-activity>.mdc` |

Do not create a Documentation Agent.
