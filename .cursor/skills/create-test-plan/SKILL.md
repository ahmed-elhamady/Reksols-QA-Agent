---
name: create-test-plan
description: Create a QA Test Plan for a Story, Feature, Release, or Sprint using verified requirements, requirement analysis, impact analysis, testing scope, regression scope, automation scope, environment, test data, tools, risks, dependencies, and testing criteria.
---

# Create Test Plan Skill

## Purpose

Create one structured Sprint-level QA Test Plan and return that Test Plan as the Test Plan Artifact for the Router Agent.

The Skill performs Test Plan creation only.

The owning Agent is the Test Plan Agent.

Do not invent missing Sprint, requirement, environment, or tool information.

Do not implement automation.

Do not approve the Test Plan.

Do not assume a Sprint has started unless the Router routed a Sprint Started event.

---

## Inputs

### Mode 1 — User Story

Use the provided User Story and context as a source.

Identify Sprint context from the story when available. Create one plan for the Sprint as a whole.

### Mode 2 — Jira User Story / Issue ID

1. Connect to Jira using the available Jira integration.
2. Retrieve the specified issue.
3. Read available requirements and relevant information.
4. Identify missing Test Plan information.

### Sprint Started Event

When the Router says the Sprint has started and a Test Plan must be prepared:

- Use available Sprint identity and project context from the event.
- Retrieve Sprint stories and related information from Jira when possible.
- Consume existing QA artifacts provided by the Router.

The Skill may also use:

- Requirement Analysis Artifact
- Impact Analysis Artifact
- Test Case Artifact
- Existing test coverage
- Environment information already in context
- Prior Test Plan Artifact
- QA Reviewer feedback

---

## Execution Workflow

```text
Receive Input from Router
      ↓
Determine Input Mode
      │
      ├── Sprint Started event → Notify QA, wait for authorization
      ├── User Story → Use provided story and retrieve Sprint context
      └── Jira Issue ID → Retrieve from Jira
      ↓
Analyze Sprint scope and available requirements
      ↓
Consume existing QA artifacts
      ↓
Define required Test Plan sections
      ↓
Build Test Plan Artifact
      ↓
Return Artifact to Router for QA Review
      ↓
If approved → Publish to Confluence
      ↓
Return final Test Plan Artifact to Router
```

---

### Step 1 — Determine Input Mode

Identify whether the Router provided:

- A Sprint Started event
- A User Story
- A Jira Issue ID

If the source is ambiguous, stop and report:

`REQUIRES CLARIFICATION`

Do not invent a Sprint Started event.

---

### Step 2 — Handle Sprint Started Notification

If a Sprint Started event was routed:

1. Notify QA that a Sprint-level Test Plan is required.
2. Do not create or publish the Test Plan yet.
3. Set status:

```text
Test Plan Status: PENDING QA AUTHORIZATION
Confluence Publication: NOT PERFORMED
```

4. Return that notification to the Router and wait for explicit QA authorization.

---

### Step 3 — Obtain Sprint and Requirement Information

After authorization, or when the request is an authorized Test Plan creation from a User Story or Jira ID:

- Retrieve Sprint information from Jira when a Sprint identifier is available.
- Retrieve Sprint stories and available requirements.
- Identify missing Sprint scope rather than assuming it.

If Jira retrieval fails, report the blocking issue. Do not fabricate stories or Sprint contents.

---

### Step 4 — Consume Existing Analysis

If Requirement Analysis exists, use confirmed findings.

If Impact Analysis exists, use confirmed Direct Impact, Indirect Impact, Risks, and Regression Scope.

If Test Case or existing coverage information exists, use it for regression and automation scope.

Do not repeat those specialized activities.

---

### Step 5 — Define Testing Scope

Define what will be tested from the available Sprint scope and requirements.

Distinguish included and excluded scope only when the available information supports that distinction.

Do not invent scope.

If Out of Scope cannot be determined:

`UNKNOWN`

---

### Step 6 — Define Testing Strategy

Define the testing approach for the Sprint from available requirements and project context.

Only include testing types supported by evidence.

Do not introduce unsupported testing activities as confirmed project requirements.

If applicability is unknown:

`UNKNOWN`

---

### Step 7 — Identify Testing Environment

Identify required or available environments from actual project information.

Do not invent environment URLs, credentials, configurations, or availability.

---

### Step 8 — Identify Test Data

Identify Test Data required for the planned testing.

Use known project information when available.

If required data is not available, identify it as a dependency or missing requirement.

---

### Step 9 — Identify Testing Tools

Identify tools based on actual project context and the Sprint testing approach.

Examples may include Jira, Zephyr Scale, Playwright, REST Assured, Postman, JMeter, or browser tools when they are relevant and confirmed.

Do not include a tool merely because it exists in the QA environment.

---

### Step 10 — Define Entry and Exit Criteria

Define Entry Criteria that must be satisfied before testing can begin.

Define Exit Criteria that must be satisfied before testing can be considered complete.

Do not invent project-specific numerical thresholds.

If a criterion is unavailable:

`UNKNOWN`

or:

`REQUIRES CLARIFICATION`

---

### Step 11 — Define Regression Scope and Automation Scope

#### Regression Scope

Identify regression testing scope from Sprint changes and known impact.

Use available Impact Analysis and existing QA artifacts.

Do not invent regression requirements.

Never estimate an unverified regression test count.

If the count cannot be verified:

`Regression Test Count: UNKNOWN`

#### Automation Scope

Identify which parts of the Sprint testing scope are suitable or planned for automation based on available information.

Do not implement automation.

---

### Step 12 — Identify Risks

Identify testing risks based on available evidence.

Do not invent unsupported risks.

Where a risk depends on missing information, identify the dependency.

---

### Step 13 — Build the Test Plan Artifact

The Test Plan itself is the artifact.

Mark:

```text
Test Plan Status: PENDING QA REVIEW
Confluence Publication: NOT PERFORMED
```

Return it to the Router for QA Review.

Do not publish to Confluence at this step.

---

### Step 14 — Publish Approved Test Plan to Confluence

After explicit QA approval:

1. Connect to the available Confluence integration.
2. Create or update the approved Test Plan page.
3. Record the returned Confluence reference.
4. Return the final Test Plan Artifact to the Router.

If Confluence is unavailable or publication fails:

- Do not simulate success.
- Preserve the Test Plan Artifact.
- Report the actual failure to the Router.

---

## Output Format

# Test Plan Artifact

## Source

| Field | Value |
| --- | --- |
| Input Mode | Sprint Started Event / User Story / Jira Issue ID |
| Project | |
| Sprint | |
| Stories | |
| Requirement Analysis Artifact | |
| Impact Analysis Artifact | |
| Test Case Artifact | |

## Traceability

| Item | Reference | Status |
| --- | --- | --- |
| Sprint | | |
| User Stories | | |
| Requirements | | |

Use `UNKNOWN` when a reference is unavailable. Do not invent identifiers.

## 1. Testing Scope

### In Scope

-

### Out of Scope

-

## 2. Testing Strategy

| Testing Type | Scope | Reason | Status |
| --- | --- | --- | --- |

## 3. Testing Environment

| Component | Environment / Configuration | Status |
| --- | --- | --- |

## 4. Test Data

| Data | Purpose | Availability | Status |
| --- | --- | --- | --- |

## 5. Testing Tools

| Tool | Purpose | Status |
| --- | --- | --- |

## 6. Entry Criteria

-

## 7. Exit Criteria

-

## 8. Regression Scope

### Direct Regression

-

### Related Regression

-

### Broader Regression

-

### Verified Regression Test Count

`UNKNOWN`

## 9. Automation Scope

| Area | Existing Automation | Planned Automation | Status |
| --- | --- | --- | --- |

## 10. Risks

| Risk | Evidence | Dependency | Status |
| --- | --- | --- | --- |

## Information Gaps

| Missing Information | Impact on Test Plan | Status |
| --- | --- | --- |

## Review Status

```text
Test Plan Status: PENDING QA AUTHORIZATION / PENDING QA REVIEW / APPROVED
Confluence Publication: NOT PERFORMED / PUBLISHED / FAILED
```

## Confluence Publication Result

Include only after an actual publication attempt.

- Confluence URL or page ID
- Publication Status
- Failure details, if any

---

## Completion Criteria

The Skill is complete for Sprint Started notification when:

1. The Router-routed Sprint Started event was received.
2. QA was notified that a Sprint-level Test Plan is required.
3. No Test Plan was created or published before QA authorization.

The Skill is complete for Test Plan design when:

1. The source was obtained or a blocker was reported.
2. The Test Plan covers the Sprint as a whole.
3. All required sections are present.
4. Existing specialized artifacts were reused when provided.
5. Unknown information is explicitly identified.
6. The Test Plan Artifact is returned to the Router for QA Review.
7. Confluence publication was not performed before approval.

The Skill is complete for Confluence publication only when QA approval was received and publication was attempted through the available integration, with the actual reference or failure reported.
