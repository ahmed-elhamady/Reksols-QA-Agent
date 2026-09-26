#!/usr/bin/env node
/**
 * Persist and update the unified QA workflow state.
 * Invoked by the Router Agent. Does not decide approvals or play sounds.
 *
 * node .cursor/hooks/qa-workflow-state.js --action init --activity "Pipeline Creation" --agent "pipeline-creation-agent"
 * node .cursor/hooks/qa-workflow-state.js --action set-state --state REQUIRES_CLARIFICATION
 * node .cursor/hooks/qa-workflow-state.js --action add-clarification --id PC-CL-001 --question "..." --missing "CI/CD platform" ...
 * node .cursor/hooks/qa-workflow-state.js --action resolve-clarification --id PC-CL-001 --answer "GitHub Actions"
 * node .cursor/hooks/qa-workflow-state.js --action add-unknown --finding "..." --evidence "..."
 * node .cursor/hooks/qa-workflow-state.js --action set-blocked --reason "..." --resolution "..."
 * node .cursor/hooks/qa-workflow-state.js --action set-artifact --name "..." --path "..." --status PENDING_APPROVAL
 * node .cursor/hooks/qa-workflow-state.js --action set-approval --decision APPROVED --feedback "..."
 */

const fs = require("fs");
const path = require("path");

const STATE_PATH = path.join(process.cwd(), ".cursor", "workflow", "qa-workflow-state.json");

const STATES = [
  "RECEIVED",
  "VALIDATING_PREREQUISITES",
  "REQUIRES_CLARIFICATION",
  "READY",
  "EXECUTING",
  "BLOCKED",
  "ARTIFACT_CREATED",
  "WAITING_FOR_QA_APPROVAL",
  "APPROVED",
  "REJECTED",
  "REQUEST_CHANGES",
  "COMPLETED",
];

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    const name = key.slice(2).replace(/-/g, "_");
    const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
    out[name] = value;
  }
  return out;
}

function emptyState() {
  return {
    workflow_id: `wf-${Date.now()}`,
    state: "RECEIVED",
    activity: "",
    agent: "",
    updated_at: new Date().toISOString(),
    input: {},
    context: {},
    prerequisite_evaluation: [],
    overall_status: "RECEIVED",
    clarifications: [],
    blocked: null,
    unknown: [],
    artifact: null,
    approval: null,
    history: [],
  };
}

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
  } catch {
    return emptyState();
  }
}

function writeState(state) {
  state.updated_at = new Date().toISOString();
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function pushHistory(state, event, detail) {
  state.history = state.history || [];
  state.history.push({
    at: new Date().toISOString(),
    event,
    detail: detail || "",
    state: state.state,
  });
}

function setState(state, next) {
  if (!STATES.includes(next)) {
    throw new Error(`Invalid workflow state: ${next}`);
  }
  state.state = next;
  state.overall_status = next;
}

function main() {
  const args = parseArgs(process.argv);
  const action = args.action;
  if (!action) {
    process.stderr.write("Missing --action\n");
    process.exit(1);
  }

  let state = action === "init" ? emptyState() : readState();

  try {
    switch (action) {
      case "init":
        if (args.activity) state.activity = args.activity;
        if (args.agent) state.agent = args.agent;
        setState(state, "RECEIVED");
        pushHistory(state, "init", `${state.activity} / ${state.agent}`);
        break;
      case "set-state":
        if (!args.state) throw new Error("Missing --state");
        setState(state, args.state);
        pushHistory(state, "set-state", args.state);
        break;
      case "add-clarification":
        if (!args.id) throw new Error("Missing --id");
        state.clarifications = state.clarifications || [];
        if (state.clarifications.some((c) => c.id === args.id && c.status === "OPEN")) {
          break;
        }
        state.clarifications.push({
          id: args.id,
          agent: args.agent || state.agent,
          condition: args.condition || "",
          missing: args.missing || "",
          why: args.why || "",
          question: args.question || "",
          expected_answer: args.expected_answer || "",
          status: "OPEN",
          answer: "",
        });
        setState(state, "REQUIRES_CLARIFICATION");
        pushHistory(state, "add-clarification", args.id);
        break;
      case "resolve-clarification":
        if (!args.id) throw new Error("Missing --id");
        if (!args.answer) throw new Error("Missing --answer");
        state.clarifications = (state.clarifications || []).map((c) => {
          if (c.id !== args.id) return c;
          return { ...c, status: "RESOLVED", answer: args.answer };
        });
        pushHistory(state, "resolve-clarification", `${args.id}=${args.answer}`);
        break;
      case "add-unknown":
        state.unknown = state.unknown || [];
        state.unknown.push({
          finding: args.finding || args.reason || "",
          evidence: args.evidence || "",
          at: new Date().toISOString(),
        });
        pushHistory(state, "unknown", args.finding || args.reason || "");
        break;
      case "set-blocked":
        state.blocked = {
          reason: args.reason || "UNKNOWN",
          evidence: args.evidence || "",
          required_resolution: args.resolution || args.required_resolution || "",
        };
        setState(state, "BLOCKED");
        pushHistory(state, "blocked", state.blocked.reason);
        break;
      case "set-artifact":
        state.artifact = {
          name: args.name || "",
          path: args.path || "UNKNOWN",
          status: args.status || "ARTIFACT_CREATED",
        };
        setState(state, "ARTIFACT_CREATED");
        pushHistory(state, "artifact", state.artifact.name);
        break;
      case "set-approval":
        state.approval = {
          decision: args.decision || "PENDING",
          feedback: args.feedback || "",
          at: new Date().toISOString(),
        };
        if (args.decision === "APPROVED") setState(state, "APPROVED");
        else if (args.decision === "REJECTED") setState(state, "REJECTED");
        else if (args.decision === "REQUEST_CHANGES") setState(state, "REQUEST_CHANGES");
        else setState(state, "WAITING_FOR_QA_APPROVAL");
        pushHistory(state, "approval", args.decision || "PENDING");
        break;
      case "show":
        process.stdout.write(`${JSON.stringify(state, null, 2)}\n`);
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }

  writeState(state);
  process.stdout.write(`${JSON.stringify({ ok: true, state: state.state, path: STATE_PATH }, null, 2)}\n`);
}

main();
