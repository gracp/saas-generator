/**
 * GitHub Workflow Orchestrator
 *
 * Monitors PRs created by code generation agents, runs code reviews,
 * checks CI status, and merges when ready.
 *
 * Uses the pr-code-reviewer skill for reviews and GitHub API for status checks.
 */

import { getPullRequest, addCommentToPR, mergePullRequest } from "./github";

// ─── Types ───────────────────────────────────────────────

export interface PRReviewResult {
  prNumber: number;
  repoSlug: string;
  status: "approved" | "changes_requested" | "pending" | "error";
  reviewBody: string;
  blockers: string[];
  warnings: string[];
  suggestions: string[];
}

export interface WorkflowCheckResult {
  allPassed: boolean;
  checks: Array<{
    name: string;
    status: "pass" | "fail" | "pending";
  }>;
}

// ─── Review Runner ─────────────────────────────────────

/**
 * Run a code review on a PR using pr-code-reviewer pattern.
 * Returns classified findings (blockers, warnings, suggestions).
 */
export async function reviewPR(
  repoSlug: string,
  prNumber: number
): Promise<PRReviewResult> {
  // Get PR diff via gh
  const { execSync } = await import("child_process");

  let diff = "";
  try {
    diff = execSync(
      `gh pr diff ${prNumber} --repo ${repoSlug}`,
      { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }
    );
  } catch {
    return {
      prNumber,
      repoSlug,
      status: "error",
      reviewBody: "Could not fetch PR diff",
      blockers: ["Failed to retrieve PR diff from GitHub"],
      warnings: [],
      suggestions: [],
    };
  }

  // Analyze diff patterns (simple static analysis)
  const findings = analyzeDiff(diff);

  // Format review comment
  const reviewBody = formatReviewComment(findings);

  const status =
    findings.blockers.length > 0
      ? "changes_requested"
      : findings.warnings.length > 0
        ? "approved" // warnings don't block
        : "approved";

  return {
    prNumber,
    repoSlug,
    status,
    reviewBody,
    blockers: findings.blockers,
    warnings: findings.warnings,
    suggestions: findings.suggestions,
  };
}

// ─── Diff Analyzer (Simple Static Analysis) ─────────────

interface Findings {
  blockers: string[];
  warnings: string[];
  suggestions: string[];
}

function analyzeDiff(diff: string): Findings {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const lines = diff.split("\n");
  let file = "";

  for (const line of lines) {
    // Track current file
    if (line.startsWith("diff --git")) {
      const match = line.match(/diff --git a\/(.+) b\//);
      if (match) file = match[1];
      continue;
    }

    // Removed lines (potential problems)
    if (line.startsWith("-") && !line.startsWith("---")) {
      const content = line.slice(1);

      // Hardcoded secrets / API keys
      if (/\b(api_key|apikey|secret|password|token)\b.*[=:].*[a-zA-Z0-9]{8,}/i.test(content)) {
        blockers.push(`[SECURITY] Hardcoded secret detected in ${file}: ${content.slice(0, 60)}`);
      }

      // TODO comments left in code
      if (/\bTODO\b|\bFIXME\b|\bHACK\b/i.test(content)) {
        warnings.push(`[DEBT] TODO/FIXME comment found in ${file}: ${content.slice(0, 50)}`);
      }

      // console.log statements
      if (/^\s*console\.(log|debug|info)\s*\(/.test(content)) {
        warnings.push(`[CLEANUP] console.log left in ${file}`);
      }

      // Very long lines (>120 chars)
      if (content.length > 120 && !content.startsWith("//")) {
        suggestions.push(`[STYLE] Line too long (${content.length} chars) in ${file}: ${content.slice(0, 50)}`);
      }

      // Empty catch blocks
      if (/^\s*catch\s*\([^)]*\)\s*\{\s*\}/.test(content)) {
        blockers.push(`[ERROR HANDLING] Empty catch block in ${file} — silently swallowing errors`);
      }

      // new Buffer() (deprecated Node API)
      if (/new\s+Buffer\s*\(/.test(content)) {
        blockers.push(`[DEPRECATED] new Buffer() in ${file} — use Buffer.from() instead`);
      }

      // innerHTML (XSS risk)
      if (/\binnerHTML\s*=/.test(content)) {
        warnings.push(`[SECURITY] innerHTML assignment in ${file} — potential XSS risk`);
      }

      // eval()
      if (/\beval\s*\(/.test(content)) {
        blockers.push(`[SECURITY] eval() usage in ${file} — code injection risk`);
      }
    }

    // Added lines (additional checks)
    if (line.startsWith("+") && !line.startsWith("+++")) {
      const content = line.slice(1);

      // Exposed secrets in env files
      if (/\b(api_key|apikey|secret|password|token)\s*=\s*['"][a-zA-Z0-9]{8,}/i.test(content)) {
        blockers.push(`[SECURITY] Possible secret hardcoded in ${file}`);
      }
    }
  }

  // Check for missing tests
  const hasTests = /\b(test|spec)\.[jt]sx?$/.test(diff);
  const hasSourceFiles = /\.(tsx?|jsx?)$/.test(diff) && !/\b(test|spec)\.[jt]sx?$/.test(diff);
  if (hasSourceFiles && !hasTests) {
    suggestions.push(`[TESTING] No test files detected alongside source files`);
  }

  return { blockers, warnings, suggestions };
}

function formatReviewComment(findings: Findings): string {
  const blocks: string[] = [];
  const blockers = findings.blockers;
  const warnings = findings.warnings;
  const suggestions = findings.suggestions;

  blocks.push("## 🔍 Code Review\n");

  if (blockers.length === 0 && warnings.length === 0 && suggestions.length === 0) {
    blocks.push("✅ **No issues found.** Code looks clean.");
    return blocks.join("\n");
  }

  if (blockers.length > 0) {
    blocks.push(`## 🔴 Blockers (${blockers.length})`);
    for (const b of blockers) blocks.push(`- ${b}`);
    blocks.push("");
  }

  if (warnings.length > 0) {
    blocks.push(`## 🟡 Warnings (${warnings.length})`);
    for (const w of warnings) blocks.push(`- ${w}`);
    blocks.push("");
  }

  if (suggestions.length > 0) {
    blocks.push(`## 🔵 Suggestions (${suggestions.length})`);
    for (const s of suggestions) blocks.push(`- ${s}`);
    blocks.push("");
  }

  const verdict =
    blockers.length > 0
      ? "❌ **CHANGES REQUESTED** — fix blockers before merge"
      : "✅ **APPROVED** — minor issues only";

  blocks.push(`\n---\n**Verdict:** ${verdict}`);
  return blocks.join("\n");
}

// ─── CI Status Checker ─────────────────────────────────

/**
 * Get CI status for a PR via GitHub API.
 */
export async function getCIStatus(
  repoSlug: string,
  prNumber: number
): Promise<WorkflowCheckResult> {
  const pr = getPullRequest(repoSlug, prNumber);

  return {
    allPassed: pr.statusCheckRollup.status === "SUCCESS",
    checks: [
      {
        name: "CI / tests",
        status:
          pr.statusCheckRollup.status === "SUCCESS"
            ? "pass"
            : pr.statusCheckRollup.status === "FAILURE"
              ? "fail"
              : "pending",
      },
    ],
  };
}

// ─── Full Review + Merge Pipeline ─────────────────────

/**
 * Run full pipeline on a PR: review → post comment → check CI → merge.
 */
export async function reviewAndMerge(
  repoSlug: string,
  prNumber: number,
  opts?: { requireCI: boolean; autoMerge: boolean }
): Promise<{ reviewed: boolean; merged: boolean; reason: string }> {
  const options = { requireCI: true, autoMerge: true, ...opts };
  // 1. Run review
  const review = await reviewPR(repoSlug, prNumber);

  // 2. Post comment
  await addCommentToPR(repoSlug, prNumber, review.reviewBody);

  if (review.blockers.length > 0) {
    return {
      reviewed: true,
      merged: false,
      reason: `${review.blockers.length} blocker(s) found — changes requested`,
    };
  }

  // 3. Check CI if required
  if (options.requireCI) {
    const ci = await getCIStatus(repoSlug, prNumber);
    if (!ci.allPassed) {
      return {
        reviewed: true,
        merged: false,
        reason: "CI checks not passing",
      };
    }
  }

  // 4. Auto-merge
  if (options.autoMerge) {
    try {
      mergePullRequest(repoSlug, prNumber, "squash");
      return { reviewed: true, merged: true, reason: "PR merged via squash" };
    } catch {
      return {
        reviewed: true,
        merged: false,
        reason: "Merge failed — check PR status manually",
      };
    }
  }

  return { reviewed: true, merged: false, reason: "Reviewed — auto-merge disabled" };
}

/**
 * Monitor multiple PRs from code generation and process each.
 */
export async function processAllPRs(
  repoSlug: string,
  prNumbers: number[]
): Promise<Array<{ prNumber: number; merged: boolean; reason: string }>> {
  const results = [];

  for (const prNumber of prNumbers) {
    const result = await reviewAndMerge(repoSlug, prNumber);
    results.push({ prNumber, ...result });
  }

  return results;
}
