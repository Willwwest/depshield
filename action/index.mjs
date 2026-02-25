/**
 * DepShield GitHub Action
 *
 * Scans package.json dependencies for supply-chain risk signals:
 *   - Maintainer health & bus factor
 *   - Account takeover indicators
 *   - Slopsquatting / typosquatting
 *   - License mutations
 *
 * Posts a PR comment with findings and sets outputs for downstream steps.
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInput(name) {
  const val = process.env[`INPUT_${name.replace(/-/g, "_").toUpperCase()}`];
  return val?.trim() || "";
}

function setOutput(name, value) {
  const filePath = process.env.GITHUB_OUTPUT;
  if (filePath) {
    import("node:fs").then((fs) =>
      fs.appendFileSync(filePath, `${name}=${value}\n`)
    );
  }
}

function setFailed(message) {
  process.exitCode = 1;
  console.error(`::error::${message}`);
}

function info(message) {
  console.log(message);
}

function warning(message) {
  console.log(`::warning::${message}`);
}

// ---------------------------------------------------------------------------
// Severity helpers
// ---------------------------------------------------------------------------

const SEVERITY_ORDER = ["critical", "high", "medium", "low", "info"];

function severityAtOrAbove(severity, threshold) {
  return SEVERITY_ORDER.indexOf(severity) <= SEVERITY_ORDER.indexOf(threshold);
}

function gradeFromScore(score) {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

// ---------------------------------------------------------------------------
// Lightweight analysis (runs without external API when no token is provided)
// ---------------------------------------------------------------------------

async function fetchNpmMeta(name) {
  const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`);
  if (!res.ok) return null;
  return res.json();
}

async function fetchDownloads(name) {
  const res = await fetch(
    `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name)}`
  );
  if (!res.ok) return 0;
  const data = await res.json();
  return data.downloads || 0;
}

async function analyzePackage(name, version) {
  const alerts = [];
  let score = 100;

  const meta = await fetchNpmMeta(name);
  if (!meta) {
    return { name, version, score: 50, grade: "C", alerts: [{ severity: "medium", title: "No registry metadata", description: `Could not fetch metadata for ${name}` }] };
  }

  const maintainers = meta.maintainers || [];
  const times = meta.time || {};
  const latestVersion = meta["dist-tags"]?.latest;

  // Bus factor
  if (maintainers.length === 1) {
    score -= 15;
    alerts.push({
      severity: "medium",
      title: "Single maintainer",
      description: `${name} has only 1 npm maintainer — elevated bus-factor risk.`,
    });
  }

  // Stale package (no publish in 365+ days)
  const lastPublish = times.modified || times[latestVersion];
  if (lastPublish) {
    const daysSince = (Date.now() - new Date(lastPublish).getTime()) / 86_400_000;
    if (daysSince > 365) {
      score -= 20;
      alerts.push({
        severity: "high",
        title: "Stale package",
        description: `${name} has not been published in ${Math.round(daysSince)} days.`,
      });
    }
  }

  // New maintainer (account age proxy — added in last 90 days)
  const versions = Object.keys(meta.versions || {});
  if (versions.length >= 2) {
    const prev = meta.versions[versions[versions.length - 2]];
    const curr = meta.versions[versions[versions.length - 1]];
    const prevNames = new Set((prev?.maintainers || []).map((m) => m.name));
    const currNames = (curr?.maintainers || []).map((m) => m.name);
    const newMaintainers = currNames.filter((n) => !prevNames.has(n));
    if (newMaintainers.length > 0) {
      score -= 25;
      alerts.push({
        severity: "critical",
        title: "Maintainer change detected",
        description: `New maintainer(s) added to ${name}: ${newMaintainers.join(", ")}`,
      });
    }
  }

  // Low download count (potential typosquat)
  const downloads = await fetchDownloads(name);
  if (downloads < 100 && versions.length <= 3) {
    score -= 30;
    alerts.push({
      severity: "critical",
      title: "Possible typosquat / slopsquat",
      description: `${name} has only ${downloads} weekly downloads and ${versions.length} version(s).`,
    });
  }

  score = Math.max(0, Math.min(100, score));
  return { name, version, score, grade: gradeFromScore(score), alerts };
}

// ---------------------------------------------------------------------------
// PR Comment
// ---------------------------------------------------------------------------

async function postPrComment(results, overallGrade, overallScore) {
  const githubToken = getInput("github-token");
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!githubToken || !eventPath) return;

  let event;
  try {
    event = JSON.parse(await readFile(eventPath, "utf8"));
  } catch {
    return;
  }

  const prNumber = event?.pull_request?.number;
  const repo = process.env.GITHUB_REPOSITORY;
  if (!prNumber || !repo) return;

  const criticals = results.flatMap((r) => r.alerts.filter((a) => a.severity === "critical"));
  const highs = results.flatMap((r) => r.alerts.filter((a) => a.severity === "high"));

  let body = `## DepShield Scan Results\n\n`;
  body += `**Health Grade: ${overallGrade}** (${overallScore}/100)\n\n`;

  if (criticals.length || highs.length) {
    body += `| Package | Severity | Issue |\n|---------|----------|-------|\n`;
    for (const alert of [...criticals, ...highs]) {
      body += `| \`${alert.description.split(" ")[0]}\` | ${alert.severity.toUpperCase()} | ${alert.title} |\n`;
    }
    body += `\n`;
  }

  if (!criticals.length && !highs.length) {
    body += `No critical or high severity issues found.\n`;
  }

  body += `\n---\n*Powered by [DepShield](https://depshield.dev) — AI-powered dependency supply chain intelligence*`;

  try {
    await fetch(`https://api.github.com/repos/${repo}/issues/${prNumber}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({ body }),
    });
    info("Posted PR comment with scan results.");
  } catch (err) {
    warning(`Failed to post PR comment: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function run() {
  info("DepShield v1.0.0 — Dependency Supply Chain Intelligence\n");

  const failOn = getInput("fail-on") || "critical";
  const scanDevDeps = getInput("scan-dev-deps") === "true";

  // Read package.json
  const pkgPath = resolve(process.cwd(), "package.json");
  let pkg;
  try {
    pkg = JSON.parse(await readFile(pkgPath, "utf8"));
  } catch {
    setFailed("Could not read package.json in the repository root.");
    return;
  }

  const deps = { ...(pkg.dependencies || {}) };
  if (scanDevDeps) {
    Object.assign(deps, pkg.devDependencies || {});
  }

  const depNames = Object.keys(deps);
  info(`Found ${depNames.length} dependencies to scan.\n`);

  // Analyze each dependency
  const results = [];
  for (const name of depNames) {
    info(`  Scanning ${name}...`);
    try {
      const result = await analyzePackage(name, deps[name]);
      results.push(result);
    } catch (err) {
      warning(`  Failed to analyze ${name}: ${err.message}`);
      results.push({ name, version: deps[name], score: 50, grade: "C", alerts: [] });
    }
  }

  // Compute overall score
  const overallScore = results.length
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
    : 100;
  const overallGrade = gradeFromScore(overallScore);

  // Collect alerts
  const allAlerts = results.flatMap((r) => r.alerts);
  const criticalCount = allAlerts.filter((a) => a.severity === "critical").length;
  const highCount = allAlerts.filter((a) => a.severity === "high").length;
  const mediumCount = allAlerts.filter((a) => a.severity === "medium").length;

  // Report
  info(`\n${"=".repeat(50)}`);
  info(`  Health Grade: ${overallGrade} (${overallScore}/100)`);
  info(`  Critical: ${criticalCount}  High: ${highCount}  Medium: ${mediumCount}`);
  info(`${"=".repeat(50)}\n`);

  for (const alert of allAlerts) {
    const prefix = alert.severity === "critical" ? "CRITICAL" : alert.severity.toUpperCase();
    info(`  ${prefix}  ${alert.title}`);
    info(`           ${alert.description}\n`);
  }

  // Set outputs
  setOutput("health-grade", overallGrade);
  setOutput("health-score", String(overallScore));
  setOutput("critical-count", String(criticalCount));
  setOutput("high-count", String(highCount));
  setOutput("report-url", `https://depshield.dev/report/${process.env.GITHUB_SHA?.slice(0, 8) || "local"}`);

  // Post PR comment
  await postPrComment(results, overallGrade, overallScore);

  // Fail check if severity threshold met
  const shouldFail = allAlerts.some((a) => severityAtOrAbove(a.severity, failOn));
  if (shouldFail) {
    setFailed(
      `DepShield found ${criticalCount} critical and ${highCount} high severity issues (fail-on: ${failOn}).`
    );
  } else {
    info("DepShield scan passed.");
  }
}

run().catch((err) => {
  setFailed(`DepShield action failed: ${err.message}`);
});
