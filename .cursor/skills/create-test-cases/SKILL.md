---
name: create-test-cases
description: Create QA test cases from a Requirement Analysis Artifact or User Story. Design positive, negative, acceptance-criteria, and edge-case coverage with Validate/Ensure structure, automation-ready steps, and a Test Case Artifact for Router QA approval and later Zephyr Scale creation.
---

# Create Test Cases Skill

## Purpose

Create structured, automation-ready QA Test Cases and produce a Test Case Artifact for the Router Agent.

The Skill performs Test Case Creation only.

The owning Agent is the Test Case Creation Agent.

Do not invent missing requirements or expected behavior.

Do not implement automation.

Do not approve the generated Test Cases.

Follow the unified lifecycle: INPUT → VALIDATE (`TC-CL-*` in `qa-needs-clarification` plus the input-mode rules below) → EXECUTE only when overall status is `READY` → ARTIFACT → Router approval gate. Use `REQUIRES_CLARIFICATION` when a human can supply the missing input. Use `UNKNOWN` when coverage or expected results cannot be established from inspected sources. Use `BLOCKED` when Jira/tools cannot be accessed. Never guess expected results.

---

## Inputs

### Mode 1 — Requirement Analysis Artifact

Use as the primary source:

- Functional Requirements
- Acceptance Criteria
- Edge Cases

Also use other artifact sections when they help coverage, such as business rules or gaps. Do not invent behavior to resolve unresolved gaps.

### Mode 2 — Direct User Story

Analyze only the available User Story information and identify:

- Functional Requirements
- Acceptance Criteria
- Edge Cases

Then create Test Cases from that information only.

### Jira Issue ID

If only a Jira Issue ID is provided, retrieve the Jira issue and use the retrieved User Story as Mode 2 input.

The Skill may also use:

- Impact Analysis Artifact, when provided
- Existing Test Cases
- Prior Test Case Artifact
- QA Reviewer feedback

---

## Execution Workflow

```text
Receive Input
      ↓
Determine Input Mode
      ↓
Requirement Analysis Artifact?
      │
      ├── YES → Use Functional Requirements, Acceptance Criteria, Edge Cases
      │
      └── NO → User Story or Jira ID
                    ↓
                 Retrieve from Jira if needed
                    ↓
                 Identify available FR / AC / Edge Cases
      ↓
Inspect Existing Coverage
      ↓
Design Positive, Negative, AC, and Edge Case Test Cases
      ↓
Build Test Case Artifact
      ↓
Validate Artifact Completeness
      ↓
Return Artifact to Router for QA Review
      ↓
If QA requests changes → Revise Artifact → Return for approval
      ↓
If QA approves → Create in Zephyr Scale
      ↓
Return Final Test Case Artifact to Router
```

---

### Step 1 — Determine Input Mode

Identify whether the Router provided:

- A Requirement Analysis Artifact
- A User Story
- A Jira Issue ID

If the source is ambiguous, stop and report:

`REQUIRES CLARIFICATION`

---

### Step 2 — Obtain Source Information

If a Requirement Analysis Artifact is provided, use it as the primary source.

If a User Story is provided, analyze only that story and available context.

If only a Jira Issue ID is provided:

1. Connect to Jira using the available Jira integration.
2. Retrieve the issue.
3. Read the User Story and available requirements.

If retrieval fails, report the blocking issue. Do not fabricate the story.

---

### Step 3 — Extract Testable Inputs

Identify available:

- Functional Requirements
- Acceptance Criteria
- Edge Cases

If Impact Analysis is available, use confirmed regression and related-function findings. Do not repeat Impact Analysis.

Do not invent missing Functional Requirements, Acceptance Criteria, or Edge Cases.

If essential information is missing, document it as `UNKNOWN` or `REQUIRES CLARIFICATION`.

---

### Step 4 — Inspect Existing Coverage

When access is available, search existing Test Cases and avoid duplicates.

If they cannot be inspected:

`Existing Coverage: UNKNOWN`

---

### Step 5 — Identify Testable Outcomes

Break available requirements into independently testable outcomes.

One Test Case should validate one outcome.

Do not assume one Acceptance Criterion equals one Test Case.

Do not split a requirement only to increase Test Case count.

Do not create unsupported scenarios.

---

### Step 6 — Create Coverage

Create Test Cases for available requirements through:

- Positive Test Cases
- Negative Test Cases
- Acceptance Criteria coverage
- Edge Case coverage

Create negative cases only when negative behavior is supported by available requirements, Acceptance Criteria, Edge Cases, or confirmed documented behavior.

Do not invent error messages, validation rules, rejection behavior, or HTTP status codes.

If a boundary is explicitly defined, cover that boundary. Do not invent limits.

---

### Step 7 — Write Each Test Case

Every Test Case MUST contain:

#### Title

Must start with `Validate`.

Example:

`Validate user can save a contact with all required fields`

#### Description

Must start with `Ensure`.

Example:

`Ensure a contact is saved when all required fields are provided`

#### Test Data

Specify required data from available information.

If specific data is required but not provided, identify the gap. Do not fabricate business data.

If no specific data is required:

`Not specified / Not required`

#### Test Steps

Steps must be:

- Clear
- Specific
- Executable
- Sequential
- Unambiguous
- Suitable for future automation

Separate actions from validations.

Include preconditions when they are explicitly known and required.

Do not use vague steps such as "Check that everything works."

Do not write automation code, locators, selectors, or invented API endpoints.

#### Expected Result

Derive Expected Result only from:

- Requirement Analysis Artifact, when provided
- Functional Requirements
- Acceptance Criteria
- Edge Cases
- User Story requirements, when the User Story is the direct input

If the Expected Result cannot be determined, identify the missing information.

#### Traceability

Reference the covered requirement, Acceptance Criterion, Functional Requirement, or Edge Case when available.

Do not invent identifiers.

---

### Step 8 — Build the Test Case Artifact

Produce one artifact containing all designed Test Cases.

Mark:

```text
Test Case Status: PENDING QA REVIEW
Zephyr Scale Creation: NOT PERFORMED
```

Return the artifact to the Router Agent with status `PENDING_APPROVAL`.

The Router triggers the centralized audible QA notification (`qa-approval-notification`). This Agent must not play the sound itself.

The Router sends the artifact to the QA Reviewer.

Do not approve the Test Cases.

Do not create them in Zephyr Scale at this step.

---

### Step 9 — Apply QA Feedback

If QA rejects or requests changes:

1. Update the affected Test Cases according to the feedback.
2. Produce a revised Test Case Artifact.
3. Return the revised artifact to the Router for approval again.

Do not create unapproved Test Cases in Zephyr Scale.

---

### Step 10 — Create Approved Test Cases in Zephyr Scale

After explicit QA approval:

1. Connect to the available Zephyr Scale integration inside Jira.
2. Create only approved Test Cases.
3. Preserve approved content.
4. Record returned Zephyr Scale identifiers.
5. Report failed creations separately.

If the Zephyr Scale integration is unavailable, report that the approved Test Cases could not be created and do not simulate creation.

Never claim success without a successful tool response.

---

### Step 11 — Return the Final Artifact

After Zephyr Scale creation, return the final Test Case Artifact to the Router Agent, including Zephyr Scale identifiers or creation failures.

---

## Output Format

# Test Case Artifact

## 1. Source

| Field | Value |
| --- | --- |
| Input Mode | Requirement Analysis Artifact / User Story / Jira Issue ID |
| Story | |
| Requirement Analysis Artifact | |
| Impact Analysis Artifact | |
| Existing Coverage | |

## 2. Coverage Summary

| Area | Status |
| --- | --- |
| Positive Coverage | |
| Negative Coverage | |
| Acceptance Criteria Coverage | |
| Edge Case Coverage | |
| Existing Coverage | |
| Coverage Gaps | |

## 3. Test Cases

### TC-01

**Type:** Positive / Negative / Acceptance Criterion / Edge Case

**Title:** Validate ...

**Description:** Ensure ...

**Traceability:**

- Functional Requirement:
- Acceptance Criterion:
- Edge Case:

**Preconditions:**

1. ...

**Test Data:**

- ...

**Steps:**

1. ...
2. ...
3. ...

**Expected Result:**

...

---

## 4. Coverage Gaps

| Requirement / AC / Edge Case | Missing Coverage | Reason | Status |
| --- | --- | --- | --- |

## 5. Review Status

```text
Test Case Status: PENDING QA REVIEW
Zephyr Scale Creation: NOT PERFORMED
```

## 6. Zephyr Scale Creation Result

Include only after QA approval.

| Test Case | Zephyr Scale ID | Creation Status | Details |
| --- | --- | --- | --- |

If not created:

`Zephyr Scale Creation: NOT PERFORMED`

or the specific failure / missing-integration reason.

---

## Completion Criteria

The Skill is complete for design when:

1. The input mode was identified and the source was obtained, or a blocker was reported.
2. Available Functional Requirements, Acceptance Criteria, and Edge Cases were used.
3. Positive, Negative, Acceptance Criteria, and Edge Case coverage were addressed against available information.
4. Every Test Case contains Title, Description, Test Data, Test Steps, and Expected Result.
5. Every title starts with `Validate`.
6. Every description starts with `Ensure`.
7. Expected Results were not invented.
8. Test Cases are automation-ready and contain no automation code.
9. The Test Case Artifact is returned to the Router for QA Review.
10. Zephyr Scale creation was not performed before QA approval.

The Skill is complete for Zephyr Scale creation only when QA approval was received and creation was attempted through the available integration, with actual identifiers or failures reported.
