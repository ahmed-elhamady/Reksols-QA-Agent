---
name: pipeline-execution
description: Execute an approved CI/CD pipeline from a Pipeline Creation Artifact, monitor stages, collect screenshots logs and reports, and return a Pipeline Execution Artifact. Use for normal runs, bug re-tests, and story regression re-runs after explicit QA approval.
---

# Pipeline Execution

## Purpose

Execute an already-created pipeline on the actual automation project, collect evidence, and return a Pipeline Execution Artifact to the Router after QA review.

The owning Agent is the Pipeline Execution Agent.

Do not create the pipeline, framework, automated tests, or bugs.

Do not simulate execution.

---

## Inputs

Primary: approved Pipeline Creation Artifact.

Supporting, when the Router provides them:

- Automation project path (for this repo, typically `automation/ui-playwright` when that project is the target)
- Test Case Automation Artifact
- Framework Creation Artifact
- Environment Artifact
- Prior Pipeline Execution Artifact
- Bug ID for re-test
- User Story ID for story regression

---

## Execution Workflow

```text
Receive Pipeline Creation Artifact
      ↓
Validate execution prerequisites
      ↓
Prepare Execution Plan
      ↓
QA Approval
      ↓
Execute pipeline or scoped tests
      ↓
Monitor stages
      ↓
Analyze results
      ↓
Collect screenshots / logs / reports
      ↓
Generate Pipeline Execution Artifact
      ↓
QA Review
      ↓
Return artifact to Router
```

---

## Step 1 — Determine Execution Type

Set `execution_type` from the QA request:

- `NORMAL` — execute the pipeline
- `BUG_RETEST` — re-test one bug's related automated test
- `STORY_REGRESSION` — re-run all automated tests for the Story

If the type is unclear: `REQUIRES CLARIFICATION`.

---

## Step 2 — Validate the Pipeline Creation Artifact

Confirm:

- Platform is defined
- Pipeline definition path exists, or stage commands are present
- Automation project is accessible
- Branch is available if specified
- Environment is known or `UNKNOWN`
- Variable names are known
- Secrets can be supplied through the approved mechanism (names only in the artifact)
- Test commands exist
- Dependencies required by those commands exist

If not: `BLOCKED` or `REQUIRES CLARIFICATION`. Do not execute.

Use artifact fields instead of rediscovering design. Inspect the project only to confirm paths, run commands, and collect files.

---

## Step 3 — Mode-Specific Scope

### NORMAL

Use stages and commands from the Pipeline Creation Artifact.

### BUG_RETEST

Establish Bug → Test Case → Automated Test from evidence.

If unknown: `REQUIRES CLARIFICATION`. Do not run the full pipeline unless QA asks for it.

### STORY_REGRESSION

Identify all automated tests for the Story from the Test Case Automation Artifact, Jira Story, test IDs, project metadata, or Router context.

Do not include unrelated tests unless QA requests a broader scope.

Do not start regression because one bug was fixed. Require an explicit QA re-run request.

---

## Step 4 — Present Execution Plan to QA

Present pipeline name, platform, branch, environment, tests/scope, stages, execution type, and blockers.

Wait for explicit approval of this run.

Do not treat silence or an older approval as approval.

---

## Step 5 — Execute

After approval, execute the real mechanism from the artifact:

- GitHub Actions, GitLab CI, Jenkins, or Azure DevOps only when that platform is in the artifact and the tool actually works
- Otherwise the artifact's real stage commands in the automation project (for this repo, `cd automation/ui-playwright` then the recorded command such as `npx playwright test` when that is the artifact command)

Do not assume a platform.

If neither CI nor recorded commands can be run: `BLOCKED`.

Capture stdout/stderr. Do not invent a run ID. Use the CI run ID when the platform returns one. If none is returned, set `run_id: UNKNOWN` and name files with the observed execution timestamp.

---

## Step 6 — Monitor Stages

Use stages from the artifact or the actual run.

For each stage record `PASSED`, `FAILED`, `SKIPPED`, `CANCELLED`, or `BLOCKED`.

Classify setup/install/build problems separately from test failures when evidence supports it.

Do not invent stage results.

---

## Step 7 — Analyze Test Results

Read the actual report (for Playwright, `playwright-report/` and/or JSON/list output when those files exist).

Record `total`, `passed`, `failed`, `skipped` only from that report.

If the report is missing or incomplete, do not fabricate counts. Mark them `UNKNOWN` and explain.

For each failed test record name, Test Case ID if available, failure type from evidence, message, stage, environment, and evidence availability.

If the cause is not evidenced: `UNKNOWN`.

Do not treat a failed test as a product bug.

---

## Step 8 — Collect Evidence

Under the automation project root (example: `automation/ui-playwright/`):

```text
screenshots/
logs/
reports/
```

Create these directories if they do not exist and permissions allow. If the project already stores equivalent evidence in a required location, reuse it and record the actual path.

Copy or save:

- Failed UI screenshots as `<Test_Case_Name>_bug.png` (add `_01`, `_02` for repeats)
- Run log as `logs/pipeline-run-<run-id-or-timestamp>.log`
- Real report as `reports/pipeline-run-<run-id-or-timestamp>-report.<ext>`

Playwright may first write `test-results/` and `playwright-report/`. Collect from those actual files into `screenshots/`, `logs/`, and `reports/` when collecting evidence. Do not invent screenshot pixels or HTML reports.

Redact secrets in logs when they can be safely removed.

If a file cannot be collected: `Evidence unavailable` and the reason.

Verify each reported path exists and belongs to this run.

---

## Step 9 — Pipeline Execution Artifact

Adapt to the actual run. Do not fill unobserved values.

```yaml
pipeline_execution:
  pipeline:
  run_id:
  branch:
  environment:
  execution_type: NORMAL | BUG_RETEST | STORY_REGRESSION
  story:
    id:
    scope:
  status: PASSED | FAILED | PARTIAL | BLOCKED | CANCELLED
  duration:
  stages: {}
  tests:
    total:
    passed:
    failed:
    skipped:
  failures:
    - test:
      test_case_id:
      type:
      status: FAILED
      evidence:
        screenshot:
        logs:
        report:
      failure_details:
  evidence:
    screenshots:
      path: screenshots/
    logs:
      path:
    reports:
      path:
  next_action:
    requires_investigation:
  qa_review:
    status: PENDING QA REVIEW
```

For `BUG_RETEST` also include Bug ID, related Test Case, automated test, previous failure, current result (`RETEST PASSED` or `RETEST FAILED`), and evidence.

---

## Step 10 — QA Review and Router Handoff

Present the artifact. QA reviews status, stages, counts, failures, evidence, execution type, and story scope.

After review, return the artifact to the Router. Do not bypass the Router.

The Router may send it to Bug Creation / failed-test analysis. This Agent does not create bugs.

---

## Completion Criteria

Complete a normal run when the artifact was received, preconditions validated, QA approved execution, the run actually happened, stages and tests were analyzed from evidence, evidence paths were stored when available, the Pipeline Execution Artifact was generated, QA reviewed it, and it was returned to the Router.

Complete a re-test when QA requested it, Bug → Test Case was established, only that automated test ran (unless QA widened scope), and the actual re-test result was reported.

Complete story regression when QA requested it, all Story automated tests were identified and executed, and a new Pipeline Execution Artifact was produced.
