#!/usr/bin/env ts-node
/**
 * Create roadmap GitHub issues from scripts/roadmap-issues.ts
 * Usage: npx ts-node scripts/create-roadmap-issues.ts [--dry-run]
 */

import { ROADMAP_ISSUES } from "./roadmap-issues";

const DRY_RUN = process.argv.includes("--dry-run");
const REPO = "gracp/saas-generator";

async function createIssue(
  title: string,
  body: string,
  labels: string[]
): Promise<void> {
  if (DRY_RUN) {
    console.log(`[DRY RUN] Would create: ${title}`);
    return;
  }
  const labelArg = labels.map((l) => `-l "${l}"`).join(" ");
  const cmd = `gh issue create --repo ${REPO} --title "${title.replace(/"/g, '\\"')}" --body "${body.replace(/"/g, '\\"').replace(/\n/g, "\\n")}" ${labelArg}`;
  const { execSync } = await import("child_process");
  try {
    const result = execSync(cmd, { encoding: "utf-8" });
    console.log(`Created: ${title}`);
    console.log(`  ${result.trim()}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Failed to create "${title}": ${msg}`);
  }
}

async function main() {
  console.log(
    `\n${DRY_RUN ? "[DRY RUN] " : ""}Creating ${ROADMAP_ISSUES.length} roadmap issues...\n`
  );

  for (const issue of ROADMAP_ISSUES) {
    const bodyEscaped = issue.body.replace(/"/g, '\\"').replace(/\n/g, "\\n");
    await createIssue(issue.title, bodyEscaped, [...issue.labels]);
    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\n✅ Done! ${DRY_RUN ? "(dry run)" : ""} ${ROADMAP_ISSUES.length} issues processed.\n`);
}

main().catch(console.error);
