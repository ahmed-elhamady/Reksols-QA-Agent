---
name: qa-approval-notification
description: Triggers the centralized audible QA approval notification, writes the approval request and audit trail, and pauses the QA workflow until the Router receives APPROVED, REJECTED, or REQUEST_CHANGES. Use when any Agent reaches an approval gate. Router-owned; specialized Agents must not invoke this independently.
---

# QA Approval Notification

## Purpose

Central audible notification and approval-request persistence for the QA Agent System.

Owning Agent: **Router Agent**.

Specialized Agents send an approval request to the Router. They must not play sounds, write fake notification events, or resume protected work on their own.

---

## When

`APPROVAL_REQUIRED` for a protected action (project file writes, Jira writes, Confluence writes, pipeline create, pipeline execute, or an Agent-defined QA review gate).

---

## Workflow

```text
Specialized Agent finishes safe work
      ↓
Artifact status PENDING_APPROVAL
      ↓
Router receives approval request
      ↓
Router runs central notifier
      ↓
Audible QA notification
      ↓
STOP
      ↓
QA: APPROVED | REJECTED | REQUEST_CHANGES
```

---

## Step 1 — Classify

From the Agent result, set `APPROVAL_REQUIRED` or `APPROVAL_NOT_REQUIRED`.

If required and the artifact is missing: do not notify; return the Agent to produce the artifact.

---

## Step 2 — Build the Request

```yaml
approval_request:
  status: "PENDING"
  agent: "<agent-name>"
  task: "<task-name>"
  reason: "<why approval is required>"
  action: "<protected action>"
  artifact: "<artifact-name>"
  artifact_path: "<path or UNKNOWN>"
  requested_at: "<ISO timestamp from the notifier>"
  required_approval: "QA"
```

Do not invent agent, task, or artifact names.

---

## Step 3 — Trigger the Notifier

Run from the project root (do not reimplement in each Agent):

```text
node .cursor/hooks/qa-approval-notify.js --agent "<Agent>" --task "<Task>" --status "PENDING_APPROVAL" --action "<protected action>" --artifact "<Artifact name>" --artifact-path "<path or UNKNOWN>" --reason "<why>" --required-action "<what QA must do>"
```

The script:

1. Plays an audible alert (Windows beep + notify sound, or terminal bell).
2. Writes `.cursor/workflow/qa-approval-request.json`
3. Writes `.cursor/workflow/qa-approval-notification.json`
4. Appends `.cursor/workflow/qa-approval-trail.json`

If the command exits non-zero:

```text
BLOCKED
Reason: QA approval notification could not be delivered.
```

Stop. Do not claim delivery. Do not continue the protected action.

---

## Step 4 — Present and Stop

Show QA:

```text
QA APPROVAL REQUIRED

Agent:
<name>

Task:
<task>

Status:
PENDING_APPROVAL

Approval Required:
<reason>

Artifact:
<artifact>

Required Action:
Review and reply APPROVED, REJECTED, or REQUEST_CHANGES.
```

Then STOP. Do not treat silence, prior approvals, or unrelated messages as approval.

---

## Step 5 — Route the Decision

| Decision | Router action |
| --- | --- |
| `APPROVED` | Record trail; allow the owning Agent to perform the protected action |
| `REJECTED` | Record trail; stop the workflow; keep artifacts |
| `REQUEST_CHANGES` | Send feedback to the owning Agent; require a new notification after revision |

Update `.cursor/workflow/qa-approval-trail.json` with decision, feedback, timestamp, and next action. Do not invent a decision.

---

## Completion

Complete for a gate when the notifier exited 0 (or the workflow is `BLOCKED` because it did not), QA was shown the request, execution stopped, and later a real `APPROVED` / `REJECTED` / `REQUEST_CHANGES` was recorded.
