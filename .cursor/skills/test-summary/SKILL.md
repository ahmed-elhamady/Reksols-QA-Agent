---
name: test-summary
description: Aggregates Story, Feature, or Sprint QA results from Pipeline Execution evidence and related artifacts into a Test Summary Report after QA review, then returns a Test Summary Artifact. Use for test summary, execution counts, bugs, regression, automation, coverage, and environment reporting.
---

# Test Summary

## Purpose

Produce an evidence-based Test Summary Report for a Story, Feature, or Sprint and return an approved Test Summary Artifact to the Router.

The owning Agent is the Test Summary Agent.

Do not execute pipelines, create bugs, invent counts, or simulate Jira.

---

## Inputs

Router must provide:

- `scope.type`: `STORY` | `FEATURE` | `SPRINT`
- `scope.target`: Story ID, Feature name/id, or Sprint name/id

Primary execution source: Pipeline Execution Artifact.

Supporting, when provided:

- Bug Creation Artifact
- Automated Field Test Cases Analysis Artifact
- Test Case Artifact
- Test Case Automation Artifact
- Test Plan Artifact
- Environment Artifact
- UI automation project path (typically `automation/ui-playwright`)

Jira (read-only) for live story/feature/sprint/bug data.

---

## Execution Workflow

```text
Receive Router request
        ↓
Determine scope STORY | FEATURE | SPRINT
        ↓
Collect artifacts and Jira membership
        ↓
Read Pipeline Execution evidence
        ↓
Aggregate execution / bugs / failures / regression / automation / coverage / environment
        ↓
Generate Test Summary Report
        ↓
QA Review
        ↓
Approved Test Summary Artifact
        ↓
Return to Router
```

---

## Step 1 — Identify Scope

If type or target is missing or ambiguous: `REQUIRES CLARIFICATION`. Do not guess.

Do not start a Sprint summary unless the Router requested `SPRINT`.

---

## Step 2 — Story Workflow

```text
Story ID
      ↓
Collect Pipeline Execution Artifact(s) for that story
      ↓
Collect related artifacts
      ↓
Read evidence
      ↓
Aggregate
      ↓
Story Test Summary
```

Retrieve the Story with `getJiraIssue` when a key is given. Do not invent the Story.

---

## Step 3 — Feature Workflow

```text
Feature
      ↓
Identify related Stories from Jira/artifacts only
      ↓
Collect testing artifacts per Story
      ↓
Aggregate
      ↓
Feature Test Summary
```

Do not assume Feature membership. If relationships cannot be confirmed: `REQUIRES CLARIFICATION` and list what is missing. Do not silently drop known Stories.

---

## Step 4 — Sprint Workflow

```text
Sprint
      ↓
Identify Stories/Features in the Sprint from Jira
      ↓
Collect available QA artifacts
      ↓
Aggregate
      ↓
Sprint Test Summary
```

Use `searchJiraIssuesUsingJql` (and related reads) with the actual Sprint name/id. Do not invent Sprint contents.

If some Stories lack execution data, include them with `UNKNOWN` / missing-information notes.

---

## Step 5 — Collect Artifacts and Evidence

Prefer Router-provided artifacts.

Open Pipeline Execution `evidence` paths (reports, logs, screenshots, CURL). Typical project folders:

```text
screenshots/
logs/
reports/
curls/
```

Use recorded paths. If a file is missing: mark unavailable. Do not invent contents.

Inspect `automation/ui-playwright` read-only when needed to verify automated tests exist or how they are organized.

---

## Step 6 — Testing Scope

Record:

- Scope type and target
- Functionality tested (from story/feature/sprint and artifacts)
- Activities actually performed (design, automation, execution, analysis, bug creation) when artifacts exist
- Test types only when evidence supports them

Do not expand scope beyond evidence.

---

## Step 7 — Execution Results

From Pipeline Execution Artifact `tests` (and reports when the artifact points to them):

```yaml
execution:
  total:
  passed:
  failed:
  skipped:
  paused:
```

Use actual numbers. Do not calculate unsupported values.

Keep FAILED, SKIPPED, and PAUSED separate.

If multiple runs exist for the scope, list each run and only sum when the datasets are the same kind of run and complete. Otherwise do not merge.

`execution_type`: `NORMAL` is not treated as regression.

---

## Step 8 — Bugs

From Bug Creation Artifact keys plus Jira `getJiraIssue` / JQL for current status.

Report:

- Total / Open / Resolved / Closed (only when Jira or artifact supports each)
- Priority, status, FRONT-END / BACK-END when available
- Jira key

Resolved vs unresolved from **current** Jira status/resolution, not from creation alone.

If status cannot be verified: `UNKNOWN` or `REQUIRES CLARIFICATION`.

Do not write to Jira.

---

## Step 9 — Failure Reasons

Summarize major causes from the Automated Field Test Cases Analysis Artifact, then execution evidence.

Copy category/description from analysis. Do not invent root causes.

Allowed categories only when supported:

```text
APPLICATION_DEFECT
AUTOMATION_DEFECT
LOCATOR_ISSUE
TEST_DATA_ISSUE
ENVIRONMENT_ISSUE
CONFIGURATION_ISSUE
INFRASTRUCTURE_ISSUE
DEPENDENCY_ISSUE
AUTHENTICATION_ISSUE
NETWORK_ISSUE
UNKNOWN
```

Aggregate affected-test counts from analysis rows, not from guessed grouping.

---

## Step 10 — Regression

If `execution_type` is `STORY_REGRESSION` (or evidence explicitly labels a regression run): `REGRESSION EXECUTED` and report total/passed/failed/skipped/paused when present, status, and failed tests.

Otherwise: `REGRESSION NOT EXECUTED` / `Regression was not executed.` / `executed: false`.

Do not treat `NORMAL` or `BUG_RETEST` as full story regression unless QA/artifact names it as regression.

---

## Step 11 — Automation Results

- `total` automated cases: Test Case Automation Artifact (QA-approved automated cases)
- `executed` / passed / failed / skipped / paused: Pipeline Execution Artifact

List automation failures and automation-related analysis categories when present.

Do not use Test Case written count as automated or executed count.

---

## Step 12 — Coverage

```yaml
coverage:
  test_cases_written:
  automated_test_cases:
  executed_test_cases:
  passed_test_cases:
  failed_test_cases:
  skipped_test_cases:
```

Each field from its source or `UNKNOWN`.

Do not invent a percentage. If a percentage cannot be computed from complete compatible counts, say so.

---

## Step 13 — Environment

From Pipeline Execution `environment`, Environment Artifact, or execution config.

List each distinct environment. If none: `UNKNOWN`.

---

## Step 14 — Report Structure

Required sections (do not omit):

1. Summary Scope
2. Testing Scope
3. Test Execution Results
4. Bugs Summary
5. Main Failure Reasons
6. Regression Results
7. Automation Results
8. Resolved Bugs
9. Unresolved Bugs
10. Testing Coverage
11. Testing Environment
12. Overall Testing Summary

Additional sections only when supported.

Present with `qa_review.status: PENDING REVIEW`.

---

## Step 15 — Artifact

```yaml
test_summary:
  scope:
    type: "STORY" # or FEATURE | SPRINT
    target: "<id or name>"
  testing_scope:
    summary:
  execution:
    total:
    passed:
    failed:
    skipped:
    paused:
  bugs:
    total:
    open:
    resolved:
    closed:
  failure_reasons:
    - reason:
      category:
      affected_tests:
  regression:
    executed: false
    total:
    passed:
    failed:
    skipped:
    paused:
    status:
  automation:
    total:
    executed:
    passed:
    failed:
    skipped:
    paused:
  coverage:
    test_cases_written:
    automated_test_cases:
    executed_test_cases:
    passed_test_cases:
    failed_test_cases:
    skipped_test_cases:
  environments: []
  resolved_bugs: []
  unresolved_bugs: []
  gaps: []
  qa_review:
    status: PENDING REVIEW
```

Use actual values or explicit `UNKNOWN`. Do not fabricate zeros to look complete unless the source reports zero.

---

## Step 16 — QA Review and Router Handoff

Wait for explicit QA approval.

On rejection: update from real artifacts/Jira, present again.

After approval: `qa_review.status: APPROVED` and return the Test Summary Artifact to the Router.

---

## Jira Tools (read-only)

| Action | Tool |
| --- | --- |
| Site | `getAccessibleAtlassianResources` |
| Story / Bug | `getJiraIssue` |
| Sprint / Feature membership / bugs | `searchJiraIssuesUsingJql` |

Do not call create/edit/transition/link/comment tools.

---

## Completion Criteria

Complete when scope was identified, artifacts/Jira were read or gaps listed, execution/bugs/failures/regression/automation/coverage/environment used real data, all 12 report sections exist, QA approved, and the Test Summary Artifact was returned to the Router.
