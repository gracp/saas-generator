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
8. Update src/app/layout.tsx: add a sticky footer with "Built with [SaaS Generator](https://saasgenerator.ai)" badge (small text, zinc-500, centered, links open in new tab)
9. Run: git init && git add -A && git commit -m "chore: project scaffold" && git branch -M main
10. Push: git push -u origin main

DO NOT ask questions. Make decisions and execute.
When done, commit your changes and push to your branch. The session will end automatically.
`,
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
8. Footer: company name + links + "Built with [SaaS Generator](https://saasgenerator.ai)" badge link in muted text

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
8. Commit your changes and push to open a PR. The session will end automatically.
`,
  },

  "feat/auth": {
    title: "Auth Agent",
    prompt: `You are setting up authentication.

GOAL: Add NextAuth.js with Google OAuth + credentials to CURRENT directory.

FEATURES TO BUILD:
1. npm install next-auth @auth/prisma-adapter
2. Create src/app/api/auth/[...nextauth]/route.ts with NextAuth config
3. Create src/lib/auth.ts with authOptions (Google provider + Credentials provider)
4. Create src/middleware.ts to protect routes
5. Create src/components/auth/login-form.tsx — styled login form (dark theme, zinc-950 bg)
6. Create src/components/auth/signup-form.tsx — signup form
7. Create src/app/auth/login/page.tsx — login page
8. Create src/app/auth/signup/page.tsx — signup page
9. Create src/components/auth/user-menu.tsx — dropdown with avatar, name, sign out
10. Create src/app/dashboard/page.tsx — protected dashboard placeholder
11. Create src/lib/session.ts — getServerSession helper
12. Update src/app/layout.tsx to wrap with SessionProvider

DESIGN:
- Dark theme consistent with rest of app (zinc-950 bg, violet-500 accents)
- Auth pages centered, max-w-sm
- Error states with red text
- Loading states with spinner
- Google OAuth button with Google logo
- "Or continue with email" divider

STEPS:
1. Install packages
2. Create all auth files
3. Add session provider to layout
4. Create protected dashboard page
5. Verify npm run build passes
6. Commit + push + open PR to main`,
  },

  "feat/database": {
    title: "Database Agent",
    prompt: `You are setting up the database layer.

GOAL: Add Prisma ORM with PostgreSQL to CURRENT directory.

FEATURES TO BUILD:
1. npm install prisma @prisma/client
2. npx prisma init
3. Update prisma/schema.prisma with models:
   - User (id, email, name, image, role, createdAt, updatedAt)
   - Account (id, userId, type, provider, providerAccountId, refresh_token, access_token, expires_at, id_token)
   - Session (id, userId, token, expires)
   - Plan/Subscription if relevant
   - Core feature models based on APP_NAME context
4. Create src/lib/db.ts with singleton Prisma client
5. Create src/lib/seed.ts with sample data
6. Create type-safe CRUD helpers in src/lib/crud.ts
7. Add .env entries: DATABASE_URL
8. Create API routes for each model: src/app/api/[model]/route.ts
   - GET: list with pagination (page, limit query params)
   - POST: create with validation
9. Create src/app/api/[model]/[id]/route.ts
   - GET: single record
   - PUT: update
   - DELETE: soft delete

DESIGN:
- All API routes return { data, error, meta: { page, limit, total } }
- Input validation with simple type checks (no zod needed for MVP)
- Proper error handling with 400/404/500 status codes
- TypeScript types for all models exported from src/lib/types.ts

STEPS:
1. Initialize Prisma
2. Create schema with all models
3. Generate client
4. Create db singleton
5. Create CRUD helpers
6. Create API routes
7. Create types file
8. Verify npm run build passes
9. Commit + push + open PR to main`,
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
Commit your changes and push to open a PR. The session will end automatically.
`,
  },

  "feat/admin": {
    title: "Admin Dashboard Agent",
    prompt: `You are building an admin dashboard.

GOAL: Create an admin panel for APP_NAME in CURRENT directory.

FEATURES TO BUILD:
1. Create src/app/admin/layout.tsx — admin layout with sidebar navigation
2. Create src/app/admin/page.tsx — overview dashboard:
   - Stats cards: Total Users, Revenue (MRR), Active Subscriptions, Conversion Rate
   - Mini chart placeholders (simple bar charts with CSS)
   - Recent activity feed
3. Create src/app/admin/users/page.tsx — user management:
   - Table with: name, email, plan, status, join date, actions
   - Search/filter by email
   - Ban/unban toggle
   - Role assignment (admin/viewer)
4. Create src/app/admin/users/[id]/page.tsx — user detail view:
   - User info card
   - Activity timeline
   - Subscription history
5. Create src/components/admin/sidebar.tsx — sidebar nav:
   - Dashboard, Users, Revenue, Settings links
   - Collapsible on mobile
   - Active state indicator
6. Create src/components/admin/stats-card.tsx — reusable stats card
7. Create src/app/admin/revenue/page.tsx — revenue metrics:
   - MRR, ARR, churn rate
   - Simple CSS bar chart showing monthly revenue

DESIGN:
- Dark theme: zinc-950 bg, zinc-900 cards, emerald-500 for revenue/success
- Admin layout: fixed sidebar (w-64) + main content area
- Responsive: sidebar collapses on mobile
- Table rows with hover state
- Badge components for status (active, inactive, trial)

STEPS:
1. Create admin layout with sidebar
2. Build overview page with stats
3. Build users list page
4. Build user detail page
5. Build revenue page
6. Add shared components
7. Protect admin routes (check for admin role in middleware or layout)
8. Verify npm run build passes
9. Commit + push + open PR to main`,
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
Commit your changes and push to open a PR. The session will end automatically.
`,
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
      name: "feat/auth",
      task: "Authentication — NextAuth + Google OAuth",
    },
    {
      name: "feat/database",
      task: "Database — Prisma + PostgreSQL + CRUD API",
    },
    {
      name: "feat/stripe-billing",
      task: `Stripe billing — ${idea.monetization}`,
    },
    {
      name: "feat/core-feature",
      task: `Core feature: ${idea.coreFeature}`,
    },
    {
      name: "feat/admin",
      task: "Admin dashboard — stats, users, revenue",
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

    // Await agent completion — result is intentionally discarded
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    await spawnFn({
      mode: "run",
      runtime: "subagent",
      task: prompt,
      cwd: worktreePath,
    });

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
