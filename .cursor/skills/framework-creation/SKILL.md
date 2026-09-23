---
name: framework-creation
description: Create or modify a Playwright UI automation framework from Locator Inspection, Environment, and Test Case Automation artifacts after QA approval, then return a Framework Creation Artifact to the Router Agent. Use when the Framework Creation Agent receives those artifacts.
---

# Framework Creation

## Purpose

Create, extend, or modify the Playwright UI Automation Framework and return one Framework Creation Artifact to the Router Agent.

The owning Agent is the Framework Creation Agent.

Do not invent locators, environment URLs, test cases, or application behavior.

Do not create or modify framework files before explicit QA approval.

Do not simulate Playwright, npm, TypeScript, or test results.

---

## Inputs

From the Router Agent:

```text
Locator Inspection Artifact
Environment Artifact
Test Case Automation Artifact
```

---

## Execution Workflow

```text
Receive Artifacts from Router
      ↓
Validate Inputs
      ↓
Inspect Existing Framework
      ↓
Analyze Locator Artifact
      ↓
Analyze Environment Artifact
      ↓
Analyze Test Case Automation Artifact
      ↓
Design Framework Architecture
      ↓
Present Architecture + Proposed Changes to QA
      ↓
WAIT FOR QA APPROVAL
      ↓
QA APPROVED
      ↓
Start Framework Creation / Modification
      ↓
Integrate Locators
      ↓
Integrate Environment
      ↓
Integrate Automated Tests
      ↓
Validate Framework
      ↓
Create Framework Creation Artifact
      ↓
Return Artifact to Router
```

---

## Step 1 — Input Validation

Confirm each artifact exists and is usable.

| Artifact | Required evidence |
| --- | --- |
| Locator Inspection Artifact | Target page, inspection source, detected elements with locator strategy and value |
| Environment Artifact | Selected environment, Environment URL |
| Test Case Automation Artifact | Automated test cases related to the feature or story |

If an artifact is missing, `BLOCKED`, or `REQUIRES CLARIFICATION` in a way that blocks design, stop and return that status to the Router.

Do not invent replacements.

---

## Step 2 — Inspect Existing Framework

Search the workspace for Playwright UI projects (`package.json`, `playwright.config.ts`, `tests/`, `pages/`).

Record:

- Current architecture
- Existing Page Objects, components, fixtures, tests, configuration
- Package manager (use npm unless another is already in use)
- What can be reused

Do not create a second Playwright UI framework when a suitable one exists.

If no framework exists, the proposal will be a new Playwright Test + TypeScript + npm project.

Only add folders justified by the artifacts and existing conventions:

```text
playwright.config.ts
package.json
tsconfig.json
tests/
pages/
components/
fixtures/
data/
utils/
constants/
auth/
```

Preserve an existing valid layout unless a change is required.

---

## Step 3 — Consume Artifacts

### Locator Inspection Artifact

1. Read the target page.
2. Identify inspected elements needed by the automated tests.
3. Keep locator strategy and value unless validation proves them invalid.
4. Map each element into a Page Object or Component Object.

Example mapping when the artifact provides ID `add-contact-btn`:

```ts
readonly addContactButton = this.page.locator('#add-contact-btn');
```

If the artifact already provides a supported Playwright-native locator (`getByRole`, `getByLabel`, `getByTestId`, `getByText`, `getByPlaceholder`), use that implementation.

Do not blindly translate a locator into an invalid selector.

Do not invent locators.

Avoid `nth-child`, generated classes, DOM position, unstable generated IDs, and `.first()` / `.nth()` used only to hide ambiguity.

### Environment Artifact

Use Selected Environment and Environment URL only.

Wire URL into Playwright configuration through env/config (for example `ODYX_BASE_URL` or the project's existing env mechanism). Do not hardcode an invented URL.

If URL is `MISSING`, stop. Do not substitute commented or potential hosts.

### Test Case Automation Artifact

Identify automated tests for the feature.

Map each test to a target Page Object and Test Layer path.

Preserve intended business behavior. Organize by page/feature, for example:

```text
tests/
├── home/home.spec.ts
├── users/users.spec.ts
└── contacts/contacts.spec.ts
```

Tests must consume Page Objects, Components, fixtures, data, and environment configuration.

---

## Step 4 — Architecture Proposal (mandatory stop)

Present a Framework Architecture Proposal. Do not write framework files yet.

Include:

### Framework Architecture

- Folder structure
- Test Layer
- Page Objects
- Components
- Fixtures
- Test Data
- Utilities
- Authentication approach
- Environment configuration approach
- Playwright configuration (baseURL, testDir, browsers, timeouts, retries, workers, reporter, trace, screenshot, video)

### Existing Framework Analysis

If a framework exists: current architecture, reusable assets, what will be preserved, modified, added, and why.

### Artifact Integration

How Locator Inspection, Environment, and Test Case Automation artifacts will be integrated.

### Proposed Changes

```text
Created
Modified
Preserved
```

Then wait for explicit QA approval such as `APPROVED`.

---

## Step 5 — Implement After Approval

Revalidate repository state and artifacts.

Then:

1. Create or modify only approved files.
2. Integrate locators into Page Objects / Components.
3. Create Component Objects only when the same UI is shared (navbar, modal, table, filters, pagination, toast, date picker, dropdown, dialog).
4. Configure Playwright from the Environment Artifact.
5. Add fixtures for Page Objects, auth, and shared setup. Do not put business test logic in generic fixtures.
6. Put tests in the Test Layer. Use `expect` web-first assertions. Do not use `waitForTimeout` unless a documented reason exists.
7. Keep tests isolated. Prefer reusable auth storage state. Never hardcode secrets.
8. Put static data under `data/`. Use factories only when dynamic data is required and the artifact supports it.
9. Avoid unrelated refactoring.

Page Objects contain page locators, actions, navigation, and page-specific helpers only.

---

## Step 6 — Validate

Run real commands. Do not simulate results.

Typical checks when tooling exists:

```text
npm install
npx tsc --noEmit
npx playwright test --list
npx playwright test
```

Record commands, pass/fail, and `NOT EXECUTED` with reason when a tool is missing.

Validate: dependencies, TypeScript, Playwright config, test discovery, fixtures, Page Objects, components, auth, environment, tests, reporting.

Enable trace/screenshot/video on failure unless the project requires more.

---

## Step 7 — Framework Creation Artifact

Return this artifact to the Router Agent.

```text
# Framework Creation Artifact

Framework Status:
READY | READY WITH ISSUES | BLOCKED

Architecture:
- Folder structure
- Test Layer
- Page Objects
- Components
- Fixtures
- Data
- Utilities
- Configuration
- Authentication
- Environment integration

Artifact Inputs:
- Locator Inspection Artifact
- Environment Artifact
- Test Case Automation Artifact

Implemented Changes:
- Files created
- Files modified
- Files preserved
- Page Objects created/updated
- Components created/updated
- Fixtures created/updated
- Tests added/updated
- Configuration changes
- Environment changes

Locator Integration:
Environment Integration:
Test Integration:

Validation:
- Commands executed
- Tests executed
- Passed tests
- Failed tests
- Configuration validation
- TypeScript validation

Remaining Issues:
Assumptions:
```

Framework Status `READY` only when approved architecture is implemented, Playwright and TypeScript are configured, environment and locators are integrated, required Page Objects/components/fixtures/tests exist, no secrets are hardcoded, and actual validation ran.

---

## Completion Criteria

Complete only when:

1. Required artifacts were validated or a blocker was returned.
2. Existing framework was inspected.
3. Architecture was presented and QA approved before file changes.
4. Approved architecture was implemented.
5. Locators, environment, and automated tests were integrated from artifacts.
6. Actual validation was performed or reported as not executed.
7. Framework Creation Artifact was returned to the Router.
