---
name: qa-needs-clarification
description: Authoritative catalog of Agent-specific Needs Clarification conditions with IDs, questions, and BLOCKED vs UNKNOWN mapping. Use before executing any specialist activity to evaluate, skip resolved items, and ask only applicable missing information.
---

# QA Needs Clarification Catalog

These conditions **preserve** each Agent’s existing Needs Clarification semantics. Do not replace, ignore, or invent extra requirements unless execution newly reveals a missing prerequisite.

Evaluate each applicable condition:

`NOT_APPLICABLE` | `RESOLVED` (with source) | `REQUIRES_CLARIFICATION` | `UNKNOWN` | `BLOCKED`

Ask only when the condition applies **and** the value is missing. Do not ask if the answer is already in Router input, a prior artifact, or a successful retrieval.

Independent open items may be asked together. Re-evaluate after every answer. Execute only when overall status is `READY`.

Human-answerable missing facts → `REQUIRES_CLARIFICATION`.  
Inspected, insufficient/conflicting evidence → `UNKNOWN` (Router may escalate to clarification if a human can resolve).  
Tool/environment/artifact/system unavailable → `BLOCKED`.

---

## Router (`RTR`)

| ID | Condition | Question / expected answer |
| --- | --- | --- |
| RTR-CL-001 | Request does not map to a known QA activity | What QA activity should be performed? |
| RTR-CL-002 | Required specialist Agent does not exist | Do not invent an Agent. Report missing capability. |
| RTR-CL-003 | Critical routing input missing | What is the Story/Feature/Sprint/Bug/Jira ID/activity? (exact missing field) |

---

## Requirement Analysis (`RA`)

| ID | Condition | Question / expected answer |
| --- | --- | --- |
| RA-CL-001 | User Story / Jira issue cannot be obtained | Provide the User Story text or Jira issue key. |
| RA-CL-002 | Business Goal cannot be determined from the Story | What is the intended business goal of this Story? Free text. |
| RA-CL-003 | Requirements / AC / expected behavior missing or ambiguous | Yes/No Questionnaire items from identified gaps only. Do not invent questions. |

---

## Impact Analysis (`IA`)

| ID | Condition | Question / expected answer |
| --- | --- | --- |
| IA-CL-001 | User Story / Jira issue cannot be obtained | Provide the User Story or Jira issue key. |
| IA-CL-002 | Critical information required to determine impact is missing | State the exact missing impact input. |
| IA-CL-003 | Existing tests for Regression Scope cannot be accessed and no alternative evidence | Where can existing test coverage be read, or confirm none exists. |
| IA-CL-004 | Conflicting information prevents a reliable impact conclusion | `UNKNOWN` first; if QA can resolve: which source is authoritative? |

---

## Test Case Creation (`TC`)

| ID | Condition | Question / expected answer |
| --- | --- | --- |
| TC-CL-001 | Input mode ambiguous (Requirement Analysis Artifact vs User Story vs Jira ID) | Which input should be used? Artifact / User Story / Jira ID. |
| TC-CL-002 | Jira retrieval fails and no other source | Provide Story text or a retrievable Jira key. |
| TC-CL-003 | Essential FR / AC / Edge Case data missing | Provide the missing requirement/AC/edge case (do not invent expected results). |
| TC-CL-004 | Blocking Requirement Analysis gaps still open | Answer the open RA Questionnaire items. |

---

## Test Plan (`TP`)

| ID | Condition | Question / expected answer |
| --- | --- | --- |
| TP-CL-001 | No User Story, Jira ID, or Sprint Started event, and no source | Provide Story, Jira ID, or confirm Sprint Started routing. |
| TP-CL-002 | Jira retrieval fails and no alternative source | Provide Story/Sprint text or a retrievable key. |
| TP-CL-003 | Sprint identity or Sprint scope cannot be determined | What is the Sprint name/ID and in-scope stories? |
| TP-CL-004 | Confluence publication requested without approval or tool | Approval/tool: `BLOCKED` if integration missing; clarification if Sprint/space unknown. |

---

## Environment (`ENV`)

| ID | Condition | Question / expected answer |
| --- | --- | --- |
| ENV-CL-001 | User Story ID missing | What is the Jira User Story / Issue ID? |
| ENV-CL-002 | Front-end Sub-task missing or multiple plausible matches | Which Jira sub-task is the Front-end implementation source? Issue key. |
| ENV-CL-003 | Back-end Sub-task missing or multiple plausible matches | Which Jira sub-task is the Back-end implementation source? Issue key. |
| ENV-CL-004 | Sub-task statuses do not match Development/Staging/Production mapping | Confirm intended environment or correct sub-task statuses. Do not guess. |
| ENV-CL-005 | Environment URL not provided / not found in sources | What is the environment URL? |
| ENV-CL-006 | URL exists but environment unreachable | `BLOCKED` — restore/access the environment. Not a platform-choice question. |

---

## Locator Inspection (`LI`)

| ID | Condition | Question / expected answer |
| --- | --- | --- |
| LI-CL-001 | Story ID missing | What is the Jira User Story ID? |
| LI-CL-002 | Story cannot be retrieved | Provide a retrievable key or Story text. |
| LI-CL-003 | Environment URL missing/invalid | What environment URL should be inspected? |
| LI-CL-004 | Target page cannot be determined from the Story | Which target page should be inspected? Path or name. |
| LI-CL-005 | Page known but environment technically unavailable | `BLOCKED`. |
| LI-CL-006 | Element has no reliable locator | Per-element `REQUIRES_CLARIFICATION` / `BLOCKED`. Do not guess locators. |

---

## Test Case Automation (`TCA`)

| ID | Condition | Question / expected answer |
| --- | --- | --- |
| TCA-CL-001 | Neither Test Case Artifact nor retrievable Jira Story ID | Provide Test Case Artifact or Jira Story ID. |
| TCA-CL-002 | Jira fallback retrieval fails | Provide a retrievable Story or the Test Case Artifact. |
| TCA-CL-003 | Conversion would require inventing locators/endpoints/data/expected results | Supply the missing fact or Locator Inspection Artifact. Do not invent. |

---

## Framework Creation (`FC`)

| ID | Condition | Question / expected answer |
| --- | --- | --- |
| FC-CL-001 | Locator Inspection, Environment, or Test Case Automation artifact missing/blocked | Which required artifact should be produced first, or provide it. |
| FC-CL-002 | Environment URL missing | What is the environment URL? |
| FC-CL-003 | Locators cannot be integrated without invention | Provide Locator Inspection Artifact / real locators. |
| FC-CL-004 | Implementation would require inventing test intent | Provide Test Case Automation Artifact / test intent. |

---

## Pipeline Creation (`PC`)

| ID | Condition | Question / expected answer |
| --- | --- | --- |
| PC-CL-001 | CI/CD platform cannot be confirmed | Which CI/CD platform? GitHub Actions / GitLab CI / Jenkins / Azure DevOps / Other. Skip if Router already provided a platform. |
| PC-CL-002 | Test execution command cannot be determined | What command runs the tests? (from project evidence preferred) |
| PC-CL-003 | Environment URL / env details unknown | What environment URL / variable names should the pipeline use? |
| PC-CL-004 | No automation project can be inspected | `BLOCKED` (or path to the project if a human can provide it). |
| PC-CL-005 | Platform configured but technically unavailable | `BLOCKED`. Do not re-ask platform. |

---

## Pipeline Execution (`PE`)

| ID | Condition | Question / expected answer |
| --- | --- | --- |
| PE-CL-001 | Pipeline Creation Artifact missing or unapproved | Provide an approved Pipeline Creation Artifact. |
| PE-CL-002 | Execution type unclear | Which execution type? `NORMAL` / `BUG_RETEST` / `STORY_REGRESSION`. |
| PE-CL-003 | Bug re-test: Bug → Test Case → Automated Test cannot be established | What Bug ID and related automated test should run? |
| PE-CL-004 | Story regression: Story tests cannot be identified | Which User Story ID and which automated tests? |
| PE-CL-005 | Platform/commands/secrets/execution mechanism unavailable | `BLOCKED`. Do not ask for a new platform if one is already configured but down. |

---

## Automated Field Test Cases Analysis (`AFT`)

| ID | Condition | Question / expected answer |
| --- | --- | --- |
| AFT-CL-001 | Pipeline Execution Artifact missing | Provide the Pipeline Execution Artifact. |
| AFT-CL-002 | Failed tests cannot be identified | Confirm which tests failed or provide a report path. |
| AFT-CL-003 | Evidence paths cannot be resolved | Provide valid screenshot/log/report paths. |
| AFT-CL-004 | Expected behavior from Test Case/AC unknown | What was the expected result for the failed test? |
| AFT-CL-005 | Sources conflict; root cause cannot be chosen | `UNKNOWN`. If QA can resolve: which evidence is authoritative? Do not guess root cause. |

---

## Bug Creation (`BC`)

| ID | Condition | Question / expected answer |
| --- | --- | --- |
| BC-CL-001 | Pipeline Execution or Analysis artifact missing | Provide both artifacts. |
| BC-CL-002 | No matching analysis row | Which analysis result applies to this failed test? |
| BC-CL-003 | FRONT-END vs BACK-END cannot be determined | `UNKNOWN` first. If QA can decide: FRONT-END or BACK-END? Do not assign by assumption. |
| BC-CL-004 | BACK-END CURL missing | Provide the CURL evidence path or confirm FRONT-END. |
| BC-CL-005 | Assignee cannot be resolved in Jira | Confirm Jira account for Mohamed Sanhouri or Mahmoud Rizk. |
| BC-CL-006 | Priority cannot be determined | What priority should be used? Or leave until evidenced. |
| BC-CL-007 | User Story ID unknown | What User Story should the Bug `BLOCKS`? |
| BC-CL-008 | Expected result unknown | What is the expected result from AC/test case? |

---

## Test Summary (`TS`)

| ID | Condition | Question / expected answer |
| --- | --- | --- |
| TS-CL-001 | Scope missing/ambiguous | Is this `STORY`, `FEATURE`, or `SPRINT`? |
| TS-CL-002 | Target missing | What is the Story ID, Feature name/id, or Sprint name/id? |
| TS-CL-003 | Feature: Story relationships unconfirmed | Which Stories belong to this Feature? Do not invent membership. |
| TS-CL-004 | Sprint membership cannot be read | Confirm Sprint name/id and in-scope issues. |
| TS-CL-005 | Execution data missing for the scope | Provide Pipeline Execution Artifact(s) for the scope. |
| TS-CL-006 | Bug status unverifiable | `UNKNOWN` or provide Jira access / keys. |

---

## Prerequisite evaluation template

```text
Prerequisite Evaluation:
[ID] Status: RESOLVED | NOT_APPLICABLE | REQUIRES_CLARIFICATION | BLOCKED | UNKNOWN
Source / Question / Reason as applicable

Overall Status: READY | REQUIRES_CLARIFICATION | BLOCKED | UNKNOWN
```

Execution allowed only when `Overall Status = READY`.
