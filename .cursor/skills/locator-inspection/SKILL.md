---
name: locator-inspection
description: Inspect a Jira User Story target page in front-end source or the live DOM, identify actual UI elements, select locators by ID then Name then Class then CSS then XPath, and produce a Locator Inspection Artifact for the Router Agent. Use when the Locator Inspection Agent receives a Story ID and Environment URL.
---

# Locator Inspection

## Purpose

Inspect the target page for a Jira User Story and return one Locator Inspection Artifact to the Router Agent.

The owning Agent is the Locator Inspection Agent.

Do not invent elements, attributes, locators, pages, or URLs.

Do not implement automation or modify application code.

---

## Inputs

From the Router Agent:

```text
Jira User Story ID
Environment Artifact / Environment URL
```

Optional context:

- Front-end repository path if present in the workspace or Router context
- Prior Locator Inspection Artifact

If the Story ID is missing, stop with `REQUIRES CLARIFICATION`.

If the environment URL is missing, invalid, or not from the Environment Agent / Router, stop with `BLOCKED`. Do not construct a URL.

---

## Execution Workflow

```text
Receive Story ID and Environment URL from Router
      ↓
Retrieve User Story from Jira
      ↓
Identify target page from Story
      ↓
Front-end repository available?
      │
      ├── YES → Inspect page/component source
      └── NO  → Open Environment URL and inspect live DOM
      ↓
Detect existing UI elements by category
      ↓
Select locators using required priority
      ↓
Evaluate uniqueness and stability
      ↓
Validate locators against inspected source
      ↓
Build Locator Inspection Artifact
      ↓
Return Artifact to Router
```

---

## Step 1 — Retrieve the Story

Connect using the available Jira integration (Atlassian plugin / Jira tools).

Retrieve the issue by key. Read summary, description, acceptance criteria, and linked information when returned.

If retrieval fails, stop:

```text
Inspection Status: BLOCKED
Blocker: Jira Story cannot be retrieved
```

Do not guess the feature.

---

## Step 2 — Identify the Target Page

From the Story and available application information, identify the page that contains or will contain the feature (for example Home, Login, Contacts).

If the page cannot be determined from evidence:

```text
Target Page: UNRESOLVED
Inspection Status: REQUIRES CLARIFICATION
```

Do not inspect an arbitrary page.

---

## Step 3 — Choose Inspection Source

### Source A — Front-End Repository

If a front-end repository is available in the workspace or a confirmed path:

1. Locate the page or component for the target page.
2. Inspect HTML / JSX / TSX / templates and related frontend code.
3. Record attributes that exist in the code.
4. Treat the repository as a source of truth for those attributes.

If repository access is expected but fails, record the failure. Continue to Source B only when the Environment URL is present and usable.

### Source B — Website / DOM

If Front-End repository access is unavailable:

1. Use the Environment URL provided by the Router.
2. Navigate to the target page using available browser tools.
3. Inspect the actual DOM/HTML.
4. Identify elements and attributes that exist on the page.

If the URL is inaccessible or the page cannot be reached:

```text
Inspection Status: BLOCKED
Blocker: Environment URL inaccessible or required page cannot be reached
```

Do not infer locators without inspecting the page.

Record Inspection Source as `Front-End Repository` or `Website / DOM`.

---

## Step 4 — Detect Elements

Inspect the target page for these categories. Inspect only what exists.

1. Page Navigation — main, sidebar, header, menus, breadcrumbs
2. Headings — page, section, subsection
3. Buttons — primary, secondary, icon, submit, action, modal, table actions
4. Links — navigation, page, internal, external, action
5. Text Inputs — text, email, password, number, search, date, other text-entry
6. Dropdowns — native select, custom dropdown, combobox, autocomplete
7. Checkboxes
8. Radio Buttons
9. Switches — toggle, on/off
10. Tables — table, headers, rows, cells, identifiers
11. Table Actions — view, edit, delete, details, more, row menus
12. Forms — container, fields, submit, reset, validation elements when present
13. Pagination — next, previous, page numbers, first/last, container
14. Search and Filters — search input/button, filters, clear/apply, panels
15. File Input — upload input, upload button, file selector, related controls
16. Tooltips — triggers, related elements, containers when available
17. Loading Indicators — spinner, progress, skeleton, loading container
18. Images — relevant images and available attributes

Do not invent a category item that is absent.

For each category record `Detected`, `Not Detected`, or `Unable to Inspect`.

Do not list the same element twice.

---

## Step 5 — Select Locators

For each detected element, list attributes that actually exist.

Apply this priority:

```text
ID exists
→ Use ID

No ID
→ Check Name

No Name
→ Check Class Name

No Class Name
→ Use CSS Selector

No reliable CSS Selector
→ Use XPath
```

Do not use XPath when a reliable ID exists.

Do not create IDs or attributes.

If no reliable locator can be determined, mark the element `REQUIRES CLARIFICATION` / `BLOCKED` for that element. Do not guess.

---

## Step 6 — Reliability and Validation

For each selected locator, evaluate from the inspected source:

- Unique / Non-unique
- Stable / Potentially unstable / Dynamic
- Dependent on generated values
- Dependent on DOM position
- Dependent on volatile classes

Where tools allow, validate that the locator resolves to the intended element and is not unexpectedly duplicated.

Do not claim validation without evidence.

If the highest-priority locator is unstable, still record it with Stability and Notes. Do not silently call it reliable.

---

## Step 7 — Locator Inspection Artifact

```text
# Locator Inspection Artifact

Inspection Status:
User Story ID:
Target Page:
Environment URL:
Inspection Source:

Category Coverage:
- Page Navigation:
- Headings:
- Buttons:
- Links:
- Text Inputs:
- Dropdowns:
- Checkboxes:
- Radio Buttons:
- Switches:
- Tables:
- Table Actions:
- Forms:
- Pagination:
- Search and Filters:
- File Input:
- Tooltips:
- Loading Indicators:
- Images:

Detected Elements:
```

For every detected element:

```text
Element Type:
Element Name / Identifier:
Page:
Section / Location:
Element Description:
Locator Strategy:
Locator Value:
Available Attributes:
Uniqueness:
Stability:
Inspection Source:
Notes:
```

Inspection Status must be one of:

- `BLOCKED`
- `REQUIRES CLARIFICATION`
- `INSPECTION COMPLETED`
- `INSPECTION COMPLETED WITH ISSUES`

Do not include secrets.

---

## Step 8 — Validate Before Return

Confirm:

1. Jira Story was retrieved.
2. Target page was identified.
3. Environment URL came from the Router / Environment Agent.
4. Inspection source is stated.
5. Every detected relevant element has a locator that exists in the inspected source.
6. Locator priority was respected.
7. No locator or element was invented.
8. Unstable or ambiguous locators are identified.
9. The artifact is complete enough for the Framework Creation Agent and the Test Case Automation Agent.

Return the artifact to the Router Agent. Do not send it directly to automation implementation.

---

## Completion Criteria

The Skill is complete when:

1. Story retrieval was attempted with the available Jira integration.
2. Target page is identified or reported unresolved.
3. Inspection used repository and/or live DOM, or a blocker was returned.
4. Element categories are Detected, Not Detected, or Unable to Inspect.
5. Detected elements have evidence-based locators.
6. Reliability is recorded.
7. The Locator Inspection Artifact is returned to the Router Agent.
