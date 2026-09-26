---
name: orchestration
description: Orchestrates the REKSOLS QA workflow by validating requests, selecting specialized Agents, passing context, validating artifacts, enforcing approvals, and routing the next required QA activity. Use when routing QA work, coordinating subagents, tracking workflow state, or determining the next Agent.
---

# Orchestration

## Purpose

Coordinate the QA workflow from the user request through specialized Agents without performing the specialized QA activity inside the Router.

Follow this sequence:

```text
INPUT / RECEIVED
      ↓
VALIDATING_PREREQUISITES + Needs Clarification catalog
      ↓
REQUIRES_CLARIFICATION | BLOCKED | READY
      ↓
EXECUTE (specialist)
      ↓
ARTIFACT_CREATED
      ↓
WAITING_FOR_QA_APPROVAL if required (qa-approval-notification)
      ↓
APPROVED → CONTINUE | REJECTED → STOP | REQUEST_CHANGES → rework
```

Also use skills `qa-workflow` and `qa-needs-clarification`. Persist `.cursor/workflow/qa-workflow-state.json`.

---

## Inputs

The Skill may use:

- Original user request
- Current workflow state
- Sprint Started event, when present
- User Story and Acceptance Criteria already in context
- Previous analysis results
- Previous artifacts
- Approval status
- Dependencies
- Environment information already in context
- Relevant constraints
- Agent definitions in `.cursor/agents/`
- Skills in `.cursor/skills/`
- Agent rules in `.cursor/rules/`
- `qa-workflow` and `qa-needs-clarification` Skills
- `.cursor/workflow/qa-workflow-state.json`

If a required input is missing, identify it instead of inventing it.

---

## Execution Workflow

### Step 1 — Receive and Understand the Request

Determine:

- What the user is asking for
- Whether the request is a single activity or a multi-step workflow
- The project, story, feature, environment, or artifact involved
- What information is already available
- What information is missing

Do not invent missing information.

If a Sprint Started event is present, treat it as a routed QA activity:

```text
Sprint Started event
        ↓
Router Agent
        ↓
Test Plan Agent
```

A Sprint Started event may arrive as:

- Hook-injected additional context
- `.cursor/workflow/sprint-started-event.json` with `status: PENDING_ROUTER`
- An explicit user/Product Owner statement that the Sprint has started, after the Sprint Started Hook allowed the prompt

Do not assume a Sprint has started when no such event or statement exists.

Do not invent Sprint identity from an empty event.

If `.cursor/workflow/sprint-started-event.json` is consumed, update `status` only after the Test Plan Agent has been notified. Do not fabricate event fields.

---

### Step 2 — Validate Required Context

Verify that routing can proceed with the available information.

If a critical identifier, source, or decision is missing:

`REQUIRES CLARIFICATION`

Do not assume a story, environment, approval, or activity.

---

### Step 3 — Determine QA Activity

Map the request to a known QA activity that exists in the project architecture.

If the request clearly matches one activity, route that activity only.

If the request contains multiple activities, determine the valid execution order from dependencies and the user request.

Do not add unrequested activities.

---

### Step 4 — Select the Responsible Agent

Inspect `.cursor/agents/` and `.cursor/skills/` before delegating.

Use the following map only for Agents and Skills that exist in the project:

| QA Activity | Agent | Skill | Expected Artifact |
|---|---|---|---|
| Requirement Analysis | Requirement Analysis Agent (`requirement-analysis-agent`) | `requirement-analysis` | Requirement Analysis Artifact |
| Impact Analysis | Impact Analysis Agent (`impact-analysis-agent`) | `impact-analysis` | Impact Analysis Artifact |
| Test Plan Creation | Test Plan Agent (`test-plan-agent`) | `create-test-plan` | Test Plan Artifact |
| Test Case Creation | Test Case Creation Agent (`test-case-creation-agent`) | `create-test-cases` | Test Case Artifact |
| Environment Analysis / Selection / Setup | Environment Agent (`environment-agent`) | `environment` | Environment Artifact |
| Locator Inspection | Locator Inspection Agent (`locator-inspection-agent`) | `locator-inspection` | Locator Inspection Artifact |
| Framework Creation | Framework Creation Agent (`framework-creation-agent`) | `framework-creation` | Framework Creation Artifact |
| Test Case Automation | Test Case Automation Agent (`test-case-automation-agent`) | `test-case-automation` | Test Case Automation Artifact |
| Pipeline Creation | Pipeline Creation Agent (`pipeline-creation-agent`) | `pipeline-creation` | Pipeline Creation Artifact |
| Pipeline Execution | Pipeline Execution Agent (`pipeline-execution-agent`) | `pipeline-execution` | Pipeline Execution Artifact |
| Automated Field Test Cases Analysis | Automated Field Test Cases Analysis Agent (`automated-field-test-cases-analysis-agent`) | `automated-field-test-cases-analysis` | Automated Field Test Cases Analysis Artifact |
| Bug Creation | Bug Creation Agent (`bug-creation-agent`) | `bug-creation` | Bug Creation Artifact |
| Test Summary | Test Summary Agent (`test-summary-agent`) | `test-summary` | Test Summary Artifact |
| QA Workflow State | Router Agent (`router-agent`) | `qa-workflow` | `.cursor/workflow/qa-workflow-state.json` |
| Needs Clarification Evaluation | Router + owning Agent | `qa-needs-clarification` | Clarification set / prerequisite evaluation |
| QA Approval Notification | Router Agent (`router-agent`) | `qa-approval-notification` | Approval Request + notification event |

If the requested activity is not in this map, inspect the current architecture again.

If no matching Agent exists, stop. Do not invent an Agent.

Example routing:

```text
Requirement Analysis
        ↓
Requirement Analysis Agent

Impact Analysis
        ↓
Impact Analysis Agent

Test Case Creation
        ↓
Test Case Creation Agent

Test Plan Creation
        ↓
Test Plan Agent

Environment Analysis / Selection / Setup
        ↓
Environment Agent

Locator Inspection
        ↓
Locator Inspection Agent

Framework Creation
        ↓
Framework Creation Agent

Test Case Automation
        ↓
Test Case Automation Agent

Pipeline Creation
        ↓
Pipeline Creation Agent

Pipeline Execution
        ↓
Pipeline Execution Agent

Automated Field Test Cases Analysis
        ↓
Automated Field Test Cases Analysis Agent

Bug Creation
        ↓
Bug Creation Agent

Test Summary
        ↓
Test Summary Agent
```

---

### Step 5 — Check Prerequisites and Duplicate Work

Before delegating:

1. Check whether the activity is already complete in the workflow state.
2. Reuse valid existing artifacts unless re-execution is required.
3. Verify required prerequisites for the selected activity.

Known prerequisite patterns when those activities are required:

```text
Requirement Analysis
        ↓
Impact Analysis
        ↓
Test Case Creation
        ↓
Test Plan Creation
        ↓
Approval
        ↓
Automation
```

Additional confirmed dependencies:

- Test Plan Creation should reuse existing Requirement Analysis, Impact Analysis, and Test Case artifacts when they exist.
- Test Case Creation should use a Requirement Analysis Artifact when it exists, or a User Story / Jira ID when that is the provided input.
- Test Case Automation requires a Test Case Artifact, or a Jira User Story ID as fallback, and must not treat cases as final until QA approval.
- Test Case Automation for UI tests should consume a valid Locator Inspection Artifact instead of inventing locators.
- Bug Creation requires a Pipeline Execution Artifact and an approved Automated Field Test Cases Analysis Artifact with `APPLICATION_DEFECT` findings. Pass both artifacts plus User Story ID when known.
- Environment Analysis / Selection / Setup requires a Jira User Story / Issue ID.
- Downstream Agents that need a testing environment should consume a valid Environment Artifact instead of rediscovering the environment.
- Locator Inspection requires a Jira User Story ID and the environment URL from a valid Environment Artifact.
- Framework Creation requires Locator Inspection Artifact, Environment Artifact, and Test Case Automation Artifact, and must not start file changes before QA approval.
- Pipeline Creation requires an inspectable automation project. Do not assume the CI/CD platform. Pass the approved Pipeline Creation Artifact to Pipeline Execution.
- Pipeline Execution requires an approved Pipeline Creation Artifact and explicit QA approval for that run. Pass the Pipeline Execution Artifact to Automated Field Test Cases Analysis when failed tests need root-cause analysis.
- Automated Field Test Cases Analysis requires a Pipeline Execution Artifact. Pass the approved analysis artifact and the Pipeline Execution Artifact to the Bug Creation Agent when the root cause is an application defect.
- Bug Creation must not start until those artifacts exist. Do not create Jira bugs in the Router. Do not treat Bug Creation as complete until the Bug Creation Artifact is QA-approved.
- Test Summary requires explicit scope `STORY` | `FEATURE` | `SPRINT` and a target. Pass the Pipeline Execution Artifact as the primary execution source, plus Bug Creation, analysis, Test Case, Test Case Automation, Test Plan, and Environment artifacts when they exist. Do not assume Sprint Summary at Sprint end. Do not treat Test Summary as complete until QA approval of the Test Summary Artifact.

If a required prerequisite is incomplete, route to that prerequisite instead of starting the later activity.

---

### Step 6 — Prepare Context

Provide the selected Agent with all relevant available context, including:

- Original user request
- User Story or Jira Issue ID
- Acceptance Criteria
- Previous analysis results
- Previous artifacts
- Current workflow state
- Relevant decisions
- Approval status
- Dependencies
- Environment information
- Relevant constraints
- The Skill the Agent must use
- The expected artifact

Do not force the user to repeat information already in the workflow.

---

### Step 7 — Delegate

Delegate to the selected Agent using the project's subagent mechanism.

The delegated task must state:

- The QA activity
- The owning Agent
- The Skill to apply
- The expected artifact
- The available context
- What must not be invented
- That Jira writes require explicit user approval

Do not duplicate the subagent's specialized logic inside the Router.

---

### Step 8 — Receive Result and Validate Artifacts

Do not treat the Agent response alone as completion.

Validate:

1. The expected artifact exists.
2. The artifact matches the requested activity.
3. The artifact is sufficiently complete for that activity.
4. No required output is missing.

If the artifact is missing or insufficient:

- Do not mark the activity complete.
- Return the task to the responsible Agent, or request clarification.

Do not invent the missing artifact.

For Requirement Analysis, the expected artifact is the Requirement Analysis Artifact. It is complete only when it includes:

- Business Goal
- Requirement Analysis
- Acceptance Criteria
- Edge Cases
- Requirement Gaps
- Questionnaire

For Impact Analysis, the expected artifact is the Impact Analysis Artifact. It is complete only when it includes:

- Direct Impact
- Risks
- Regression Scope
- Indirect Impact

For Test Case Creation, the expected design artifact is the Test Case Artifact. It is complete for design only when each Test Case includes:

- Test Case Title
- Description
- Test Data
- Test Steps
- Expected Result
- Traceability where available

For Test Plan Creation, the expected artifact is the Test Plan Artifact. It is complete only when it includes:

- Testing Scope
- Testing Strategy
- Testing Environment
- Test Data
- Testing Tools
- Entry Criteria
- Exit Criteria
- Regression Scope
- Automation Scope
- Risks

For Environment Analysis / Selection / Setup, the expected artifact is the Environment Artifact. It is complete only when it includes:

- User Story ID
- User Story Status
- Front-end Sub-task
- Front-end Sub-task Status
- Back-end Sub-task
- Back-end Sub-task Status
- Selected Environment
- Environment Setup Status
- Environment URL
- Environment Readiness Status
- Any blocker, missing information, or limitation

A valid Environment Artifact may still be blocked (`NOT SELECTED`, `MISSING` URL, `NOT READY`). Pass it to the user or the next required activity without inventing a target environment.

For Locator Inspection, the expected artifact is the Locator Inspection Artifact. It is complete only when it includes:

- Inspection Status
- User Story ID
- Target Page
- Environment URL
- Inspection Source
- Category Coverage
- Detected Elements with Element Type, Name, Page, Section, Description, Locator Strategy, Locator Value, Available Attributes, Uniqueness, Stability, Inspection Source, and Notes

A valid Locator Inspection Artifact may still be `BLOCKED` or `REQUIRES CLARIFICATION`. Do not invent locators to complete it.

For Framework Creation, the expected artifact is the Framework Creation Artifact. It is complete only when it includes:

- Framework Status
- Architecture
- Artifact Inputs
- Implemented Changes
- Locator Integration
- Environment Integration
- Test Integration
- Validation
- Remaining Issues
- Assumptions

A Framework Architecture Proposal is not completion. Do not treat Framework Creation as complete until the Framework Creation Artifact is returned after approved implementation, or a documented `BLOCKED` artifact is returned.

For Test Case Automation, the expected artifact is the Test Case Automation Artifact. It is complete only when it includes:

- Story
- Source
- Automation Summary
- Automated Test Cases (QA-approved)
- Not Automatable Test Cases
- Blocked Test Cases
- QA Review Status

Do not treat `PENDING QA REVIEW` as completion. Do not invent locators or endpoints to complete the artifact.

For Pipeline Creation, the expected artifact is the Pipeline Creation Artifact. It is complete only when it includes:

- Platform (or REQUIRES CLARIFICATION)
- Stages and execution commands from the inspected project
- Environment / variable names / secret names
- Validation status
- QA review status

Do not treat the pipeline as executed. Do not invent the CI/CD platform.

For Pipeline Execution, the expected artifact is the Pipeline Execution Artifact. It is complete only when it includes:

- Execution type
- Pipeline status from the actual run
- Stage statuses from the actual run
- Test totals from the actual report when available
- Failures with evidence paths when tests failed
- Screenshot, log, and report paths or an explicit unavailable reason
- QA review status

Do not treat the pipeline as executed in the Router. Do not invent run IDs, counts, or evidence paths.

For Automated Field Test Cases Analysis, the expected artifact is the Automated Field Test Cases Analysis Artifact. It is complete only when it includes:

- Failed tests from the Pipeline Execution Artifact
- Evidence paths or explicit unavailable reasons
- Observed behavior
- Analysis
- Root cause category, description, and confidence
- QA review status

Do not treat root cause as final until QA approval. Do not invent evidence or root causes.

For Bug Creation, the expected artifact is the Bug Creation Artifact. It is complete only when it includes:

- User Story ID (or `REQUIRES CLARIFICATION` with no invented story)
- Status
- Created bugs with actual Jira keys, titles, priority, type, assignee
- `total` equal to the number actually created
- QA review status
- BLOCKS link outcome per created Bug

Do not treat `PENDING REVIEW` drafts as completion. Do not invent Jira keys. Do not treat Bug Creation as complete before draft approval, actual Jira writes, and final report approval.

For Test Summary, the expected artifact is the Test Summary Artifact. It is complete only when it includes:

- Scope type (`STORY` | `FEATURE` | `SPRINT`) and target
- Testing Scope
- Test Execution Results (or explicit UNKNOWN)
- Bugs Summary
- Main Failure Reasons
- Regression Results (`REGRESSION EXECUTED` or `REGRESSION NOT EXECUTED`)
- Automation Results
- Resolved and Unresolved Bugs
- Testing Coverage counts
- Testing Environment
- Overall Testing Summary
- QA review status

Do not invent counts, coverage percentages, bug statuses, or environments. Do not treat `PENDING REVIEW` as completion.

---

### Step 9 — Update Workflow State

Update and retain workflow state after every transition.

Required state fields:

```text
User Request:
Current Activity:
Current Agent:
Completed Activities:
Produced Artifacts:
Approvals:
Pending Activities:
Next Activity:
Blocked: Yes / No
Block Reason:
Routing History:
```

Preserve previously produced artifacts when moving between Agents.

---

### Step 10 — Check Approval Gates

Classify the next action as `APPROVAL_NOT_REQUIRED` or `APPROVAL_REQUIRED`.

If `APPROVAL_REQUIRED`:

```text
Artifact status PENDING_APPROVAL
        ↓
Router qa-approval-notification Skill
        ↓
node .cursor/hooks/qa-approval-notify.js
        ↓
Audible QA notification
        ↓
Status: PENDING_APPROVAL
        ↓
STOP
        ↓
QA: APPROVED | REJECTED | REQUEST_CHANGES
```

Follow `.cursor/skills/qa-approval-notification/SKILL.md`.

Do not continue automatically.

Do not interpret silence, prior approval, another task, another Agent, or unrelated activity as approval.

If the notifier fails: `BLOCKED` with reason `QA approval notification could not be delivered.`

On `APPROVED`, resume the owning Agent for the protected action only.

On `REJECTED`, stop and keep the trail.

On `REQUEST_CHANGES`, return feedback to the owning Agent and require a new notification after revision.

Confirmed approval-gated examples:

- Creating or modifying Jira issues
- Creating Jira test cases
- Creating Jira bugs
- Other Jira write operations
- Generated Test Plans remain `PENDING QA REVIEW` until explicit QA approval
- Approved Test Plans may be published to Confluence only after that approval
- Generated Test Cases remain `PENDING QA REVIEW` until explicit QA approval
- Approved Test Cases may be created in Zephyr Scale only after that approval
- Pipeline execution requires explicit QA approval for that run
- Pipeline Execution Artifacts remain `PENDING QA REVIEW` until QA review
- Automated Field Test Cases Analysis Artifacts remain `PENDING QA REVIEW` until QA approval
- Bug Drafts must not be created in Jira until explicit QA approval
- Bug Creation Artifacts remain `PENDING REVIEW` until QA approval after actual Jira creation
- Test Summary Reports remain `PENDING REVIEW` until QA approval

Do not interpret silence as approval.

Do not continue a gated write until approval is explicit.

After Requirement Analysis, if the Requirement Analysis Artifact contains Questionnaire items with `Answer: PENDING`:

```text
Router Agent
      ↓
Requirement Analysis Artifact
      ↓
Product Owner
      ↓
Answer Questionnaire
      ↓
Router Agent
      ↓
Continue QA Workflow
```

Forward the Questionnaire to the Product Owner.

Do not treat Questionnaire answers as received until the Product Owner or user provides explicit YES or NO answers.

Do not continue later testing activities that depend on those answers while they remain `PENDING`.

After Impact Analysis, if the Impact Analysis Artifact is complete:

```text
Impact Analysis Agent
      ↓
Impact Analysis Artifact
      ↓
Router Agent
      ↓
QA Reviewer
      ↓
Router Agent
      ↓
Continue QA Workflow
```

Forward the Impact Analysis Artifact to the QA Reviewer.

Do not treat the artifact as QA-reviewed until the QA Reviewer provides an explicit review result.

The Impact Analysis Agent must not perform that review.

After Test Case Creation, if the Test Case Artifact is complete for design:

```text
Test Case Creation Agent
      ↓
Test Case Artifact
      ↓
Router Agent
      ↓
QA Reviewer
      ↓
QA Approval
      ↓
Test Case Creation Agent
      ↓
Zephyr Scale
      ↓
Final Test Case Artifact
      ↓
Router Agent
```

Forward the Test Case Artifact to the QA Reviewer.

Do not treat Test Cases as approved until the QA Reviewer provides explicit approval.

Do not allow Zephyr Scale creation before that approval.

The Test Case Creation Agent must not approve its own Test Cases.

After a Sprint Started event, notify the Test Plan Agent, then enforce:

```text
Sprint Started Event
      ↓
Router Agent
      ↓
Test Plan Agent
      ↓
Notify QA that a Sprint-level Test Plan is required
      ↓
QA Authorization
      ↓
Test Plan Agent creates Test Plan
      ↓
QA Review / Approval
      ↓
Publish Test Plan to Confluence
      ↓
Test Plan Artifact
      ↓
Router Agent
```

Do not treat the Test Plan as approved until the QA Reviewer provides explicit approval.

Do not allow Confluence publication before that approval.

The Test Plan Agent must not approve its own Test Plan.

The Test Plan Agent must not independently assume that a Sprint has started.

After Automated Field Test Cases Analysis approval, when failed tests are `APPLICATION_DEFECT`:

```text
Pipeline Execution Artifact
      ↓
Automated Field Test Cases Analysis Agent
      ↓
Automated Field Test Cases Analysis Artifact
      ↓
Router Agent
      ↓
Bug Creation Agent
      ↓
Bug Drafts
      ↓
QA Review / Approval
      ↓
Jira Bug create + attach + assign + BLOCKS
      ↓
Bug Creation Artifact
      ↓
QA Review / Approval
      ↓
Router Agent
```

Do not create Jira bugs before draft approval.

Do not treat the Bug Creation Artifact as final until QA review after actual Jira results.

The Bug Creation Agent must not approve its own drafts or report.

The Router must not create bugs.

After an explicit Test Summary request (`STORY`, `FEATURE`, or `SPRINT`):

```text
Router Agent
      ↓
Test Summary Agent
      ↓
Collect Pipeline Execution Artifact and related artifacts
      ↓
Test Summary Report
      ↓
QA Review / Approval
      ↓
Test Summary Artifact
      ↓
Router Agent
```

Do not generate the Test Summary in the Router.

Do not start Sprint Summary unless the Router request is `SPRINT`.

The Test Summary Agent must not approve its own report.

---

### Step 11 — Determine the Next Activity

After successful completion, determine the next activity from:

- The original user request
- Workflow state
- Completed artifacts
- Dependencies
- Required approvals
- Available Agents and Skills

Do not assume the full QA chain must run.

If the user requested only one activity and its artifact is complete, stop and return the result.

If the next activity is required, prepare context and route to the next Agent.

---

### Step 12 — Handle Errors, Blocks, and Loops

If a subagent fails, returns incomplete artifacts, reports a blocked dependency, or cannot complete the activity:

- Retry when justified by a correctable execution issue.
- Return the task to the responsible Agent.
- Request clarification from the user.
- Stop the workflow and report the blocking issue.

Do not silently continue with incomplete results.

If routing history shows an indefinite A → B → A loop without new valid artifacts or a new user decision:

- Stop the loop.
- Preserve current state.
- Identify the reason.
- Request clarification or recover according to project rules.

---

## Workflow State Output

Communicate routing state concisely.

Before delegation, when useful:

```text
Activity: Requirement Analysis
Subagent: Requirement Analysis Agent
Skill: requirement-analysis
Expected Artifact: Requirement Analysis Artifact
Next: Product Owner Questionnaire / Stop / REQUIRES CLARIFICATION
```

For multi-step workflows:

```text
Completed:
✓ Requirement Analysis → Requirement Analysis Artifact

Current:
→ Impact Analysis / Impact Analysis Agent

Pending:
→ Test Plan (only if required by the request)

Approvals:
PENDING APPROVAL / APPROVED / NOT REQUIRED

Blocked:
No
```

Do not expose unnecessary internal reasoning.

---

## Completion Criteria

The Skill is complete for a routing cycle when:

1. The user request has been understood.
2. The required QA activity has been identified or marked as needing clarification.
3. The responsible Agent was selected from the existing architecture, or the missing Agent was reported.
4. Available context was passed to the selected Agent.
5. Expected artifacts were validated before completion was recorded.
6. Workflow state was updated.
7. Approval gates were enforced.
8. Unauthorized Jira writes were not performed.
9. The next required activity was determined from the request and state, or the workflow was correctly stopped.
10. Traceability from request to activity, Agent, artifact, approval, and next activity is preserved.
