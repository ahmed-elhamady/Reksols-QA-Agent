---

name: automated-failed-test-analysis
description: Analyzes failed automated test cases to identify evidence-based root causes and determine the appropriate corrective action.
-----------------------------------------------------------------------------------------------------------------------------------------

# Automated Failed Test Analysis

## Purpose

Analyze failed automated test cases to determine the actual reason for failure and distinguish application defects from automation, test data, environment, configuration, infrastructure, or dependency issues.

The Skill focuses on root cause analysis of automated test failures.

It does not create Jira bugs or modify application or automation code.

---

# Inputs

The Skill may use:

* Automated test execution results
* CI/CD pipeline results
* Test reports
* Logs
* Error messages
* Stack traces
* Screenshots
* Videos
* Request and response data
* Browser evidence
* Test case
* Jira Story
* Requirements
* Acceptance Criteria
* Automation source code
* Automation framework
* Test data
* Environment readiness information
* Environment configuration
* Dependency information
* Previous execution results
* Available project files
* Available MCP/tools

---

# Execution Workflow

## Step 1 — Identify Failed Test

Identify:

* Test Case
* Automated Test
* Test Suite
* Execution
* Pipeline
* Environment
* Application
* Related Story

Confirm that the reported execution actually failed.

Do not analyze a failure that cannot be verified from available evidence.

---

## Step 2 — Collect Failure Evidence

Collect relevant evidence, where available:

* Test execution output
* Logs
* Error messages
* Stack traces
* Screenshots
* Videos
* Browser state
* API requests
* API responses
* HTTP status codes
* Response bodies
* Test data
* Environment information
* Configuration information
* Dependency results

Do not invent missing evidence.

If required evidence is unavailable, record:

`UNKNOWN`

or:

`REQUIRES VERIFICATION`

---

## Step 3 — Understand the Expected Behavior

Identify the expected behavior from authoritative sources such as:

* Approved Test Case
* Acceptance Criteria
* Requirements
* Business Rules

The expected behavior must not be inferred from the failure alone.

If the expected behavior cannot be established, mark it as:

`REQUIRES CLARIFICATION`

---

## Step 4 — Analyze the Failure

Analyze the relationship between:

```text
Test
  ↓
Automation
  ↓
Test Data
  ↓
Environment
  ↓
Application
  ↓
Dependencies
```

Determine where the failure occurred.

Investigate, where applicable:

* Locator resolution
* Assertion logic
* Test implementation
* Request construction
* Response validation
* Test data
* Authentication
* Environment availability
* Configuration
* Infrastructure
* External dependencies
* Application behavior

Do not classify the failure before reviewing the available evidence.

---

## Step 5 — Identify Root Cause

Determine the most supported root cause based on the available evidence.

Possible classifications include:

### Application Bug

The application behavior contradicts the established expected behavior and the failure is not explained by an automation, data, environment, configuration, infrastructure, or dependency issue.

### Automation Bug

The automated test implementation is incorrect, including cases such as:

* Incorrect locator
* Incorrect assertion
* Incorrect test logic
* Incorrect request construction
* Incorrect automation flow
* Incorrect synchronization

### Test Data Issue

The failure is caused by:

* Missing test data
* Invalid test data
* Incorrect test state
* Expired test data
* Unexpected data dependency

### Environment Issue

The failure is caused by:

* Unavailable environment
* Unavailable service
* Authentication availability
* Connectivity problem
* Database availability
* Environment dependency

### Configuration Issue

The failure is caused by:

* Incorrect configuration
* Missing configuration
* Invalid environment variables
* Incorrect endpoint
* Incorrect feature configuration

### Infrastructure Issue

The failure is caused by:

* CI runner
* Browser infrastructure
* Build infrastructure
* Network infrastructure
* Resource availability

### Dependency Issue

The failure is caused by an unavailable or malfunctioning dependency required by the application or test.

### Unknown

Available evidence is insufficient to establish a reliable root cause.

Do not force a classification when evidence is insufficient.

---

## Step 6 — Verify the Root Cause

Where possible, verify the suspected root cause through additional evidence or reproduction.

Possible verification methods include:

* Re-running the test
* Re-running the relevant test step
* Repeating the API request
* Checking the application behavior manually
* Checking logs
* Checking environment availability
* Comparing with a successful execution
* Inspecting the relevant automation implementation

Do not claim reproduction unless it was actually performed.

---

## Step 7 — Determine Corrective Action

Based on the confirmed classification, identify the appropriate next action:

* Create Bug
* Fix Automation
* Update Test Data
* Fix Environment
* Fix Configuration
* Resolve Infrastructure Issue
* Resolve Dependency
* Re-run Test
* Gather More Evidence

The Skill identifies the recommended action but does not perform actions owned by other workflows.

---

## Step 8 — Maintain Traceability

Maintain the relationship:

```text
Story
  ↓
Test Case
  ↓
Automated Test
  ↓
Execution
  ↓
Failure
  ↓
Root Cause
  ↓
Corrective Action
```

Preserve the original Test Case and Story references.

---

# Output

Produce a Failed Test Analysis Report containing:

## 1. Failure Information

* Test Case
* Automated Test
* Execution
* Pipeline
* Environment
* Story

## 2. Expected Behavior

The expected result supported by the approved requirement or Test Case.

## 3. Actual Behavior

The behavior observed during the failed execution.

## 4. Evidence

* Logs
* Errors
* Screenshots
* Videos
* Request/Response
* Stack Trace
* Other available evidence

## 5. Root Cause

State the identified root cause and supporting evidence.

## 6. Failure Classification

Use one of:

* Application Bug
* Automation Bug
* Test Data Issue
* Environment Issue
* Configuration Issue
* Infrastructure Issue
* Dependency Issue
* Unknown

## 7. Root Cause Confidence

Classify the evidence as:

* CONFIRMED
* POTENTIAL
* UNKNOWN
* REQUIRES VERIFICATION

Do not use confidence as a numerical score.

## 8. Reproduction

State:

* Reproduced
* Not Reproduced
* Not Attempted
* Unable to Reproduce

Include evidence where applicable.

## 9. Recommended Action

Identify the appropriate next action.

## 10. Traceability

Include:

* Story
* Test Case
* Automated Test
* Execution

---

# Completion Criteria

The Skill is complete when:

1. The failed test is identified.
2. Failure evidence is collected where available.
3. Expected behavior is established from an authoritative source.
4. The failure is analyzed.
5. A root cause is identified or marked Unknown.
6. The failure is classified.
7. Root cause verification is attempted where applicable.
8. The recommended corrective action is identified.
9. Traceability is maintained.
10. The Failed Test Analysis Report is produced.
