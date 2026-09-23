---
name: impact-analysis
description: Analyze the impact of a User Story or Jira issue on existing functionality, risks, regression scope, and related areas. Produce an Impact Analysis Artifact for the Router Agent covering Direct Impact, Risks, Regression Scope, and Indirect Impact.
---

# Impact Analysis

## Purpose

Analyze the QA impact of a new or changed requirement and produce one structured Impact Analysis Artifact that the Router Agent can use as completion evidence.

The Skill performs Impact Analysis only.

The owning Agent is the Impact Analysis Agent.

Do not invent unspecified impact, risks, dependencies, or test cases.

Do not invent additional QA activities that were not requested.

Do not perform QA review of the generated artifact.

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

- Requirement Analysis Artifact
- Existing Test Cases
- Test Suites
- Existing Automation
- API, architecture, or technical documentation
- Environment information
- Prior Impact Analysis Artifact

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
Read and Understand the Change
      ↓
Inspect Existing Test Coverage
      ↓
Identify Direct Impact
      ↓
Identify Risks
      ↓
Identify Regression Scope
      ↓
Identify Indirect Impact
      ↓
Build Impact Analysis Artifact
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

---

### Step 2 — Obtain the User Story

If a User Story is provided, use it and the available context as the source of truth.

If only a Jira Issue ID is provided:

1. Connect to Jira using the available Jira integration.
2. Retrieve the corresponding Jira issue.
3. Read the User Story and relevant available information.
4. Use that retrieved information as the source for analysis.

Do not invent the User Story if the Jira issue cannot be retrieved.

If retrieval fails:

- Identify the missing information.
- Report the blocking issue.
- Do not produce a completed Impact Analysis Artifact.

---

### Step 3 — Read and Understand the Change

Identify the confirmed change from the User Story and available context.

Identify:

- What is being added, changed, or removed
- Affected actors or flows
- Confirmed dependencies
- Related Requirement Analysis findings, if available

Do not invent a change that is not supported by the available information.

If a prior Impact Analysis Artifact exists for the same issue, re-run the analysis against the current information and include a change summary.

---

### Step 4 — Inspect Existing Test Coverage

Search available sources for existing test cases related to the confirmed change.

Possible sources:

- Jira
- Existing Test Cases
- Test Suites
- Existing Automation
- Previous QA artifacts already in context

Record whether existing test cases were accessible.

If they cannot be accessed, document:

`Existing Test Cases: UNKNOWN`

Treat this as a missing dependency for Regression Scope.

Do not invent test cases.

---

### Step 5 — Identify Direct Impact

Identify Direct Impact on existing functionality, modules, services, APIs, data, or user flows that the change itself affects.

For each Direct Impact item, record:

- Impacted item
- Nature of the impact
- Evidence
- Status: `CONFIRMED` / `POTENTIAL` / `UNKNOWN`

Do not invent Direct Impact.

If Direct Impact cannot be determined:

`Direct Impact: UNKNOWN`

---

### Step 6 — Identify Risks

Identify Risks that could affect testing, delivery, or existing product behavior.

Base risks only on available evidence such as:

- The confirmed change
- Confirmed dependencies
- Missing information
- Environment or data constraints already in context
- Existing analysis

For each risk, record:

- Risk
- Evidence
- Status

Do not invent risks.

If no evidence-based risks are available:

`Risks: UNKNOWN`

---

### Step 7 — Identify Regression Scope

Identify which existing test cases should be rerun after implementation of the feature.

Regression Scope may group existing tests as:

- Direct Regression
- Related Regression
- Broader Regression

Only include test cases that actually exist in an available source.

For each identified test case, record:

- Test case identifier or name
- Source
- Why it should be rerun
- Status: `CONFIRMED`

Do not invent test cases.

Do not estimate regression counts.

If a verified count is available from the source, report it.

Otherwise:

`Regression Test Count: UNKNOWN`

If existing test cases cannot be accessed:

- Identify the missing dependency.
- Do not fabricate regression coverage.

---

### Step 8 — Identify Indirect Impact

Identify Indirect Impact on related or downstream functionality that may be affected even though it is not the primary change.

For each Indirect Impact item, record:

- Impacted item
- Relationship to the change
- Evidence
- Status: `CONFIRMED` / `POTENTIAL` / `UNKNOWN`

Do not invent Indirect Impact.

If none are supported:

`Indirect Impact: NONE IDENTIFIED FROM AVAILABLE INFORMATION`

---

### Step 9 — Build the Impact Analysis Artifact

Produce one structured artifact containing all required analysis outputs.

The artifact may also include confirmed supporting information needed by later QA activities, such as dependencies, automation impact, test data impact, or environment impact, but only when evidence exists.

Do not invent those supporting items to fill the artifact.

---

### Step 10 — Validate Artifact Completeness

Do not claim completion if required sections are missing.

Verify:

- Source User Story was obtained, or a blocking issue was reported
- Direct Impact is present
- Risks are present
- Regression Scope is present
- Indirect Impact is present
- Regression Scope lists only existing test cases or reports that they could not be accessed
- Confirmed, missing, unclear, and clarification-needed information are distinguished
- Review status is `PENDING QA REVIEW`
- No invented impact, risk, or test case is presented as fact

---

### Step 11 — Return Artifact to Router Agent

Return the Impact Analysis Artifact to the Router Agent.

State that the artifact is complete and ready for Router handoff.

The Router Agent is responsible for sending the artifact to the QA Reviewer.

Do not perform the QA review.

Do not continue into Test Design or other QA activities unless those activities were explicitly requested.

---

## Output Format

Produce:

```text
Impact Analysis Artifact
│
├── Direct Impact
│
├── Risks
│
├── Regression Scope
│
└── Indirect Impact
```

Use this structure:

# Impact Analysis Artifact

## Source

- Input Type: User Story / Jira Issue ID
- Issue Key
- Summary
- Retrieval Status
- Related Requirement Analysis Artifact

## Change Summary

Include only when this is a re-analysis.

## Confirmed Change

Describe only the change supported by available information.

Status: `CONFIRMED` / `UNKNOWN` / `REQUIRES CLARIFICATION`

## Direct Impact

| Impacted Item | Impact | Evidence | Status |
| ------------- | ------ | -------- | ------ |

If unknown:

`Direct Impact: UNKNOWN`

## Risks

| Risk | Evidence | Status |
| ---- | -------- | ------ |

If unknown:

`Risks: UNKNOWN`

## Regression Scope

### Existing Test Case Access

- Accessible / Not Accessible
- Source
- Missing Dependency, if any

### Existing Test Cases To Rerun

| Test Case | Source | Why Rerun | Status |
| --------- | ------ | --------- | ------ |

### Direct Regression

-

### Related Regression

-

### Broader Regression

-

### Verified Regression Test Count

`UNKNOWN`

If existing test cases cannot be accessed:

`Existing Test Cases: UNKNOWN`

`Regression coverage cannot be confirmed because existing test cases were not accessible.`

## Indirect Impact

| Impacted Item | Relationship | Evidence | Status |
| ------------- | ------------ | -------- | ------ |

If none are supported:

`Indirect Impact: NONE IDENTIFIED FROM AVAILABLE INFORMATION`

## Supporting Impact Information

Include only when evidence exists.

| Area | Finding | Evidence | Status |
| ---- | ------- | -------- | ------ |

Possible areas:

- Dependencies
- Automation impact
- Test data impact
- Environment impact

If unknown, mark `UNKNOWN`. Do not invent entries.

## Information Gaps

| Missing Information | Impact on Analysis | Status |
| ------------------- | ------------------ | ------ |

## Review Status

```text
Impact Analysis Artifact Status: COMPLETE AND READY FOR ROUTER
QA Review Status: PENDING QA REVIEW
```

## Handoff

State that the artifact must be returned to the Router Agent for QA Reviewer review.

Do not mark the artifact as QA-approved.

---

## Completion Criteria

The Skill is complete only when:

1. The input type was identified.
2. The User Story was obtained, or the Jira/source retrieval blocker was reported.
3. Direct Impact was identified or marked `UNKNOWN`.
4. Risks were identified or marked `UNKNOWN`.
5. Regression Scope was identified from existing test cases, or inaccessibility was documented.
6. Indirect Impact was identified, marked unknown, or explicitly reported as none identified.
7. The Impact Analysis Artifact contains all required sections.
8. The artifact is marked complete and ready for the Router.
9. QA Review remains `PENDING QA REVIEW`.
10. No unsupported assumptions are presented as facts.
11. No unauthorized Jira write operation was performed.
12. No additional unrequested QA activity was performed.
