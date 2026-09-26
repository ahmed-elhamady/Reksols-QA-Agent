---
name: qa-workflow
description: Persists and resumes the unified QA workflow lifecycle for the Router Agent, including INPUT, prerequisite validation, clarification, BLOCKED, UNKNOWN, artifacts, and WAITING_FOR_QA_APPROVAL. Use when routing, pausing, or resuming any QA activity.
---

# QA Workflow State

## Purpose

Router-owned persistence and resume of the shared lifecycle. Specialist Agents do not own this file.

State file: `.cursor/workflow/qa-workflow-state.json`  
Helper: `node .cursor/hooks/qa-workflow-state.js`

Needs Clarification catalog: `.cursor/skills/qa-needs-clarification/SKILL.md`  
Approval sound: `.cursor/skills/qa-approval-notification/SKILL.md`

---

## Lifecycle

```text
INPUT (RECEIVED)
  ↓
VALIDATE PREREQUISITES (VALIDATING_PREREQUISITES)
  ↓
Needs Clarification evaluation (catalog + Agent rules)
  ├── REQUIRES_CLARIFICATION → store questions → STOP → resume after answers
  ├── BLOCKED → record reason → STOP
  └── READY
       ↓
EXECUTE (EXECUTING)
       ↓
BLOCKED or UNKNOWN as detected
       ↓
ARTIFACT (ARTIFACT_CREATED)
       ↓
APPROVAL_REQUIRED? → WAITING_FOR_QA_APPROVAL + audible notify
       ↓
APPROVED → CONTINUE
REJECTED → STOP
REQUEST_CHANGES → Agent rework → gate again
```

Do not restart the entire workflow after a clarification unless the activity itself changed.

---

## Step 1 — INPUT

Identify: activity, Story/Feature/Sprint/Bug, Jira ID, environment, artifacts, approvals, execution type, previous state.

If routing identity is missing: `RTR-CL-*` → `REQUIRES_CLARIFICATION`.

```text
node .cursor/hooks/qa-workflow-state.js --action init --activity "<activity>" --agent "<agent-id>"
node .cursor/hooks/qa-workflow-state.js --action set-state --state VALIDATING_PREREQUISITES
```

---

## Step 2 — VALIDATE PREREQUISITES (before dispatch)

Do not dispatch if a mandatory prerequisite is already known missing.

| Activity | Mandatory before execute |
| --- | --- |
| Requirement Analysis | Story or Jira issue |
| Impact Analysis | Requirement / Story information |
| Test Case Creation | Requirement/AC source (artifact, Story, or Jira ID) |
| Test Case Automation | Test Case Artifact or valid Jira Story |
| Framework Creation | Locator + Environment + Test Case Automation artifacts |
| Pipeline Creation | Inspectable automation project |
| Pipeline Execution | Approved Pipeline Creation Artifact |
| Test Summary | Scope + target; execution data when summarizing execution |
| Bug Creation | Pipeline Execution + Analysis artifacts |
| Locator Inspection | Story ID + environment URL |
| Environment | Story / Issue ID |
| Test Plan | Story, Jira ID, or Sprint Started event |

Then evaluate **every applicable ID** in `qa-needs-clarification` plus the Agent’s own rule list.

---

## Step 3 — Clarification

For each OPEN applicable missing human fact:

```text
node .cursor/hooks/qa-workflow-state.js --action add-clarification --id "PC-CL-001" --agent "Pipeline Creation Agent" --condition "CI/CD platform cannot be confirmed" --missing "CI/CD platform" --why "Pipeline config depends on platform" --question "Which CI/CD platform should be used?" --expected-answer "GitHub Actions / GitLab CI / Jenkins / Azure DevOps / Other"
```

Present all independent questions together. Vague “please provide more information” is forbidden.

On QA answer:

```text
node .cursor/hooks/qa-workflow-state.js --action resolve-clarification --id "PC-CL-001" --answer "GitHub Actions"
```

Validate the answer. Re-evaluate remaining IDs. Do not re-ask RESOLVED items.

---

## Step 4 — EXECUTE

Only if overall `READY`. Invoke the specialist. Agent stays in role, uses evidence, never invents, never bypasses approval.

On technical stop:

```text
node .cursor/hooks/qa-workflow-state.js --action set-blocked --reason "<exact reason>" --evidence "<paths>" --resolution "<what unblocks>"
```

On insufficient/conflicting evidence: record `UNKNOWN` in the artifact and persist with `--action add-unknown`. Do not guess. Escalate to clarification only if a human answer can resolve it.

---

## Step 5 — ARTIFACT

```text
node .cursor/hooks/qa-workflow-state.js --action set-artifact --name "<Artifact>" --path "<path or UNKNOWN>" --status PENDING_APPROVAL
```

Artifact should include: status, agent, activity, input, evidence refs, result, clarifications, blocked, approval requirement, next state.

---

## Step 6 — Approval

If protected write or Agent-defined QA review: `WAITING_FOR_QA_APPROVAL` via `qa-approval-notification`.

```text
node .cursor/hooks/qa-workflow-state.js --action set-state --state WAITING_FOR_QA_APPROVAL
```

Then run the notifier. Failure → `set-blocked` with reason `QA approval notification could not be delivered.`

Decisions:

```text
node .cursor/hooks/qa-workflow-state.js --action set-approval --decision APPROVED --feedback "<text>"
node .cursor/hooks/qa-workflow-state.js --action set-approval --decision REJECTED --feedback "<text>"
node .cursor/hooks/qa-workflow-state.js --action set-approval --decision REQUEST_CHANGES --feedback "<text>"
```

`APPROVED` → continue. `REJECTED` → stop. `REQUEST_CHANGES` → owning Agent updates artifact → approval gate again.

---

## Resume

Read current state with `--action show`. Continue from `REQUIRES_CLARIFICATION`, `WAITING_FOR_QA_APPROVAL`, `REQUEST_CHANGES`, or `BLOCKED` (after resolution). Do not lose context.

---

## Scenario checks

1. “Create test cases” with no story → `TC-CL-001` / `RTR-CL-003` — no test cases created.  
2. Story + artifacts present → VALIDATE → EXECUTE → ARTIFACT → CONTINUE or approval.  
3. Environment unreachable → `BLOCKED` (ENV-CL-006), no fake results.  
4. Conflicting failure evidence → `UNKNOWN` root cause.  
5. Protected write → `WAITING_FOR_QA_APPROVAL`.  
6. QA `APPROVED` → continue.  
7. QA `REJECTED` → stop.  
8. QA `REQUEST_CHANGES` → rework → gate again.  
9. Notify fail → `BLOCKED`, never claim delivery.
