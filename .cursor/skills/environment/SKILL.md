---
name: environment-setup
description: Analyze a Jira User Story and Front-end/Back-end Sub-task statuses, select Development, Staging, or Production, perform supported environment setup, verify readiness, and produce an Environment Artifact for the Router Agent. Use when the Environment Agent receives a Jira User Story ID for environment analysis, selection, or setup.
---

# Environment Setup

## Purpose

Perform Environment Analysis, Environment Selection, and Environment Setup for a Jira User Story and return one Environment Artifact to the Router Agent.

The owning Agent is the Environment Agent.

Do not invent Jira statuses, Sub-tasks, URLs, configuration, or readiness results.

Do not simulate Jira operations, setup, or verification.

---

## Inputs

Primary input from the Router Agent:

```text
REK-123
```

The Skill may also receive:

- Project or intended QA activity already in context
- Prior Environment Artifact
- Existing environment configuration already in context

If a User Story ID is missing, stop and return `REQUIRES CLARIFICATION` to the Router Agent.

---

## Execution Workflow

```text
Receive Jira User Story ID from Router
      ↓
Connect to Jira and retrieve User Story
      ↓
Read User Story status
      ↓
Identify Sub-tasks
      ↓
Identify Front-end and Back-end Sub-tasks
      ↓
Retrieve each Sub-task status
      ↓
Apply environment selection mapping
      ↓
Identify environment URL from project sources
      ↓
Perform supported setup and readiness checks
      ↓
Build Environment Artifact
      ↓
Return Artifact to Router
```

---

## Step 1 — Jira Retrieval

Connect using the available Jira integration (Atlassian plugin / Jira tools).

1. Retrieve the issue by key.
2. Read summary, description, issue type, status, and Sub-tasks.
3. For each Sub-task key, retrieve summary, labels, components, and status.

If retrieval fails, stop. Do not select an environment.

```text
Selected Environment: NOT SELECTED
Environment Setup Status: NOT STARTED
Environment Readiness Status: NOT READY
Blocker: Jira retrieval failed
```

Return that artifact to the Router Agent.

---

## Step 2 — User Story Analysis

Record:

- User Story ID
- User Story Status as returned by Jira

Report statuses that appear in Jira, including:

- `To Do`
- `In Progress`
- `In Development`
- `Ready for Testing`
- `Done`

User Story status is reported only. It is not the environment mapping source.

---

## Step 3 — Sub-task Identification

From retrieved Sub-tasks, identify at most one relevant Front-end Sub-task and one relevant Back-end Sub-task.

Classify using retrieved Jira fields only (summary, labels, components, issue type), for example:

- Front-end: `Front-end`, `Frontend`, `Front End`, `FE`
- Back-end: `Back-end`, `Backend`, `Back End`, `BE`

If zero matches for Front-end or Back-end: missing Sub-task. Do not select an environment.

If more than one plausible Front-end or Back-end match: `REQUIRES CLARIFICATION`. Do not guess.

Do not infer deployment from the Sub-task name.

---

## Step 4 — Sub-task Status Analysis

Retrieve each identified Sub-task status from Jira.

Record:

- Front-end Sub-task key and status
- Back-end Sub-task key and status

If a required status cannot be retrieved, stop and return a blocker.

---

## Step 5 — Environment Selection

Apply only this mapping to the retrieved Front-end and Back-end statuses:

| Front-end | Back-end | Selected Environment |
| --- | --- | --- |
| `In Development` | `In Development` | Development |
| `Ready for Testing` | `Ready for Testing` | Staging |
| `Done` | `Done` | Production |

Any other combination, including mixed statuses:

```text
Selected Environment: NOT SELECTED
Blocker: No valid environment mapping
```

Report the actual statuses. Do not choose Development, Staging, or Production by guess.

If mapping succeeds, continue with setup for that environment only.

---

## Step 6 — Environment URL Identification

After an environment is selected, resolve its URL from an actual project source.

Search in this order and use the first **confirmed** value for the selected environment name:

1. Router-provided confirmed URL for that environment
2. `.cursor/config/environments.json` or other project environment configuration, if present
3. Project QA configuration or environment files that name Development, Staging, or Production
4. Approved documentation that names the selected environment
5. Other explicitly configured project source

Inspect existing files before concluding the URL is missing.

Do not use unlabeled, commented, or POTENTIAL hosts as confirmed URLs.

Do not invent URLs.

If no confirmed URL exists:

```text
Environment URL: MISSING
Environment Setup Status: INCOMPLETE
Environment Readiness Status: NOT READY
Blocker: Environment URL not identified
```

Return the artifact to the Router Agent.

---

## Step 7 — Environment Setup

Perform only operations supported by existing tools and configuration:

1. Record the selected environment.
2. Load the matching configuration when a project config file exists.
3. Bind downstream information to the confirmed URL (do not write secrets; do not change production configuration unless authorized).
4. Verify the URL string is present and associated with the selected environment.

Do not simulate successful setup.

If a setup operation fails, set:

```text
Environment Setup Status: FAILED
Environment Readiness Status: NOT READY
```

---

## Step 8 — Environment Readiness Verification

Distinguish these states. Do not set Ready from selection alone.

| State | Meaning |
| --- | --- |
| Environment Selected | Mapping succeeded |
| Environment Setup Completed | Supported setup steps succeeded |
| Environment Accessible | A real accessibility check succeeded |
| Environment Ready | Required checks for the intended activity succeeded |

When tools allow, perform minimum verification only:

- HTTP or browser reachability of the confirmed URL
- Presence of required non-secret configuration
- Minimum smoke that the application responds

Do not perform functional test execution.

If a check cannot be run, record `NOT PERFORMED` and the missing tool or information.

Do not report Ready when accessibility or required setup is unverified.

---

## Step 9 — Environment Artifact

Produce this artifact and return it to the Router Agent.

```text
# Environment Artifact

User Story ID:
User Story Status:

Front-end Sub-task:
Front-end Sub-task Status:

Back-end Sub-task:
Back-end Sub-task Status:

Selected Environment:
Environment Setup Status:
Environment URL:
Environment Readiness Status:

Blockers / Missing Information / Limitations:
```

Allowed values when unknown or blocked:

- `NOT SELECTED`
- `NOT STARTED`
- `INCOMPLETE`
- `FAILED`
- `MISSING`
- `UNKNOWN`
- `NOT PERFORMED`
- `REQUIRES CLARIFICATION`
- `NOT READY`

Use `READY` only when Selected, Setup Completed, and Accessible are all verified for the intended activity.

Optional supporting checks (components, APIs, database, test data, tools) may be attached when evidence exists. They do not replace the required fields.

Do not include passwords, tokens, or other secrets.

---

## Validation and Completion Criteria

The Skill is complete when all of the following are true:

1. Jira retrieval was attempted with the available integration.
2. User Story status is reported from Jira, or retrieval failure is reported.
3. Front-end and Back-end Sub-tasks were identified or reported missing/ambiguous.
4. Sub-task statuses were read from Jira or a blocker was returned.
5. Environment selection used only the supported mapping, or no mapping was reported.
6. URL was taken from a project source or reported missing.
7. Setup was performed where supported, or failure/incompleteness was reported.
8. Readiness states are distinguished and not inferred from selection alone.
9. The Environment Artifact contains the required fields.
10. The artifact is returned to the Router Agent.

Do not mark the activity complete without the Environment Artifact.
