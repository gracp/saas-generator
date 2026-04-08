/**
 * GitHub Operations — create repos, issues, branches, PRs, merge
 *
 * All operations use the `gh` CLI under the hood so they respect
 * whatever GitHub auth is configured on the host.
 */

import { execSync, spawnSync } from "child_process";

const GH = "gh";

/** Thin wrapper around `gh` that throws on non-zero exit. */
function gh(args: string, opts?: { cwd?: string }): string {
  const cmd = `${GH} ${args}`;
  return execSync(cmd, {
    encoding: "utf-8",
    cwd: opts?.cwd,
    stdio: ["pipe", "pipe", "pipe"],
  }).trim();
}

// ─── Types ───────────────────────────────────────────────

export interface RepoCreateOptions {
  name: string;
  description: string;
  public?: boolean;
  org?: string;
}

export interface RepoInfo {
  url: string;
  sshUrl: string;
  name: string;
  owner: string;
}

export interface IssueCreateOptions {
  title: string;
  body: string;
  labels?: string[];
  assignees?: string[];
}

export interface PullRequestInfo {
  number: number;
  url: string;
  state: string;
  headRef: string;
  baseRef: string;
  mergeable: boolean;
  reviewDecision?: "APPROVED" | "CHANGES_REQUESTED" | "REVIEW_REQUIRED";
  statusCheckRollup: {
    status: string; // "SUCCESS" | "FAILURE" | "PENDING"
  };
}

export interface BranchInfo {
  name: string;
  headOid: string;
}

// ─── Repo Operations ────────────────────────────────────

export function createRepo(opts: RepoCreateOptions): RepoInfo {
  const visibility = opts.public ? "--public" : "--private";
  const org = opts.org ? `--repo ${opts.org}/${opts.name}` : "";
  gh(`repo create ${opts.name} ${visibility} --description "${opts.description}" ${org}`);

  const url = gh(`repo view ${opts.name} --json url,sshUrl,name,owner -q '.'`);
  const data = JSON.parse(url) as {
    url: string;
    sshUrl: string;
    name: string;
    owner: { login: string };
  };

  return {
    url: data.url,
    sshUrl: data.sshUrl,
    name: data.name,
    owner: data.owner.login,
  };
}

export function cloneRepo(repoUrl: string, targetDir: string): void {
  gh(`repo clone ${repoUrl} ${targetDir}`);
}

export function initAndPush(dir: string, remoteUrl: string, branch = "main"): void {
  const commands = [
    `cd ${dir} && git init`,
    `cd ${dir} && git remote add origin ${remoteUrl}`,
    `cd ${dir} && git add .`,
    `cd ${dir} && git commit -m "chore: initial commit"`,
    `cd ${dir} && git branch -M ${branch}`,
    `cd ${dir} && git push -u origin ${branch}`,
  ];
  for (const cmd of commands) {
    execSync(cmd, { stdio: "pipe" });
  }
}

// ─── Branch Operations ──────────────────────────────────

export function createBranch(repoDir: string, branchName: string, base = "main"): BranchInfo {
  gh(`checkout -b ${branchName} ${base}`, { cwd: repoDir });
  // We need to use git, not gh
  execSync(`git checkout -b ${branchName} ${base}`, { cwd: repoDir, stdio: "pipe" });
  return { name: branchName, headOid: "" };
}

export function pushBranch(repoDir: string, branchName: string): void {
  execSync(`git push -u origin ${branchName}`, { cwd: repoDir, stdio: "pipe" });
}

export function createWorktree(repoDir: string, branchName: string): string {
  const worktreePath = `${repoDir}-${branchName.replace(/\//g, "-")}`;
  try {
    execSync(
      `git worktree add ${worktreePath} -b ${branchName}`,
      { cwd: repoDir, stdio: "pipe" }
    );
  } catch {
    // Branch may already exist
    execSync(
      `git worktree add ${worktreePath} ${branchName}`,
      { cwd: repoDir, stdio: "pipe" }
    );
  }
  return worktreePath;
}

export function removeWorktree(repoDir: string, worktreePath: string): void {
  execSync(`git worktree remove ${worktreePath} --force`, {
    cwd: repoDir,
    stdio: "pipe",
  });
}

// ─── Issue Operations ───────────────────────────────────

export function createIssue(
  repoSlug: string,
  opts: IssueCreateOptions
): { number: number; url: string } {
  const labels = opts.labels?.length ? `--label "${opts.labels.join(",")}"` : "";
  const assignees = opts.assignees?.length
    ? `--assignee "${opts.assignees.join(",")}"`
    : "";
  const result = gh(
    `issue create --repo ${repoSlug} --title "${opts.title}" --body "${opts.body.replace(
      /"/g,
      '\\"'
    )}" ${labels} ${assignees}`
  );
  // Result is a URL like https://github.com/owner/repo/issues/123
  const match = result.match(/\/issues\/(\d+)$/);
  return {
    number: parseInt(match?.[1] ?? "0", 10),
    url: result,
  };
}

// ─── Pull Request Operations ────────────────────────────

export function createPullRequest(
  repoDir: string,
  opts: {
    title: string;
    body: string;
    head: string;
    base?: string;
  }
): { number: number; url: string } {
  const base = opts.base ?? "main";
  const result = execSync(
    `cd ${repoDir} && gh pr create --title "${opts.title}" --body "${opts.body.replace(
      /"/g,
      '\\"'
    )}" --head ${opts.head} --base ${base}`,
    { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }
  ).trim();

  const match = result.match(/\/pull\/(\d+)$/);
  return {
    number: parseInt(match?.[1] ?? "0", 10),
    url: result,
  };
}

export function getPullRequest(repoSlug: string, prNumber: number): PullRequestInfo {
  const data = gh(
    `pr view ${prNumber} --repo ${repoSlug} --json number,url,state,headRefName,baseRefName,mergeable,reviewDecision,statusCheckRollup -q '.'`
  );
  const parsed = JSON.parse(data) as {
    number: number;
    url: string;
    state: string;
    headRefName: string;
    baseRefName: string;
    mergeable: boolean;
    reviewDecision?: string;
    statusCheckRollup: Array<{ status: string }>;
  };

  return {
    number: parsed.number,
    url: parsed.url,
    state: parsed.state,
    headRef: parsed.headRefName,
    baseRef: parsed.baseRefName,
    mergeable: parsed.mergeable,
    reviewDecision: parsed.reviewDecision as PullRequestInfo["reviewDecision"],
    statusCheckRollup: {
      status: parsed.statusCheckRollup[0]?.status ?? "PENDING",
    },
  };
}

export function mergePullRequest(
  repoSlug: string,
  prNumber: number,
  method: "squash" | "merge" | "rebase" = "squash"
): void {
  gh(`pr merge ${prNumber} --repo ${repoSlug} --${method} --delete-branch`);
}

export function addCommentToPR(
  repoSlug: string,
  prNumber: number,
  body: string
): void {
  gh(`pr comment ${prNumber} --repo ${repoSlug} --body "${body.replace(/"/g, '\\"')}"`);
}

// ─── Vercel Integration ─────────────────────────────────

export function connectToVercel(repoSlug: string, _opts?: {
  vercelToken?: string;
  framework?: string;
}): string {
  // This would use the Vercel API to import the repo
  // For now, return a placeholder URL
  const repoName = repoSlug.split("/")[1];
  return `https://${repoName}.vercel.app`;
}

export function setRepoSecret(
  repoSlug: string,
  name: string,
  value: string
): void {
  // Pipe secret value to gh secret set to avoid shell escaping issues
  spawnSync("gh", ["secret", "set", name, "--repo", repoSlug, "--body", value], {
    encoding: "utf-8",
    stdio: "pipe",
  });
}
