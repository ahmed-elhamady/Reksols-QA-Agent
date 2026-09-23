---
name: test-case-automation
description: Convert eligible functional test cases from a Test Case Artifact or Jira User Story into Automated Test Cases after QA review, and return a Test Case Automation Artifact to the Router Agent. Use when the Test Case Automation Agent receives those inputs.
---

# Test Case Automation

## Purpose

Convert eligible functional test cases into Automated Test Cases for the framework workflow and return one Test Case Automation Artifact to the Router Agent.

The owning Agent is the Test Case Automation Agent.

Do not invent locators, endpoints, test data, expected results, or application behavior.

Do not create or modify the automation framework.

Do not execute tests as part of this Skill.

---

## Preconditions

- Router provided a Test Case Artifact, or a Jira User Story ID
- Jira integration is used only when fallback retrieval is required
- Locator Inspection Artifact is used when the Router provides it
- QA has not yet approved the Automated Test Cases

If neither source exists, stop with `REQUIRES CLARIFICATION`.

---

## Inputs

Priority order:

1. Test Case Artifact (Test Case Creation Agent)
2. Approved supporting artifacts from the Router (Locator Inspection, Environment, others)
3. Jira Story (fallback)
4. Existing automation or framework information already in the workspace
5. Other explicitly authorized project sources

---

## Execution Workflow

```text
Receive input from Router
      ↓
Test Case Artifact available?
      ├── YES → Use Artifact
      └── NO  → Retrieve Jira Story → Identify testable scenarios
      ↓
Analyze each Test Case
      ↓
Determine AUTOMATABLE / NOT AUTOMATABLE / BLOCKED
      ↓
Convert AUTOMATABLE cases
      ↓
Validate generated Automated Test Cases
      ↓
Present to QA (PENDING QA REVIEW)
      ↓
Approved? ── NO → Rework rejected cases → QA Review
      ↓ YES
Build Test Case Automation Artifact
      ↓
Return Artifact to Router
```

---

## Step 1 — Identify Source

If the Test Case Artifact is present, set:

```text
Source: Test Case Artifact
```

Use its test cases. Do not recreate them.

If it is absent, retrieve the Jira issue by key using the available Jira integration. Read title, description, acceptance criteria, and returned linked information.

```text
Source: Jira Story
```

If retrieval fails:

```text
Completion Status: BLOCKED
Blocker: Jira Story cannot be retrieved
```

Do not invent the Story. State that fallback Automated Test Cases, if any later, were derived from Jira rather than a Test Case Artifact.

---

## Step 2 — Analyze Test Cases

For each original case (or each Jira-supported scenario on fallback), record:

- Original Test Case ID and title
- Objective, preconditions, data, steps, expected results
- UI vs API behavior supported by evidence
- Dependencies

Preserve original intent. Do not add behavior that is not in the source.

On Jira fallback, identify only testable scenarios supported by the Story. Do not invent requirements.

---

## Step 3 — Automation Eligibility

Classify each case:

| Status | When |
| --- | --- |
| `AUTOMATABLE` | Enough evidence for a deterministic automated test (clear behavior, input, expected result, target, and available required data) |
| `NOT AUTOMATABLE` | Behavior is outside supported automation scope. Document the reason. Do not use this only because information is missing. |
| `BLOCKED` | Automation may be possible but data, environment, account, API information, locator, dependency, or expected result is missing |

Automation type from evidence and project conventions:

```text
UI Automation → Playwright
API Automation → REST Assured
```

Do not introduce another technology.

Do not invent an API endpoint, locator, URL, or expected result.

If a UI case needs a locator and the Locator Inspection Artifact does not provide it, mark `BLOCKED`. Do not invent the locator. Do not perform Locator Inspection.

---

## Step 4 — Convert AUTOMATABLE Cases

Create an Automated Test Case. Keep expected behavior unchanged.

Where applicable:

```text
Original Test Case ID:
Original Test Case Title:
Automation Status:
Automated Test Case Name:
Objective:
Preconditions:
Test Data:
Automation Steps:
Expected Results / Assertions:
Required Dependencies:
Required Locators or Automation Targets:
Target Type: UI | API
Notes:
Source:
```

Automated Test Case ID: if no other convention exists, prefix the original ID with `ATC-` (`TC-01` → `ATC-01`).

Automation Steps must be deterministic and implementation-ready for later Framework Creation. Do not write Playwright or REST Assured project files in this Skill.

---

## Step 5 — Validate Before QA

Confirm:

- Every automated case traces to an original Test Case or Jira requirement
- Steps are deterministic
- Expected results are explicit
- Test data is identifiable or marked missing
- Dependencies are identified
- Locators/targets are present from the Locator Inspection Artifact or marked missing (`BLOCKED`)
- No unsupported behavior was invented
- Automation type matches Playwright UI or REST Assured API
- Business intent is unchanged

Present only validated Automated Test Cases to QA. Keep NOT AUTOMATABLE and BLOCKED visible for review, not as approved automations.

---

## Step 6 — QA Review and Rework

Set review state `PENDING QA REVIEW`.

QA reviews: automation decision, steps, data, assertions, traceability, dependencies, targets, gaps, issues.

If approved: `APPROVED`.

If rejected: `REJECTED — REWORK REQUIRED`. Capture feedback, update only rejected cases, re-validate, present again until approval or an explicit stop.

Do not finalize the artifact until QA approves the Automated Test Cases that will be included.

---

## Step 7 — Test Case Automation Artifact

After QA approval, return this artifact to the Router Agent.

```text
# Test Case Automation Artifact

Story:
Source:
Completion Status:

Automation Summary:
- Total Test Cases
- Automatable
- Automated
- Not Automatable
- Blocked

Automated Test Cases:
1. Original Test Case ID
2. Automated Test Case ID
3. Automated Test Case Name
4. Automation Type
5. Preconditions
6. Test Data
7. Automation Steps
8. Assertions / Expected Results
9. Dependencies
10. Required Locators / Targets
11. QA Review Status

Not Automatable Test Cases:
Blocked Test Cases:
QA Review Status:
Dependencies / Blockers:
```

Include only actually converted, QA-approved cases in Automated Test Cases.

Report NOT AUTOMATABLE and BLOCKED separately.

Do not report simulated automation.

---

## Completion Criteria

The Skill is complete when:

1. The source was identified.
2. Test cases were analyzed.
3. Eligibility was determined.
4. Eligible cases were converted.
5. Non-automatable and blocked cases were identified.
6. Automated Test Cases were validated.
7. Cases were presented to QA.
8. QA review completed (including rework if required).
9. Approved cases are in the artifact.
10. The Test Case Automation Artifact was returned to the Router Agent.
