---
name: bug-creation
description: Drafts and creates Jira Bugs for failed automated field tests from Pipeline Execution evidence and Automated Field Test Cases Analysis root causes after QA approval, then returns a Bug Creation Artifact. Use for Bug Creation, FRONT-END/BACK-END classification, BLOCKS story linking, and evidence attachment.
---

# Bug Creation

## Purpose

Create Jira Bugs for failed automated field tests when execution evidence and the approved Automated Field Test Cases Analysis Artifact support an application defect.

The owning Agent is the Bug Creation Agent.

Do not execute pipelines. Do not replace root-cause analysis. Do not simulate Jira.

---

## Inputs

From the Router:

- Pipeline Execution Artifact (primary evidence source)
- Automated Field Test Cases Analysis Artifact (sole root-cause source)

Supporting, when provided:

- User Story ID
- UI automation project path (typically `automation/ui-playwright`)
- Test Case Automation Artifact
- Approved Test Case / Acceptance Criteria

---

## Execution Workflow

```text
Receive artifacts from Router
        ↓
Identify failed automated field tests
        ↓
Read evidence at artifact paths
        ↓
Correlate with analysis root cause
        ↓
Determine Bug Type (FRONT-END | BACK-END)
        ↓
Build Bug Drafts
        ↓
QA Review of drafts
        ↓
QA Approval
        ↓
Create Bugs on Jira
        ↓
Link Bug BLOCKS User Story
        ↓
Attach evidence
        ↓
Assign developer
        ↓
Generate Bug Creation Report
        ↓
QA Review of report
        ↓
Return Bug Creation Artifact to Router
```

---

## Step 1 — Preconditions

Require both primary artifacts.

The analysis artifact must be QA-reviewed/approved when the Router presents it as ready for Bug Creation.

If missing: `BLOCKED` / `REQUIRES CLARIFICATION`.

Do not proceed to Jira writes in this step.

---

## Step 2 — Identify Failed Tests

From the Pipeline Execution Artifact, list tests with failed status.

Record for each:

- Test name / automated test id
- Test Case ID when present
- Run ID / environment / stage
- Failure message
- Evidence paths (`screenshot`, `logs`, `report`, CURL when present)

Confirm the failure from actual evidence (report/log). Do not draft a Bug for an unverified failure.

---

## Step 3 — Read Evidence

Open the paths in the artifact. Typical automation-project locations:

```text
screenshots/
logs/
reports/
curls/
```

Use the path the Pipeline Execution Artifact recorded, not a guessed path.

Extract only what is needed: assertion/error, failed step, HTTP status from CURL/log, screenshot file existence.

If a file is missing: `Screenshot missing` / `Logs unavailable` / `Report unavailable` / `CURL missing`. Do not invent contents.

---

## Step 4 — Correlate Root Cause

Match each failed test to the Automated Field Test Cases Analysis Artifact.

Copy into the Bug Draft:

- Root Cause
- Root Cause Category
- Root Cause Description
- Confidence
- Additional investigation when present

Do not invent a new root cause. Do not override the analysis conclusion.

If there is no matching analysis row: `REQUIRES CLARIFICATION`.

If `root_cause.category` is not `APPLICATION_DEFECT`, do not create a product Bug. Record the case as not eligible for Bug Creation (automation/environment/data/other) unless QA explicitly directs a Bug with evidence.

If `additional_investigation.required` is true and evidence is insufficient: mark investigation; do not create.

---

## Step 5 — Determine Bug Type

Set `FRONT-END` or `BACK-END` from analysis + execution evidence + failing behavior.

Examples of evidence (use only if present):

- UI assertion / screenshot of wrong page state → often `FRONT-END`
- HTTP/API status, payload, or CURL failure → often `BACK-END`

If sources conflict or are insufficient: `REQUIRES CLARIFICATION`. Do not guess.

---

## Step 6 — Build Bug Drafts

One draft per eligible failed test. One title only:

```text
<Feature/Page> - <Bug Title>
```

Derive Feature/Page from the test, story, or execution context.

Each draft must contain:

1. **Title** — format above
2. **Description** — defect supported by evidence only
3. **Steps to Reproduce** — from the automated test / execution, not invented steps
4. **Evidence**
   - FRONT-END: Screenshot (actual file path)
   - BACK-END: Screenshot and CURL (actual file paths)
5. **Expected Result** — from test case, AC, or execution context. If unknown: `REQUIRES CLARIFICATION`
6. **Actual Result** — from execution evidence
7. **Root Cause** — from the analysis artifact (verbatim meaning, not a new cause)
8. **Priority** — only if evidenced; otherwise `REQUIRES CLARIFICATION`
9. **Bug Type** — `FRONT-END` or `BACK-END`
10. **Assignee**
    - FRONT-END: `Mohamed Sanhouri`
    - BACK-END: `Mahmoud Rizk`

Present drafts with:

```text
qa_review.status: PENDING REVIEW
jira_creation: NOT PERFORMED
```

---

## Step 7 — QA Review of Drafts

Present all drafts to QA.

Wait for explicit approval per Bug or for the set.

On rejection: update the draft from feedback and evidence, present again, wait.

Do not create Jira issues in this step.

---

## Step 8 — Prepare Jira

After approval, for each approved Bug with no `REQUIRES CLARIFICATION` blockers:

1. `getAccessibleAtlassianResources` → `cloudId`
2. Derive `projectKey` from the User Story key (do not guess a project if the Story ID is unknown)
3. Resolve assignee with `listJiraIssueAssignableUsers` (or equivalent) to the required display name; use the returned account ID
4. Confirm screenshot file exists
5. For BACK-END, confirm CURL file exists and will be attached unmodified

If Story ID is unknown: `REQUIRES CLARIFICATION` and skip Jira creation for that Bug.

If BACK-END CURL is missing: skip Jira creation for that Bug.

---

## Step 9 — Create, Attach, Assign, Link

Use real tools only.

### Create

`createJiraIssue`:

- `issueType`: `Bug`
- `summary`: approved title
- `description`: markdown with Description, Steps, Expected, Actual, Root Cause, Bug Type, evidence path names
- `priority`: approved/evidenced priority name
- `assignee`: resolved account ID
- `projectKey`: from the Story

Capture the actual `key` and `id` from the tool response. Never fabricate them.

### Attach

`executeWrite` → `uploadAttachmentToJiraIssue` (phase 1 `filePath`, run returned upload command, phase 2 `fileId`):

- Always attach the failure screenshot when the Bug is created
- BACK-END: also attach the CURL file from the evidence path
- FRONT-END: CURL only if present and relevant

### Link

`executeWrite` → `createJiraIssueLink`:

- `linkType`: `Blocks`
- `inwardIssue`: created Bug key
- `outwardIssue`: User Story key

This is `BUG --BLOCKS--> USER STORY`.

Verify with `getJiraIssue` when needed. If link creation fails, report it; do not claim the relationship exists.

### CURL integrity

Never generate a CURL. Never edit the request so that it is no longer the captured evidence. You may wrap the real file contents in the description as a fenced block in addition to attaching the file.

---

## Step 10 — Bug Creation Report and Artifact

After creation attempts for the Story, build the artifact from actual results.

```yaml
bug_creation:
  story:
    id: "<USER STORY ID>"
  status: PENDING QA REVIEW
  bugs:
    - bug_id: "<ACTUAL JIRA BUG KEY>"
      bug_numeric_id: "<ACTUAL JIRA ID IF RETURNED>"
      title: "<ACTUAL BUG TITLE>"
      priority: "<ACTUAL PRIORITY>"
      type: "<FRONT-END | BACK-END>"
      assignee: "<ACTUAL ASSIGNEE>"
      evidence_attachments:
        screenshot: "<ACTUAL PATH OR JIRA ATTACHMENT RESULT>"
        curl: "<ACTUAL PATH, JIRA ATTACHMENT RESULT, OR NOT APPLICABLE>"
      story_link:
        type: BLOCKS
        story_id: "<USER STORY ID>"
        status: CREATED | FAILED | REQUIRES CLARIFICATION
  skipped:
    - test:
      reason:
  total: <ACTUAL NUMBER CREATED>
  qa_review:
    status: PENDING REVIEW
```

`total` is the count of Bugs actually created, not drafts.

Do not put invented keys in `bugs`.

---

## Step 11 — Final QA Review and Router Handoff

Present the Bug Creation Artifact to QA.

After explicit approval: `qa_review.status: APPROVED` and return the artifact to the Router.

On rejection: correct using real Jira/evidence state (do not invent), present again.

Do not bypass the Router.

---

## Jira Tools

Use the available Atlassian integration:

| Action | Tool / operation |
| --- | --- |
| Site | `getAccessibleAtlassianResources` |
| Read story | `getJiraIssue` |
| Create Bug | `createJiraIssue` |
| Assign / fields | `createJiraIssue` / `editJiraIssue` |
| Assignable users | `listJiraIssueAssignableUsers` |
| Attach file | `executeWrite` `uploadAttachmentToJiraIssue` |
| BLOCKS link | `executeWrite` `createJiraIssueLink` |
| Link types | `executeRead` `listJiraIssueLinkTypes` when the site name must be confirmed |

If issue type `Bug` is rejected, use the allowed type from the tool error. Do not invent a type.

---

## Completion Criteria

Complete when failed tests were identified from the Pipeline Execution Artifact, evidence paths were read or marked missing, root causes were taken from the analysis artifact, Bug Types were evidence-based, drafts were QA-approved, Jira create/attach/assign/BLOCKS used real tools, the Bug Creation Artifact used actual keys and `total`, final QA review passed, and the artifact was returned to the Router.
