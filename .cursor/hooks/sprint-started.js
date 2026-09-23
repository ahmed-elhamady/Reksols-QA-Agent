#!/usr/bin/env node
/**
 * Sprint Started Hook
 *
 * Cursor does not expose Jira's native "Sprint Started" webhook as a hook event.
 * This hook detects a Sprint Started signal that actually occurs inside Cursor:
 * - a user/Product Owner prompt stating that the Sprint started
 * - a tool/MCP result whose text actually indicates a Sprint started
 *
 * When detected, it writes .cursor/workflow/sprint-started-event.json for the
 * Router Agent. It does not invent Sprint IDs, names, or Jira data.
 */

const fs = require("fs");
const path = require("path");

const EVENT_PATH = path.join(
  process.cwd(),
  ".cursor",
  "workflow",
  "sprint-started-event.json"
);

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function writeStdout(value) {
  process.stdout.write(JSON.stringify(value));
}

function looksLikeSprintStarted(text) {
  if (!text || typeof text !== "string") {
    return false;
  }

  const value = text.toLowerCase();
  return (
    /\bsprint\s+(has\s+)?started\b/.test(value) ||
    /\bstarted\s+(the\s+)?sprint\b/.test(value) ||
    /\bsprint\s+started\s+event\b/.test(value) ||
    /\bproduct\s+owner\s+started\s+(the\s+)?sprint\b/.test(value)
  );
}

function extractKnownFields(text) {
  const fields = {};
  if (!text) {
    return fields;
  }

  const sprintIdMatch = text.match(
    /\b(?:sprint[\s_-]*id|sprint)\s*[:#]\s*([A-Za-z0-9._-]+)/i
  );
  if (sprintIdMatch) {
    fields.sprintId = sprintIdMatch[1];
  }

  const projectMatch = text.match(/\b(?:project|jira project)\s*[:#]\s*([A-Za-z][A-Za-z0-9]+)\b/i);
  if (projectMatch) {
    fields.project = projectMatch[1];
  }

  return fields;
}

function writeEvent(source, evidence, extra) {
  const directory = path.dirname(EVENT_PATH);
  fs.mkdirSync(directory, { recursive: true });

  const event = {
    event: "SPRINT_STARTED",
    source,
    detectedAt: new Date().toISOString(),
    status: "PENDING_ROUTER",
    sprintId: extra.sprintId || "UNKNOWN",
    project: extra.project || "UNKNOWN",
    evidence: String(evidence || "").slice(0, 500),
  };

  fs.writeFileSync(EVENT_PATH, JSON.stringify(event, null, 2));
  return event;
}

function buildRouterContext(event) {
  return [
    "SPRINT_STARTED event detected by the project Sprint Started Hook.",
    "Router Agent: notify the Test Plan Agent that the Sprint has started and a Sprint-level Test Plan must be prepared.",
    "Do not invent Sprint details that are not in this event.",
    `Event: ${event.event}`,
    `Source: ${event.source}`,
    `Sprint ID: ${event.sprintId}`,
    `Project: ${event.project}`,
    `Status: ${event.status}`,
  ].join("\n");
}

const raw = readStdin();
let data = {};

try {
  data = JSON.parse(raw || "{}");
} catch {
  writeStdout({ continue: true });
  process.exit(0);
}

if (typeof data.prompt === "string") {
  if (looksLikeSprintStarted(data.prompt)) {
    writeEvent("user_prompt", data.prompt, extractKnownFields(data.prompt));
  }
  writeStdout({ continue: true });
  process.exit(0);
}

const toolBlob = [
  data.tool_name,
  typeof data.tool_input === "string" ? data.tool_input : JSON.stringify(data.tool_input || {}),
  data.tool_output,
  data.result_json,
].filter(Boolean).join("\n");

if (toolBlob && looksLikeSprintStarted(toolBlob)) {
  const event = writeEvent(
    "tool_or_mcp",
    toolBlob,
    {
      ...extractKnownFields(toolBlob),
      toolName: data.tool_name || "UNKNOWN",
    }
  );
  writeStdout({ additional_context: buildRouterContext(event) });
  process.exit(0);
}

if (typeof data.prompt === "undefined" && !data.tool_name) {
  writeStdout({ continue: true });
  process.exit(0);
}

writeStdout({});
process.exit(0);
