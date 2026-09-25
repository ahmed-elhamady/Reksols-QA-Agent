---
name: automated-field-test-cases-analysis
description: Analyze failed automated tests from a Pipeline Execution Artifact by correlating logs, screenshots, reports, and automation code, then return an Automated Field Test Cases Analysis Artifact after QA review. Use for evidence-based root cause analysis, not bug creation or pipeline execution.
---

# Automated Field Test Cases Analysis

## Purpose

Determine the most evidence-supported root cause for each failed automated test from Pipeline Execution evidence.

The owning Agent is the Automated Field Test Cases Analysis Agent.

Do not execute the pipeline, create bugs, create tests, or modify code.

---

## Inputs

Primary: Pipeline Execution Artifact.

Supporting, when provided:

- UI automation project (typically `automation/ui-playwright`)
- Test Case Automation Artifact
- Environment Artifact
- Approved Test Case / Acceptance Criteria

---

## Execution Workflow

```text
Receive Pipeline Execution Artifact
      ↓
Identify failed tests
      ↓
Locate logs / screenshots / reports
      ↓
Inspect relevant automation code
      ↓
Correlate evidence
      ↓
Determine root cause, category, confidence
      ↓
Generate Automated Field Test Cases Analysis Artifact
      ↓
QA Review
      ↓
Rework rejected items if needed
      ↓
Return approved artifact to Router
```

---

## Step 1 — Preconditions

Require a Pipeline Execution Artifact that identifies failed tests and evidence paths.

If missing: `BLOCKED` / `REQUIRES CLARIFICATION`.

Do not analyze passing or unrelated tests unless QA asks.

---

## Step 2 — Identify Each Failure

From the artifact, record:

- Test name
- Test Case ID
- Automated Test ID
- Run ID
- Environment
- Failure stage
- Failure type
- Failure message
- Evidence paths

Confirm the failure from actual evidence. Do not analyze an unverified failure.

---

## Step 3 — Collect Evidence

Open the referenced log, screenshot, and report files when they exist.

Extract relevant errors, stack traces, assertion text, timeouts, HTTP/auth/locator/network messages. Do not paste entire logs.

If a file is missing: `Screenshot missing` / `Logs unavailable` / `Report unavailable` — do not invent contents.

Inspect only the automation files for that test: steps, locators, assertions, waits, data, fixtures, auth, Page Objects, config.

Do not modify those files.

---

## Step 4 — Analyze

For logs: Observed Error → Failure Location → Failure Context.

For errors: use the actual message. Do not map `TimeoutError` automatically to `APPLICATION_DEFECT`.

For screenshots: correlate visible state with expected step, error, and test code. Do not conclude from appearance alone if evidence is thin.

For reports: use failed step, assertion, duration, retries, traces when present.

---

## Step 5 — Correlate and Determine Root Cause

Combine:

```text
Failure + Error + Screenshot + Test code + Environment → Root Cause
```

If sources agree, state the conclusion and confidence.

If they conflict, document the conflict. Do not pick one source arbitrarily. If unresolved: `ROOT CAUSE = UNKNOWN` and `additional_investigation.required: true`.

For each failure record:

- Failure (what failed)
- Evidence (paths and excerpts)
- Analysis (what evidence indicates)
- Root cause description
- Category
- Confidence (`HIGH` | `MEDIUM` | `LOW` | `UNKNOWN`)
- Additional investigation

Separate Observed Fact from Root Cause Conclusion.

Preserve expected behavior from an approved Test Case or Acceptance Criteria when available. If unknown: `REQUIRES CLARIFICATION`.

---

## Step 6 — Artifact

Do not populate unsupported values.

```yaml
automated_field_test_cases_analysis:
  pipeline:
    name:
    run_id:
    environment:
  story:
    id:
  analysis_status: PENDING QA REVIEW
  failures:
    - test_case_id:
      automated_test:
      failure:
        type:
        status: FAILED
      evidence:
        screenshot:
        logs:
        report:
      observed_behavior:
      error_message:
      analysis:
      root_cause:
        category:
        description:
        confidence:
      additional_investigation:
        required:
        reason:
      qa_review:
        status: PENDING QA REVIEW
```

This artifact must be usable by Bug Creation: which test failed, what happened, evidence, root cause, category, confidence, further investigation.

---

## Step 7 — QA Review and Rework

Present the artifact. It is not final until QA review.

On rejection: capture feedback, re-inspect affected failures only, update root cause and confidence, present again.

Do not mark a rejected analysis as approved.

---

## Step 8 — Router Handoff

After approval, return the artifact to the Router. The Router may send `APPLICATION_DEFECT` cases to Bug Creation.

Do not create Jira issues.

---

## Completion Criteria

Complete when failed tests were identified from the Pipeline Execution Artifact, available evidence and relevant automation code were inspected, sources were correlated, root cause/category/confidence were set or marked `UNKNOWN`, missing evidence was documented, QA reviewed (including rework), and the approved Automated Field Test Cases Analysis Artifact was returned to the Router.
