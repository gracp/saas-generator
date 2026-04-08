/**
 * Code Generator — spawns OpenClaw agents on feature worktrees
 *
 * Each agent generates code for one branch, commits, pushes,
 * and opens a PR. Runs via OpenClaw's built-in agent system
 * (sessions_spawn with runtime="subagent").
 */

import { createWorktree } from "./github";
import { addEvent } from "./projects";
import type { SaaSProject } from "./projects";

// ─── Types ───────────────────────────────────────────────

export interface CodeGenBranch {
  name: string;
  task: string;
  worktreePath: string;
  prUrl: string;
}

export interface CodeGenResult {
  branches: CodeGenBranch[];
  completed: string[];
}

// ─── Agent Prompts per Branch ────────────────────────────

const BRANCH_PROMPTS: Record<
  string,
  { title: string; prompt: string }
> = {
  "feat/scaffolding": {
    title: "Scaffolding Agent",
    prompt: `You are building the foundation of a new SaaS app.

GOAL: Initialize a Next.js 14 project in CURRENT directory with:
1. TypeScript strict mode
2. Tailwind CSS (install + configure with dark theme — zinc-950 bg, violet-500 accent)
3. ESLint + Prettier
4. Lib export: utils.ts (cn helper), api.ts (fetch wrapper)
5..env.example with VERCEL_URL, STRIPE_KEY, OPENAI_KEY
6. Basic app/layout.tsx and app/globals.css ready for pages
7. package.json scripts: dev, build, lint, type-check

STEPS:
1. Run: npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --no-import-alias --yes
2. If that fails (directory not empty), manually create the files
3. Install: npm install class-variance-authority clsx tailwind-merge lucide-react
4. Create src/lib/utils.ts with: import { clsx, type ClassValue } from "clsx"; import { twMerge } from "tailwind-merge"; export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
5. Create src/lib/api.ts with fetch wrapper
6. Create .env.example
7. Create src/app/globals.css with CSS variables for dark theme
8. Update src/app/layout.tsx with proper metadata
9. Run: git init && git add -A && git commit -m "chore: project scaffold" && git branch -M main
10. Push: git push -u origin main

DO NOT ask questions. Make decisions and execute.
When done: openclaw system event --text "Done: Scaffolding complete in WORKTREE_PATH" --mode now`,
  },

  "feat/landing-page": {
    title: "Landing Page Agent",
    prompt: `You are building a SaaS landing page.

GOAL: Create a production-quality landing page in CURRENT directory.

CONTEXT:
- App name: APP_NAME
- Tagline: TAGLINE
- Core feature: FEATURE
- Pricing: PRICING
- Target user: USER

REQUIRED SECTIONS:
1. Hero: H1 headline (app name + tagline), subheadline, dual CTA buttons ("Start Free" + "See Demo"), hero visual (CSS gradient orb or abstract shape)
2. How It Works: 3-step horizontal flow with icons (Step 1: research, Step 2: generate, Step 3: deploy)
3. Features Grid: 6 feature cards with icon + title + 1-sentence description
4. Social Proof: "Trusted by X founders" + 4 placeholder logos (SVG text placeholders)
5. Pricing: 3-tier table (Free / Pro $X/mo / Enterprise) with feature lists
6. FAQ: 5 accordion items about the product
7. CTA Section: final push with gradient background

DESIGN:
- Dark theme: bg-zinc-950, cards bg-zinc-900/50, borders zinc-800
- Accent: violet-500 for CTAs, highlights
- Text: zinc-100 for headings, zinc-400 for body
- Responsive (mobile-first, breakpoint at md)
- Smooth scroll + fade-in animations on scroll

STEPS:
1. Read the existing src/app/page.tsx and src/app/layout.tsx
2. Build the full landing page in src/app/page.tsx
3. Use shadcn/ui components where appropriate (button, card, badge, separator)
4. Create src/lib/copy.ts for all text content
5. Add scroll animation with intersection observer (useEffect + CSS classes)
6. Verify: npm run build passes
7. Commit + push + open PR to main
8. When done: openclaw system event --text "Done: Landing page PR opened" --mode now`,
  },

  "feat/stripe-billing": {
    title: "Stripe Billing Agent",
    prompt: `You are integrating Stripe billing.

GOAL: Set up Stripe subscriptions in CURRENT directory.

FEATURES TO BUILD:
1. API route: src/app/api/stripe/checkout/route.ts
   - POST: create checkout session for subscription
   - Accept: { priceId, successUrl, cancelUrl }
   - Return: { sessionUrl }
2. API route: src/app/api/stripe/webhook/route.ts
   - Handle: checkout.session.completed, customer.subscription.deleted, invoice.payment_failed
   - Verify Stripe signature
3. API route: src/app/api/stripe/portal/route.ts
   - POST: create customer portal session
4. Lib: src/lib/stripe.ts
   - stripe.clients initialized
   - Price IDs from env (STRIPE_PRICE_FREE, STRIPE_PRICE_PRO, STRIPE_PRICE_ENTERPRISE)
5. Success page: src/app/stripe/success/page.tsx
6. Cancel page: src/app/stripe/cancel/page.tsx
7. .env.example entries: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_*, STRIPE_PROD_SECRET

STEPS:
1. npm install stripe
2. Create all files listed above
3. Add route handlers with proper error handling
4. Update .env.example
5. Commit + push + PR
6. When done: openclaw system event --text "Done: Stripe billing PR opened" --mode now`,
  },

  "feat/core-feature": {
    title: "Core Feature Agent",
    prompt: `You are building the core feature of a SaaS app.

GOAL: Build the main value proposition feature.

APP NAME: APP_NAME
CORE FEATURE: FEATURE
TAGLINE: TAGLINE

SUGGESTED FEATURES FROM RESEARCH:
FEATURES_LIST

REQUIRED:
1. Feature page: src/app/[app]/page.tsx (replace [app] with slugified app name)
   - Main feature implementation with interactive UI
   - Dashboard overview
2. API route(s) for the feature: src/app/api/[feature]/route.ts
3. Data model: src/lib/models/[feature].ts (types + in-memory store for MVP)
4. Components: src/components/[feature]/*.tsx
5. If AI-related: connect to OpenAI API with proper error handling

EXAMPLES of features to build:
- AI invoice generator from timesheet data
- Automatic payment reminder scheduler
- Expense categorization engine
- Real-time tax calculator
- Client portal for invoice viewing

Pick the most impactful feature and build it properly.
Build something impressive — this is the core of the product.

STEPS:
1. Analyze the app context from the worktree
2. Pick the most impactful feature
3. Build it completely (frontend + backend + API)
4. npm run build must pass
5. Commit + push + PR
6. When done: openclaw system event --text "Done: Core feature PR opened" --mode now`,
  },
};

// ─── Main Generator ─────────────────────────────────────

/**
 * Spawn OpenClaw sub-agents on each feature worktree.
 * Each agent generates code, commits, pushes, and opens a PR.
 */
export async function spawnCodeGenerationAgents(
  project: SaaSProject,
  repoDir: string
): Promise<CodeGenResult> {
  const idea = project.selectedIdea;
  if (!idea) throw new Error("No idea selected");

  const branches = [
    {
      name: "feat/scaffolding",
      task: "Project setup — Next.js, Tailwind, auth, database",
    },
    {
      name: "feat/landing-page",
      task: `Landing page for ${idea.name} — ${idea.tagline}`,
    },
    {
      name: "feat/stripe-billing",
      task: `Stripe billing — ${idea.monetization}`,
    },
    {
      name: "feat/core-feature",
      task: `Core feature: ${idea.coreFeature}`,
    },
  ];

  const results: CodeGenBranch[] = [];

  for (const branch of branches) {
    const worktreePath = createWorktree(repoDir, branch.name);

    addEvent(
      project.id,
      `Spawning agent for ${branch.name}...`,
      "info"
    );

    // Build the agent prompt with substituted context
    const branchConfig = BRANCH_PROMPTS[branch.name];
    if (!branchConfig) continue;

    const prompt = buildPrompt(branchConfig.prompt, {
      APP_NAME: idea.name,
      TAGLINE: idea.tagline,
      FEATURE: idea.coreFeature,
      PRICING: idea.monetization,
      USER: idea.targetUser,
      FEATURES_LIST: idea.mvpScope.join(", "),
      WORKTREE_PATH: worktreePath,
    });

    // sessions_spawn is injected by OpenClaw at runtime — cast to function to satisfy TS
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spawnFn = (sessions_spawn as any) as (
      opts: { mode: string; runtime: string; task: string; cwd?: string }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) => Promise<any>;

    const session = await spawnFn({
      mode: "run",
      runtime: "subagent",
      task: prompt,
      cwd: worktreePath,
    });
    void session;

    addEvent(
      project.id,
      `Agent ${branchConfig.title} spawned on ${branch.name}`,
      "info"
    );

    results.push({
      name: branch.name,
      task: branch.task,
      worktreePath,
      prUrl: "", // Agent will fill this in after PR
    });
  }

  return { branches: results, completed: [] };
}

// ─── Prompt Substitution ────────────────────────────────

function buildPrompt(template: string, vars: Record<string, string>): string {
  return template.replace(
    new RegExp(Object.keys(vars).join("|"), "g"),
    (match) => vars[match] ?? match
  );
}

// ─── External sessions_spawn type ─────────────────────
// (Actual import happens at runtime via OpenClaw)

// sessions_spawn is provided by OpenClaw at runtime
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare function sessions_spawn(opts: {
  mode: string;
  runtime: string;
  task: string;
  cwd?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any>;
