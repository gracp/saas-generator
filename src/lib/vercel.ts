/**
 * Vercel Integration — real deployment via Vercel API
 *
 * Handles:
 * - Project creation + GitHub import
 * - Environment variables
 * - Production deployment trigger
 * - Custom domain configuration
 */

import { setRepoSecret } from "./github";

// ─── Types ───────────────────────────────────────────────

export interface VercelConfig {
  apiToken?: string;
  teamId?: string;
}

export interface VercelProject {
  id: string;
  name: string;
  url: string;
  alias: string[];
}

export interface DeploymentResult {
  url: string;
  deploymentId: string;
  status: "READY" | "ERROR" | "BUILDING";
}

// ─── API Client ─────────────────────────────────────────

function vercelFetch(
  path: string,
  opts: RequestInit & { token?: string } = {}
): Promise<unknown> {
  const apiToken = opts.token ?? process.env.VERCEL_API_TOKEN;
  if (!apiToken) throw new Error("VERCEL_API_TOKEN not set");

  const base = "https://api.vercel.com/v13";
  const url = path.startsWith("http") ? path : `${base}${path}`;

  const res = fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
  });

  return res.then(async (r) => {
    if (!r.ok) {
      const body = await r.text();
      throw new Error(`Vercel API ${r.status}: ${body}`);
    }
    return r.json();
  });
}

// ─── Project Operations ────────────────────────────────

/**
 * Create a Vercel project and import a GitHub repo.
 */
export async function createVercelProject(opts: {
  name: string;
  githubRepo: string;
  framework?: string;
  token?: string;
  teamId?: string;
}): Promise<VercelProject> {
  const { name, githubRepo, framework = "nextjs", token, teamId } = opts;

  // Check if project already exists
  const existing = await listVercelProjects(name, token);
  if (existing) return existing;

  // Create project via Vercel API
  const body: Record<string, unknown> = {
    name: name.toLowerCase().replace(/\s+/g, "-"),
    framework,
    gitSource: {
      type: "github",
      repo: githubRepo.replace("https://github.com/", ""),
    },
  };

  if (teamId) body.teamId = teamId;

  const data = (await vercelFetch("/v9/projects", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  })) as { id: string; name: string; url: string; alias: string[] };

  return {
    id: data.id,
    name: data.name,
    url: `https://${data.name}.vercel.app`,
    alias: data.alias ?? [],
  };
}

/**
 * List Vercel projects — returns first match by name.
 */
export async function listVercelProjects(
  name: string,
  token?: string
): Promise<VercelProject | null> {
  const data = (await vercelFetch("/v9/projects", { token })) as {
    projects: Array<{ id: string; name: string; url: string; alias: string[] }>;
  };
  return (
    data.projects.find(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    ) ?? null
  );
}

/**
 * Set environment variables on a Vercel project.
 */
export async function setVercelEnvVars(opts: {
  projectId: string;
  vars: Record<string, string>;
  token?: string;
  target?: "production" | "preview" | "development";
}): Promise<void> {
  const { projectId, vars, token, target = "production" } = opts;

  await Promise.all(
    Object.entries(vars).map(([key, value]) =>
      vercelFetch(`/v9/projects/${projectId}/env`, {
        method: "POST",
        token,
        body: JSON.stringify({
          key,
          value,
          target,
          type: "secret",
        }),
      })
    )
  );
}

/**
 * Trigger a production deployment.
 */
export async function deployVercelProject(opts: {
  projectId: string;
  token?: string;
  teamId?: string;
}): Promise<DeploymentResult> {
  const { projectId, token, teamId } = opts;

  const body: Record<string, unknown> = {
    projectId,
    target: "production",
  };
  if (teamId) body.teamId = teamId;

  const data = (await vercelFetch("/v13/deployments", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  })) as {
    id: string;
    url: string;
    status: "READY" | "ERROR" | "BUILDING";
  };

  return {
    deploymentId: data.id,
    url: `https://${data.url}`,
    status: data.status,
  };
}

/**
 * Wait for a deployment to be ready (polling).
 */
export async function waitForDeployment(
  deploymentId: string,
  token?: string,
  timeoutMs = 120000
): Promise<DeploymentResult> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const data = (await vercelFetch(
      `/v13/deployments/${deploymentId}`,
      { token }
    )) as {
      id: string;
      url: string;
      status: "READY" | "ERROR" | "BUILDING";
    };

    if (data.status === "READY") {
      return { deploymentId: data.id, url: `https://${data.url}`, status: "READY" };
    }
    if (data.status === "ERROR") {
      throw new Error(`Deployment failed: ${deploymentId}`);
    }

    await new Promise((r) => setTimeout(r, 5000)); // poll every 5s
  }

  throw new Error(`Deployment timed out: ${deploymentId}`);
}

/**
 * Connect GitHub repo to Vercel with OAuth.
 * Returns the authorization URL for the user to approve.
 */
export function getVercelGitHubConnectUrl(vercelToken: string): string {
  return `https://vercel.com/oauth?redirect=https://vercel.com/integrations/github&teamId=`;
}

// ─── High-Level Deploy ─────────────────────────────────

/**
 * Full deployment pipeline: create project → set env vars → deploy.
 */
export async function fullDeploy(opts: {
  name: string;
  githubRepo: string;
  envVars?: Record<string, string>;
  token?: string;
}): Promise<{ url: string }> {
  const { name, githubRepo, envVars = {}, token } = opts;

  // 1. Create project
  const project = await createVercelProject({
    name,
    githubRepo,
    framework: "nextjs",
    token,
  });

  // 2. Set env vars (if any)
  if (Object.keys(envVars).length > 0) {
    await setVercelEnvVars({
      projectId: project.id,
      vars: envVars,
      token,
    });
  }

  // 3. Trigger deployment
  const deployment = await deployVercelProject({
    projectId: project.id,
    token,
  });

  // 4. Wait for ready
  const ready = await waitForDeployment(deployment.deploymentId, token);

  return { url: ready.url };
}
