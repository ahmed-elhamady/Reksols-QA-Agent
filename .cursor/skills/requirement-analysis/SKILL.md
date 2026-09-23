---
name: requirement-analysis
description: Analyze a User Story or Jira issue from a QA perspective and produce a Requirement Analysis Artifact for the Router Agent, including Business Goal, requirements, Acceptance Criteria, Edge Cases, Requirement Gaps, and a Yes/No Product Owner questionnaire.
---

# Requirement Analysis Skill

## Purpose

Analyze a User Story from a QA perspective and produce one structured Requirement Analysis Artifact that the Router Agent can use as completion evidence.

The Skill performs Requirement Analysis only.

The owning Agent is the Requirement Analysis Agent.

Do not invent unspecified business behavior.

Do not invent additional QA activities that were not requested.

---

## Inputs

The Skill may receive from the Router Agent:

### Case A — Full User Story

```text
User Story
+ available context
```

### Case B — Jira Issue ID

```text
REK-17
```

The Skill may also receive:

- Story Summary
- Description
- Acceptance Criteria
- Business Rules
- Existing related requirements
- Attachments or linked documentation
- Relevant Jira metadata
- Prior Requirement Analysis Artifact

If required information is missing, identify it explicitly instead of assuming it.

---

## Execution Workflow

```text
Receive Input
      ↓
Determine Input Type
      ↓
User Story provided?
      │
      ├── YES → Use provided User Story
      │
      └── NO → Jira Issue ID provided
                    ↓
                 Retrieve from Jira
      ↓
Read and Understand User Story
      ↓
Identify Business Goal
      ↓
Analyze Requirements
      ↓
Identify Acceptance Criteria
      ↓
Identify Edge Cases
      ↓
Identify Requirement Gaps
      ↓
Create Yes/No Questionnaire
      ↓
Build Requirement Analysis Artifact
      ↓
Validate Artifact Completeness
      ↓
Return Artifact to Router Agent
```

---

### Step 1 — Receive Input and Determine Input Type

Determine whether the Router provided:

- A full User Story
- Only a Jira Issue ID
- Another explicit source already in context

If the input type is ambiguous, stop and report:

`REQUIRES CLARIFICATION`

Do not guess the source.

---

### Step 2 — Obtain the User Story

If a User Story is provided:

Use the provided User Story and available context as the source of truth.

If only a Jira Issue ID is provided:

1. Connect to Jira using the available Jira integration.
2. Retrieve the corresponding Jira issue.
3. Read the User Story and relevant available information.
4. Use that retrieved information as the source for analysis.

Do not invent the User Story if the Jira issue cannot be retrieved.

If the Jira issue cannot be accessed or the required information cannot be retrieved:

- Report the blocking issue.
- Do not produce a completed Requirement Analysis Artifact.
- Do not pretend that analysis was completed.

If a Confluence page or raw pasted requirement is explicitly provided, use that retrieved or provided content only. Do not mix assumed content with retrieved content.

---

### Step 3 — Check for Existing Analysis

If a prior Requirement Analysis Artifact exists for the same issue or requirement:

1. Retrieve the prior artifact if available.
2. Re-run the full analysis against the current User Story.
3. Include a change summary in the new artifact.
4. Produce the full artifact. The change summary supplements it; it does not replace it.

If no prior analysis exists, omit the change summary.

---

### Step 4 — Read and Understand the User Story

Identify what is explicitly stated in the User Story and available context.

Separate:

- Confirmed information
- Missing information
- Unclear information
- Information requiring clarification

Do not treat inferred behavior as confirmed behavior.

---

### Step 5 — Identify the Business Goal

Identify the Business Goal represented by the User Story.

Base it only on the User Story and provided context.

If the Business Goal cannot be determined:

```text
Business Goal: UNKNOWN
```

Do not invent a Business Goal.

---

### Step 6 — Analyze the Requirements

Analyze the requirements described in the User Story.

Extract only supported functional behaviors. For each confirmed behavior, identify when available:

- Actor
- Action
- System behavior
- Conditions
- Expected outcome

Extract only supported business rules, such as stated conditions, validations, permissions, restrictions, limits, status transitions, required fields, or conditional behavior.

Identify confirmed or potential dependencies only when evidence exists.

Check whether the requirement addresses relevant non-functional aspects. Classify each as `CONFIRMED` or `UNADDRESSED`. Do not invent NFR targets.

Assess testability as:

- Testable
- Partially Testable
- Not Testable

Do not invent requirements, business rules, expected behavior, or system behavior.

---

### Step 7 — Identify Acceptance Criteria

Identify and analyze the Acceptance Criteria available in the User Story.

For each available criterion, record:

- The criterion
- Whether it is clear
- Whether it is testable
- Observations supported by the text

Do not invent Acceptance Criteria.

If Acceptance Criteria are missing, incomplete, ambiguous, or insufficiently defined, state that explicitly.

---

### Step 8 — Identify Edge Cases

Identify relevant Edge Cases based on requirements and behavior explicitly or implicitly defined by the User Story.

Every Edge Case must have a clear relationship to:

- A requirement
- An acceptance criterion
- Defined system behavior

Do not create arbitrary or unrelated Edge Cases.

Do not invent unsupported business behavior to create an Edge Case.

---

### Step 9 — Identify Requirement Gaps

Identify Requirement Gaps that could prevent QA from clearly understanding or testing the requested functionality.

A gap may include information that is:

- Missing
- Ambiguous
- Incomplete
- Contradictory
- Not sufficiently defined for testing

For each gap, document:

- The gap
- Why it matters for testing
- Severity
- Status

Use severity:

- `Blocking` — testing cannot begin without resolution
- `Major` — testing can be drafted but coverage will be incomplete or assumption-based
- `Minor` — clarification improves precision but does not prevent test design

Do not resolve gaps by making assumptions.

---

### Step 10 — Create the Yes/No Questionnaire

Create a Questionnaire containing the questions that must be clarified before testing can begin.

The Questionnaire is for the Product Owner or other appropriate human stakeholder.

Every question must be answerable with:

```text
YES
or
NO
```

Do not create open-ended questions.

Do not answer the Questionnaire.

Derive questions only from identified gaps, ambiguities, or clarification needs.

Use:

```text
Questionnaire

Q1. [Yes/No question]
Answer: PENDING

Q2. [Yes/No question]
Answer: PENDING
```

If no clarification is required before testing can begin, state that explicitly in the Questionnaire section. Do not invent questions.

Do not assume the Questionnaire has been answered because the artifact was generated.

---

### Step 11 — Build the Requirement Analysis Artifact

Produce one structured artifact containing all required analysis outputs.

---

### Step 12 — Validate Artifact Completeness

Do not claim completion if required sections are missing.

Verify:

- Source User Story was obtained, or a blocking issue was reported
- Business Goal is present or `UNKNOWN`
- Requirement Analysis is present
- Acceptance Criteria section is present
- Edge Cases section is present
- Requirement Gaps section is present
- Questionnaire section is present
- Questionnaire answers are `PENDING` unless the user already supplied answers in the current request
- Confirmed, missing, unclear, and clarification-needed information are distinguished
- No invented requirements, Acceptance Criteria, Business Goal, or system behavior

---

### Step 13 — Return Artifact to Router Agent

Return the Requirement Analysis Artifact to the Router Agent.

The Router Agent is responsible for forwarding the Questionnaire to the Product Owner and managing subsequent workflow state.

Do not continue into Test Design, Impact Analysis, or other QA activities unless those activities were explicitly requested.

---

## Output Format

Produce:

```text
Requirement Analysis Artifact
│
├── Business Goal
│
├── Requirement Analysis
│
├── Acceptance Criteria
│
├── Edge Cases
│
├── Requirement Gaps
│
└── Questionnaire
      ├── Q1
      ├── Q2
      ├── Q3
      └── ...
```

Use this structure:

# Requirement Analysis Artifact

## Source

- Input Type: User Story / Jira Issue ID
- Issue Key
- Summary
- Retrieval Status
- Other confirmed metadata

## Change Summary

Include only when this is a re-analysis.

- What changed since the last analysis
- Resolved items
- Still-open items
- Newly introduced items

## Business Goal

State the confirmed Business Goal, or:

```text
Business Goal: UNKNOWN
```

Status: `CONFIRMED` / `UNKNOWN` / `REQUIRES CLARIFICATION`

## Requirement Analysis

### Functional Requirements

List identified functional behaviors supported by the User Story.

### Business Rules

List confirmed business rules.

### Dependencies

| Dependency | Type | Evidence | Status |
| ---------- | ---- | -------- | ------ |

Use `CONFIRMED`, `POTENTIAL`, or `UNKNOWN`.

### Non-Functional Considerations

| Aspect | Status | Notes |
| ------ | ------ | ----- |

Use `CONFIRMED` or `UNADDRESSED`.

### Testability Assessment

- Status: Testable / Partially Testable / Not Testable
- Reason

Distinguish:

- Confirmed information
- Missing information
- Unclear information
- Information requiring clarification

## Acceptance Criteria

If none are available:

`Acceptance Criteria: MISSING`

Otherwise, for each criterion:

- Criterion
- Clarity
- Testability
- Observation
- Status

## Edge Cases

For each Edge Case:

- Edge Case
- Related requirement, acceptance criterion, or defined behavior
- Status

If none are supported by the User Story:

`Edge Cases: NONE IDENTIFIED FROM AVAILABLE INFORMATION`

## Requirement Gaps

| ID | Gap | Type | Why It Matters | Severity | Status |
| -- | --- | ---- | -------------- | -------- | ------ |

Type must be one of:

- Missing
- Ambiguous
- Incomplete
- Contradictory
- Not sufficiently defined for testing

If no gaps are identified, state that explicitly.

## Questionnaire

Questions that must be clarified before testing can begin.

```text
Q1. [Yes/No question]
Answer: PENDING

Q2. [Yes/No question]
Answer: PENDING
```

Do not include answers other than `PENDING` unless the current request already contains the Product Owner's explicit Yes/No answers.

## Handoff

State whether the artifact is ready for the Router Agent to:

- Forward the Questionnaire to the Product Owner
- Continue the QA workflow after answers are received

State explicitly which confirmed sections may later be consumed by `test-case-creation-agent`:

- Functional Requirements
- Business Rules
- Requirement Gaps (`Blocking` and `Major` severity gate later test design; `Minor` may proceed with a noted assumption)
- Dependencies
- Edge Cases
- Confirmed Non-Functional Considerations

If any `Blocking` gap exists, state:

**Not ready for Test Case Creation until blocking gaps are resolved and the Questionnaire is answered.**

---

## Completion Criteria

The Skill is complete only when:

1. The input type was identified.
2. The User Story was obtained, or the Jira/source retrieval blocker was reported.
3. The Business Goal was identified or marked `UNKNOWN`.
4. Requirements were analyzed from available information.
5. Acceptance Criteria were identified or explicitly marked missing/insufficient.
6. Relevant Edge Cases were identified from available requirements or defined behavior.
7. Requirement Gaps were documented.
8. A Yes/No Questionnaire was created for clarification needs, with answers left `PENDING`.
9. The Requirement Analysis Artifact contains all required sections.
10. The artifact is returned to the Router Agent.
11. No unsupported assumptions are presented as facts.
12. No unauthorized Jira write operation was performed.
13. No additional unrequested QA activity was performed.
