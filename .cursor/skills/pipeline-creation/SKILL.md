---
name: pipeline-creation
description: Inspect an existing automation project, detect technologies and real test commands, design a CI/CD pipeline only after the platform is confirmed, obtain QA approval, and return a Pipeline Creation Artifact to the Router Agent. Use when the Pipeline Creation Agent is asked to create a pipeline definition.
---

# Pipeline Creation

## Purpose

Inspect the automation project and produce one Pipeline Creation Artifact for the Router Agent and later Pipeline Execution Agent.

The owning Agent is the Pipeline Creation Agent.

Do not invent platforms, commands, URLs, versions, or secret values.

Do not execute the pipeline.

Do not create the framework or automated test cases.

---

## Inputs

Primary: automation project in the workspace.

Supporting, when the Router provides them:

- Test Case Automation Artifact
- Framework Creation Artifact
- Environment Artifact
- Explicit CI/CD platform instruction

---

## Execution Workflow

```text
Inspect Automation Project
      ↓
Detect technologies, commands, test types
      ↓
Determine platform (or REQUIRES CLARIFICATION)
      ↓
Design stages, env, secrets-by-name, reports
      ↓
Validate Pipeline Artifact
      ↓
Present to QA (PENDING QA REVIEW)
      ↓
Approved? ── NO → Rework → QA Review
      ↓ YES
Return Pipeline Creation Artifact to Router
```

---

## Step 1 — Inspect the Automation Project

Inspect the actual tree. Record project type, framework folders, test/config/data/report paths, and existing CI or Docker files.

If no automation project is found:

```text
validation.status: BLOCKED
blockers: Automation project not found
```

Stop. Do not invent a project.

---

## Step 2 — Detect Technologies

Identify only technologies present in files, for example Node.js, npm, TypeScript, Playwright, Java, Maven, Gradle, REST Assured.

Do not assume Playwright or REST Assured because they are mentioned in agent skills.

---

## Step 3 — Detect Execution Commands

Read `package.json`, `pom.xml`, `build.gradle`, Playwright config, scripts, README, and existing CI.

Record the actual command, working directory, and required env or flags.

Examples such as `npx playwright test` are not defaults. Use them only if the project supports them.

If the command cannot be determined: `BLOCKED`.

---

## Step 4 — Test Types and Order

Include only test types evidenced by the project or artifacts (for example UI tests if Playwright tests exist).

Derive stage order from real dependencies. If none, independent execution is allowed. Do not copy a generic api-then-ui order without evidence.

---

## Step 5 — Determine Platform

1. Explicit user/Router instruction
2. Existing pipeline config in the repo
3. Otherwise `REQUIRES CLARIFICATION`

Ask:

> The automation project is ready for pipeline generation, but the CI/CD platform has not been specified or detected. Please specify the target platform (for example, GitHub Actions, GitLab CI, Jenkins, or Azure DevOps).

Do not assume GitHub Actions from GitHub hosting.

If the user explicitly says this QA system will be pushed to GitHub and requests a GitHub-based pipeline, GitHub Actions may be used, then still inspect the real project.

Do not write `.github/workflows/*`, `.gitlab-ci.yml`, `Jenkinsfile`, or `azure-pipelines.yml` until the platform is confirmed and any required file-creation approval is obtained.

---

## Step 6 — Environment, Variables, Secrets

Use the Environment Artifact when present.

Document names only:

```text
required_variables:
  - BASE_URL
required_secrets:
  - TEST_PASSWORD
```

Never write secret values.

If URL or environment is unknown, mark `UNKNOWN` / `REQUIRES CLARIFICATION`.

---

## Step 7 — Stages, Reports, Failure

Create only stages justified by the project (for example setup/install and ui-tests for a Playwright-only project with no API suite).

For reports, include only outputs the project actually configures (for example Playwright `html` reporter, `test-results`, traces/screenshots/videos on failure).

Failure handling: preserve those artifacts and fail the pipeline on test failure unless the project explicitly defines otherwise. Do not ignore failures to make CI green.

Document runtime versions only when found in the project (for example Node/Playwright from package.json). Do not invent versions.

---

## Step 8 — Validate Before QA

Confirm:

- Automation project exists
- Technologies and commands are from evidence
- Platform is confirmed or status is `REQUIRES CLARIFICATION`
- Stages and artifact paths are justified
- Variables and secret **names** only
- Execution readiness is one of: `READY FOR EXECUTION` | `READY WITH ISSUES` | `BLOCKED` | `REQUIRES CLARIFICATION`

Do not claim `READY FOR EXECUTION` when platform, commands, or project are missing.

---

## Step 9 — QA Review

Status `PENDING QA REVIEW`. Present the artifact.

`APPROVED` or `REJECTED — REWORK REQUIRED`. Rework only affected sections. Do not send to Router as final until approved.

---

## Step 10 — Pipeline Creation Artifact

Adapt this structure to evidence. Do not copy unsupported values.

```yaml
pipeline:
  name:
  platform:

  repository:
    name:
    branch:

  runtime:

  stages: []

  environment:
    target:
    required_variables: []
    required_secrets: []

  execution:
    ui:
      framework:
      test_type:
      working_directory:
      command:

  artifacts: []

  failure_handling:
    preserve_test_artifacts: true
    fail_pipeline_on_test_failure: true

  pipeline_definition:
    file:

  validation:
    status:
    blockers: []

  qa_review:
    status: PENDING QA REVIEW
```

The Pipeline Execution Agent must be able to read platform, definition path, environment, variables, secret names, technologies, test types, commands, order, dependencies, artifacts, failure behavior, and preconditions without rediscovering the repo.

Return the approved artifact to the Router. Do not execute the pipeline.

---

## Completion Criteria

Complete when the project was inspected, technologies and commands identified, platform confirmed or clarified, stages and env documented, artifact generated, QA reviewed (including rework), and the approved Pipeline Creation Artifact was returned to the Router.
