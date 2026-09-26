#!/usr/bin/env node
/**
 * Central QA Approval Notification
 *
 * Invoked by the Router Agent (not by specialized Agents) when a QA
 * approval gate is reached. Plays an audible alert and writes an auditable
 * approval-request + notification event under .cursor/workflow/.
 *
 * Usage:
 *   node .cursor/hooks/qa-approval-notify.js --agent "Pipeline Creation Agent" --task "Generate CI/CD Pipeline" --status "PENDING_APPROVAL" --action "Create or update pipeline definition" --artifact "Pipeline Creation Artifact" --artifact-path ".cursor/workflow/pipeline-creation-artifact.yaml" --reason "QA approval is required before creating/updating the pipeline."
 *
 * Exit 0: notification delivered (sound played and files written)
 * Exit 1: notification could not be delivered — workflow must be BLOCKED
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const WORKFLOW_DIR = path.join(process.cwd(), ".cursor", "workflow");
const REQUEST_PATH = path.join(WORKFLOW_DIR, "qa-approval-request.json");
const EVENT_PATH = path.join(WORKFLOW_DIR, "qa-approval-notification.json");
const TRAIL_PATH = path.join(WORKFLOW_DIR, "qa-approval-trail.json");

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--")) {
      continue;
    }
    const name = key.slice(2).replace(/-/g, "_");
    const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "";
    out[name] = value;
  }
  return out;
}

function required(args) {
  const missing = [];
  ["agent", "task", "status", "action", "artifact"].forEach((field) => {
    if (!args[field]) {
      missing.push(field);
    }
  });
  return missing;
}

function formatBanner(args) {
  return [
    "QA APPROVAL REQUIRED",
    "",
    `Agent: ${args.agent}`,
    `Task: ${args.task}`,
    `Status: ${args.status}`,
    `Approval Required: ${args.reason || args.action}`,
    `Artifact: ${args.artifact}`,
    args.artifact_path ? `Artifact Path: ${args.artifact_path}` : null,
    `Required Action: ${args.required_action || "Review and approve, reject, or request changes."}`,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

function playAudibleNotification() {
  if (process.platform === "win32") {
    const script = [
      "$ErrorActionPreference = 'Stop'",
      "[console]::Beep(880, 250)",
      "Start-Sleep -Milliseconds 80",
      "[console]::Beep(1175, 400)",
      "$wav = Join-Path $env:WINDIR 'Media\\Windows Notify.wav'",
      "if (Test-Path -LiteralPath $wav) {",
      "  (New-Object System.Media.SoundPlayer $wav).PlaySync()",
      "} else {",
      "  [System.Media.SystemSounds]::Exclamation.Play()",
      "  Start-Sleep -Milliseconds 900",
      "}",
    ].join("; ");

    const result = spawnSync(
      "powershell",
      ["-NoProfile", "-NonInteractive", "-Command", script],
      { encoding: "utf8", timeout: 20000, windowsHide: true }
    );

    if (result.error) {
      throw result.error;
    }
    if (result.status !== 0) {
      throw new Error(result.stderr || result.stdout || `powershell exited ${result.status}`);
    }
    return "windows-beep-notify";
  }

  const bell = spawnSync("printf", ["\\a"], { encoding: "utf8", timeout: 5000 });
  if (bell.error || bell.status !== 0) {
    throw new Error("Audible notification is unavailable on this platform.");
  }
  return "terminal-bell";
}

function readTrail() {
  try {
    const raw = fs.readFileSync(TRAIL_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function main() {
  const args = parseArgs(process.argv);
  const missing = required(args);
  if (missing.length) {
    process.stderr.write(
      `QA approval notification failed. Missing arguments: ${missing.join(", ")}\n`
    );
    process.exit(1);
  }

  const requestedAt = new Date().toISOString();
  const banner = formatBanner(args);

  let channel;
  try {
    channel = playAudibleNotification();
  } catch (error) {
    process.stderr.write(
      `QA approval notification could not be delivered.\n${error.message || error}\n`
    );
    process.stderr.write("Workflow must be marked BLOCKED.\n");
    process.exit(1);
  }

  fs.mkdirSync(WORKFLOW_DIR, { recursive: true });

  const approvalRequest = {
    approval_request: {
      status: "PENDING",
      agent: args.agent,
      task: args.task,
      reason: args.reason || args.action,
      action: args.action,
      artifact: args.artifact,
      artifact_path: args.artifact_path || "UNKNOWN",
      requested_at: requestedAt,
      required_approval: "QA",
    },
  };

  const notificationEvent = {
    event: "QA_APPROVAL_REQUIRED",
    delivered: true,
    channel,
    delivered_at: new Date().toISOString(),
    banner,
    agent: args.agent,
    task: args.task,
    status: args.status,
    artifact: args.artifact,
  };

  const trailEntry = {
    agent: args.agent,
    task: args.task,
    artifact: args.artifact,
    artifact_path: args.artifact_path || "UNKNOWN",
    approval_request: approvalRequest.approval_request,
    approval_status: "PENDING",
    qa_decision: "PENDING",
    qa_feedback: "",
    timestamp: requestedAt,
    next_action: "WAIT_FOR_QA",
    notification: {
      delivered: true,
      channel,
    },
  };

  fs.writeFileSync(REQUEST_PATH, JSON.stringify(approvalRequest, null, 2));
  fs.writeFileSync(EVENT_PATH, JSON.stringify(notificationEvent, null, 2));

  const trail = readTrail();
  trail.push(trailEntry);
  fs.writeFileSync(TRAIL_PATH, JSON.stringify(trail, null, 2));

  process.stdout.write(`${banner}\n`);
  process.exit(0);
}

main();
