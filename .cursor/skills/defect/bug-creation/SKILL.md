---

name: bug-creation
description: Documents confirmed application defects and creates traceable Jira bugs using project-defined rules and evidence.
------------------------------------------------------------------------------------------------------------------------------

# Bug Creation

## Purpose

Document a confirmed application defect in a clear, reproducible, and traceable format and create the corresponding Jira Bug after the required approval.

The Skill focuses on converting confirmed defect evidence into a structured Jira Bug.

It does not determine whether an automated test failure is an application defect. That determination belongs to the `automated-failed-test-analysis` Skill.

---

# Inputs

The Skill may use:

* Confirmed defect analysis
* Root cause analysis
* Failed Test Analysis Report
* Approved Test Case
* Jira Story
* Acceptance Criteria
* Requirements
* Expected Result
* Actual Result
* Reproduction Steps
* Screenshots
* Videos
* Logs
* Request and Response data
* Execution Reports
* Environment Information
* Application Information
* Project Bug Rules
* Jira Workflow
* Assignee Rules
* Available Jira/MCP tools

---

# Execution Workflow

## Step 1 — Validate Bug Input

Before preparing the Jira Bug, verify that:

* The issue has been identified as an Application Bug.
* Root cause evidence is available.
* Expected behavior is established.
* Actual behavior is established.
* The related Test Case is known where applicable.
* The related Story is known where applicable.
* Reproduction information is available where possible.

Do not create a Jira Bug for an unresolved failure classification.

If evidence is insufficient:

`REQUIRES CLARIFICATION`

or:

`REQUIRES VERIFICATION`

---

## Step 2 — Check for Existing Bug

Before creating a new Jira Bug, search for an existing relevant defect.

Check for:

* Same Story
* Same Test Case
* Same behavior
* Same reproduction steps
* Same error
* Same environment issue

Do not create duplicate bugs when an existing issue already represents the same defect.

If duplicate status cannot be established, report the uncertainty.

---

## Step 3 — Build Bug Title

Create a concise and descriptive title that identifies:

* Affected functionality
* Defective behavior
* Relevant condition when necessary

The title must:

* Be clear
* Be concise
* Describe the observed problem
* Avoid unsupported root-cause claims
* Avoid unnecessary technical details

Do not use speculative language as fact.

---

## Step 4 — Build Bug Description

Create a structured description containing the relevant context.

The description should explain:

* What functionality is affected
* Under what condition the problem occurs
* What behavior was observed
* Relevant business or technical context

Do not duplicate information unnecessarily.

---

## Step 5 — Define Steps to Reproduce

Create reproducible steps based only on verified information.

Each step must describe an action required to reproduce the defect.

Do not invent:

* User actions
* Test data
* URLs
* API requests
* Preconditions

If a reproduction step is unknown, mark it explicitly.

---

## Step 6 — Define Expected Result

Use the authoritative expected behavior from:

* Approved Test Case
* Acceptance Criteria
* Requirements
* Business Rules

Do not invent expected behavior.

---

## Step 7 — Define Actual Result

Describe the behavior actually observed.

Base the Actual Result on:

* Execution evidence
* Logs
* Screenshots
* Videos
* API responses
* Browser evidence
* Other verified evidence

Do not convert assumptions into actual results.

---

## Step 8 — Attach Evidence

Attach available evidence such as:

* Screenshots
* Videos
* Logs
* Execution reports
* API request/response evidence
* Relevant files

Do not expose secrets or sensitive credentials in attachments.

Before attaching an artifact, verify that it does not expose:

* Passwords
* Access tokens
* JWTs
* API keys
* Client secrets
* Private keys
* Other sensitive credentials

---

## Step 9 — Determine Priority and Severity

Determine Priority and Severity only according to documented project rules.

Use:

* Project standards
* Jira configuration
* Existing approved workflow rules
* Explicit user direction

Do not invent a severity or priority policy.

If the project rules do not define the required value:

`REQUIRES CLARIFICATION`

---

## Step 10 — Determine Assignee

Determine the appropriate assignee according to documented project rules.

Possible rules may include:

* Frontend defect → Frontend Developer
* Backend defect → Backend Developer
* Specific component owner
* Explicit user direction

Do not infer an assignee when project ownership is unknown.

If no reliable assignment rule exists:

`REQUIRES CLARIFICATION`

---

## Step 11 — Establish Traceability

The Bug should maintain traceability to:

```text
Story
  ↓
Test Case
  ↓
Automated Test
  ↓
Execution
  ↓
Failure Analysis
  ↓
Jira Bug
```

Link the Bug to the relevant Story and Test Case where supported by the available Jira workflow.

---

## Step 12 — Present Proposed Bug

Before creating or modifying Jira:

Present the complete proposed Bug to the user for review.

Include:

```text
Bug Title:
...

Description:
...

Steps to Reproduce:
1. ...
2. ...
3. ...

Expected Result:
...

Actual Result:
...

Priority:
...

Severity:
...

Assignee:
...

Linked Story:
...

Linked Test Case:
...

Evidence:
...
```

Wait for explicit user approval.

Do not create the Jira Bug before approval.

---

## Step 13 — Create Jira Bug

After explicit approval:

1. Create the Jira Bug using the available Jira/MCP tool.
2. Populate only verified information.
3. Apply the approved Priority and Severity.
4. Apply the approved Assignee.
5. Link the Bug to the related Story.
6. Link the Bug to the related Test Case where supported.
7. Attach approved evidence.
8. Use the project's required Bug workflow.

Do not perform unrelated Jira modifications.

---

## Step 14 — Verify Jira Creation

After creation, verify:

* Jira Issue Key
* Title
* Description
* Steps
* Expected Result
* Actual Result
* Priority
* Severity
* Assignee
* Links
* Attachments

If any field was not successfully created or linked, report it accurately.

Do not claim successful creation without verification.

---

# Output

Produce a Bug Creation Report containing:

## 1. Defect Validation

* Root Cause
* Classification
* Supporting Evidence

## 2. Proposed Bug

* Title
* Description
* Steps to Reproduce
* Expected Result
* Actual Result
* Priority
* Severity
* Assignee
* Related Story
* Related Test Case
* Evidence

## 3. Approval Status

* Pending Approval
* Approved
* Rejected
* Modified and Re-approved

## 4. Jira Creation Result

If created:

* Jira Issue Key
* Creation Status
* Links
* Attachment Status
* Traceability Status

If not created:

* Reason
* Required Action

---

# Completion Criteria

The Skill is complete when:

1. The defect is confirmed as an Application Bug by the appropriate analysis.
2. Required evidence is available.
3. Existing duplicate bugs have been checked.
4. Bug information is prepared.
5. Expected and Actual Results are established.
6. Reproduction steps are documented where possible.
7. Priority and Severity follow project rules.
8. Assignee follows project rules.
9. Traceability is established.
10. The proposed Jira Bug is presented for approval.
11. Jira Bug is created only after explicit approval.
12. Creation is verified.
13. The Bug Creation Report is produced.
    