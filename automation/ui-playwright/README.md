# Playwright UI Automation Framework

Foundation-only Playwright Test + TypeScript project. Locators, Page Objects, environment URL, and feature tests are not included yet.

Those pieces are added later from:

- Locator Inspection Artifact
- Environment Artifact
- Test Case Automation Artifact

## Structure

```text
automation/ui-playwright/
  package.json
  playwright.config.ts
  tsconfig.json
  .gitignore
  .env.example
  README.md
  config/env.ts
  fixtures/index.ts
  pages/
  components/
  tests/
  data/
  utils/
  constants/
  auth/
```

## Install

```text
cd automation/ui-playwright
npm install
npx playwright install
```

## Environment URL

Do not invent a host. `playwright.config.ts` sets `use.baseURL` only when `ODYX_BASE_URL` or `BASE_URL` is set.

When the Environment Artifact exists:

1. Copy `.env.example` to `.env` (optional local reminder; this project does not load `.env` automatically).
2. Set the URL in the shell from the Environment Artifact, for example:

```text
$env:ODYX_BASE_URL = "<Environment Artifact URL>"
```

`config/env.ts` throws if a test asks for the URL and the variable is unset. There is no fallback host.

## Run

```text
npx tsc --noEmit
npx playwright test --list
npx playwright test
npx playwright show-report
```

Feature tests are not present in this foundation. Discovery is expected to list 0 tests until the Test Case Automation Artifact is integrated.
