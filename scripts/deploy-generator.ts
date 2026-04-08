/**
 * Deploy the SaaS Generator app itself to Vercel
 *
 * Usage: npx ts-node --esm scripts/deploy-generator.ts
 *
 * Prerequisites:
 *   VERCEL_API_TOKEN=xxxx   (from vercel.com/account/tokens)
 *   NEXTAUTH_URL=https://your-domain.com  (after custom domain is configured)
 *   DATABASE_URL=postgresql://...  (Supabase PostgreSQL)
 *   STRIPE_SECRET_KEY=sk_live_...
 *   STRIPE_WEBHOOK_SECRET=whsec_...
 *   STRIPE_PRICE_MAKER=price_...
 *   STRIPE_PRICE_STUDIO=price_...
 *   NEXTAUTH_SECRET=openssl rand -base64 32
 *   GOOGLE_CLIENT_ID=xxxx
 *   GOOGLE_CLIENT_SECRET=xxxx
 *   RESEND_API_KEY=re_xxxx
 */

const GITHUB_REPO = "gracp/saas-generator";
const PROJECT_NAME = "saas-generator";

const REQUIRED_ENV_VARS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_MAKER",
  "STRIPE_PRICE_STUDIO",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "DATABASE_URL",
  "EXA_API_KEY",
  "RESEND_API_KEY",
];

// ─── Vercel API client (local to this script) ─────────────

async function vercelFetch(
  path: string,
  opts: RequestInit & { token?: string } = {}
): Promise<unknown> {
  const apiToken = opts.token ?? process.env.VERCEL_API_TOKEN;
  if (!apiToken) throw new Error("VERCEL_API_TOKEN not set");

  const base = "https://api.vercel.com/v13";
  const url = path.startsWith("http") ? path : `${base}${path}`;

  const res = await fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Vercel API error ${res.status}: ${body}`);
  }

  return res.json();
}

async function getVercelToken(): Promise<string> {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) throw new Error("VERCEL_API_TOKEN not set");
  return token;
}

async function findOrCreateProject(token: string): Promise<{ id: string; name: string }> {
  // Try to find existing project
  const projects = await vercelFetch("/v8/projects", { token }) as {
    projects: Array<{ id: string; name: string }>;
  };

  const existing = projects.projects.find((p) => p.name === PROJECT_NAME);
  if (existing) {
    console.log(`Found existing Vercel project: ${existing.name} (${existing.id})`);
    return existing;
  }

  // Create new project
  console.log(`Creating new Vercel project: ${PROJECT_NAME}`);
  const created = await vercelFetch("/v8/projects", {
    method: "POST",
    token,
    body: JSON.stringify({
      name: PROJECT_NAME,
      gitSource: {
        type: "github",
        repo: GITHUB_REPO,
        productionBranch: "main",
      },
      buildCommand: "npm run build",
      outputDirectory: ".next",
      installCommand: "npm install",
      framework: "nextjs",
    }),
  }) as { id: string; name: string };

  console.log(`Created project: ${created.name} (${created.id})`);
  return created;
}

async function setEnvVars(token: string, projectId: string): Promise<void> {
  console.log("\nSetting environment variables...");

  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName];
    if (!value) {
      console.warn(`  ⚠ ${varName} not set — skipping`);
      continue;
    }

    try {
      await vercelFetch(`/v8/projects/${projectId}/env`, {
        method: "POST",
        token,
        body: JSON.stringify({
          key: varName,
          value,
          type: "secret", // store as secret unless it's a public var
          decrypt: true,
        }),
      });
      console.log(`  ✓ ${varName}`);
    } catch (err) {
      // Variable might already exist — try updating
      try {
        await vercelFetch(`/v8/projects/${projectId}/env/${varName}`, {
          method: "PATCH",
          token,
          body: JSON.stringify({ value, type: "secret", decrypt: true }),
        });
        console.log(`  ✓ ${varName} (updated)`);
      } catch {
        console.warn(`  ⚠ Failed to set ${varName}`);
      }
    }
  }
}

async function triggerDeployment(token: string, projectId: string): Promise<string> {
  console.log("\nTriggering production deployment...");

  const deployment = await vercelFetch("/v13/deployments", {
    method: "POST",
    token,
    body: JSON.stringify({
      gitSource: {
        type: "github",
        repo: GITHUB_REPO,
        ref: "main",
      },
      project: projectId,
      target: "production",
    }),
  }) as { id: string; url: string; status: string };

  console.log(`Deployment created: ${deployment.id}`);
  console.log(`Status: ${deployment.status}`);
  console.log(`URL: https://${deployment.url}`);

  return deployment.id;
}

async function waitForDeployment(token: string, deploymentId: string): Promise<void> {
  console.log("\nWaiting for deployment to be ready...");
  let attempts = 0;
  while (attempts < 30) {
    const status = await vercelFetch(
      `/v13/deployments/${deploymentId}`,
      { token }
    ) as { status: string; readyTime?: number };

    console.log(`  Status: ${status.status} (attempt ${attempts + 1})`);
    if (status.status === "READY") {
      console.log(`\n✅ Deployment ready!`);
      return;
    }
    if (status.status === "ERROR") {
      throw new Error("Deployment failed");
    }
    await new Promise((r) => setTimeout(r, 10000)); // poll every 10s
    attempts++;
  }
  throw new Error("Deployment timed out");
}

async function main() {
  console.log("🚀 SaaS Generator — Vercel Deploy Script\n");
  console.log(`Target: ${GITHUB_REPO}\n`);

  const token = await getVercelToken();
  const project = await findOrCreateProject(token);
  await setEnvVars(token, project.id);
  const deploymentId = await triggerDeployment(token, project.id);
  await waitForDeployment(token, deploymentId);

  console.log("\n📋 Next steps:");
  console.log("  1. Configure custom domain in Vercel dashboard");
  console.log("  2. Set NEXTAUTH_URL to your custom domain");
  console.log("  3. Add webhook endpoint in Stripe dashboard:");
  console.log(`     https://<your-domain>/api/billing/webhook`);
  console.log("  4. Add Google OAuth redirect URI in Google Cloud Console:");
  console.log(`     https://<your-domain>/api/auth/callback/google`);
}

main().catch((err) => {
  console.error("\n❌ Deploy failed:", err.message);
  process.exit(1);
});
