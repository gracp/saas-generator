/**
 * Roadmap Issues — Generated from 4 Domain Expert Agents
 * Growth, Product/UX, Security, Developer Experience
 *
 * Run after all issues are created:
 *   node scripts/create-roadmap-issues.js
 */

export const ROADMAP_ISSUES = [
  // ═══════════════════════════════════════════════════
  // P0 — MUST HAVE AT LAUNCH
  // ═══════════════════════════════════════════════════

  // ── Onboarding & Activation ────────────────────────
  {
    title: "[P0] Onboarding wizard — 3-step flow (niche → generate → first SaaS)",
    body: `**Issue:** New users land on a blank dashboard with no guidance.

**What to build:**
- Step 1 — Niche picker: visual cards with icons/descriptions + search/filter
- Step 2 — Idea preview: animated preview showing what will be generated
- Step 3 — First deploy celebration: confetti + share modal
- Progress bar with step dots + back button
- "Resume on return" — track completion in user profile

**Priority:** P0 — without this, users don't know what to do and bounce.`,
    labels: ["enhancement", "priority"],
  },
  {
    title: "[P0] Dashboard empty state — branded CTA to create first SaaS",
    body: `**Issue:** Empty dashboard looks broken, not inviting.

**What to build:**
- Friendly illustration (rocket/building theme)
- Headline: "Your SaaS empire starts here"
- Primary CTA: "Create your first SaaS"
- Secondary: "Browse templates" link
- Conditional copy based on whether onboarding is complete`,
    labels: ["enhancement", "priority"],
  },
  {
    title: "[P0] Project creation wizard — template picker + naming + confirmation",
    body: `**Issue:** No guided flow for creating a new project.

**What to build:**
- Template selection grid with screenshot previews and category filters
- Real-time slug generation from project name
- Optional description + feature tags (has billing, has blog, etc.)
- Confirmation review card before creation
- Post-creation redirect to project workspace`,
    labels: ["enhancement", "priority"],
  },
  {
    title: "[P0] First deploy celebration moment — confetti + share modal",
    body: `**Issue:** First successful deploy is the key activation moment — make it memorable.

**What to build:**
- Confetti animation on first deploy completion
- "Share your SaaS" modal with:
  - Open Graph image preview of their SaaS
  - One-click Twitter/X, LinkedIn, Reddit share buttons
  - "Built with SaaS Generator" badge preview
- Milestone email triggered at same moment`,
    labels: ["enhancement", "priority"],
  },
  {
    title: "[P0] Progress bar during SaaS generation with step labels",
    body: `**Issue:** Users bail during generation thinking it's stuck.

**What to build:**
- Real-time status bar during generation showing:
  - "Fetching templates..." → "Building structure..." → "Adding features..." → "Done!"
- Estimated time remaining
- Cancel button
- Non-blocking UI — user can keep using dashboard while building`,
    labels: ["enhancement", "priority"],
  },
  {
    title: "[P0] Core event tracking — signup → first project → first deploy → activation",
    body: `**Issue:** Can't measure activation without tracking the funnel.

**What to build:**
- PostHog/Mixpanel integration
- Track: visitor_signup, email_verified, first_project_created, first_template_selected, first_deploy, plan_upgraded
- UTM parameter persistence through signup
- Internal funnel dashboard (PostHog or Metabase)
- Cohort tracking setup from day 1`,
    labels: ["analytics", "priority"],
  },
  {
    title: "[P0] Stripe checkout — full working flow with webhooks + plan upgrades",
    body: `**Issue:** Stripe is wired but needs real price IDs and webhook endpoint verification.

**What to build:**
- Create real Stripe products and price IDs ($0/Hobby, $29/Maker, $99/Studio)
- Add webhook endpoint to Stripe dashboard pointing to /api/billing/webhook
- Handle checkout.session.completed → update user plan in DB
- Handle customer.subscription.deleted → downgrade to free
- Handle invoice.payment_failed → log + notify user
- Usage meter on settings page showing "X/Y projects used"
- Upgrade/downgrade flow (proration)`,
    labels: ["billing", "priority"],
  },
  {
    title: "[P0] Multi-tenant data isolation — row-level security enforcement",
    body: `**Issue:** Can User A access User B's projects via API enumeration?

**What to build:**
- Every DB query scoped to authenticated user: WHERE userId = :current_user
- Remove direct project ID enumeration from public endpoints
- Test: verify User A cannot fetch User B's projects via curl/API
- All API routes return 401/404 (never 403) for unauthorized access`,
    labels: ["security", "priority"],
  },
  {
    title: "[P0] Rate limiting — per-user, per-IP, per-endpoint",
    body: `**Issue:** API is unprotected against abuse.

**What to build:**
- Implement rate limiting at API level
- Auth endpoints: 5/min per IP
- General API: 100/min per user
- Generation endpoints: 10/min per user
- Return 429 with Retry-After header
- Log abuse patterns for manual review`,
    labels: ["security", "priority"],
  },
  {
    title: "[P0] Stripe webhook — signature verification + idempotency + retry",
    body: `**Issue:** Webhook handler doesn't verify signatures or prevent replay attacks.

**What to build:**
- Verify Stripe-Signature header using webhook secret
- Store stripe_event_id in DB to prevent replay
- Implement exponential backoff retry (up to 5 attempts)
- Process webhooks asynchronously
- Dead letter queue for permanently failed events`,
    labels: ["billing", "security", "priority"],
  },
  {
    title: "[P0] Email notification system — build started + deploy complete emails",
    body: `**Issue:** Emails are scaffolded but not wired to real user sessions.

**What to build:**
- Wire sendBuildStartedEmail() to authenticated user email (not placeholder)
- Wire sendDeployCompleteEmail() with real Vercel URL + GitHub link
- HTML email templates (dark-themed, branded)
- Use Resend dev mode (delivered@resend.dev) until production API key set`,
    labels: ["notifications", "priority"],
  },
  {
    title: "[P0] API keys management UI in dashboard settings",
    body: `**Issue:** Users have no way to manage their API keys.

**What to build:**
- List active API keys with name, created date, last used
- "Create new key" with name input modal
- Copy-to-clipboard with feedback
- Revoke key with confirmation
- Store hashed keys in DB (never plaintext)`,
    labels: ["enhancement", "priority"],
  },

  // ── Pricing & Monetization ─────────────────────────
  {
    title: "[P0] Usage-based metering display on settings page",
    body: `**Issue:** Users don't know how close they are to their plan limits.

**What to build:**
- "X/Y projects used" meter on settings page
- "Z deploys this month" counter
- Upgrade CTA when approaching limits
- Soft limits with warning emails before hard blocking`,
    labels: ["billing", "priority"],
  },

  // ── Generated SaaS Quality ────────────────────────
  {
    title: "[P0] Generated SaaS — complete landing page with all sections",
    body: `**Issue:** Generated landing pages need to be fully functional and beautiful.

**What to build:**
- Hero with headline, subhead, dual CTAs (above fold, no scroll needed)
- Social proof section (stats + testimonials)
- Feature grid with icons
- How it works (3 steps)
- Pricing section (3 tiers with Stripe checkout)
- FAQ section (6-8 questions)
- Footer with links
- Dark theme (zinc-950 background, violet-500 accents)
- Responsive + scroll animations`,
    labels: ["generated-app", "priority"],
  },
  {
    title: "[P0] Generated SaaS — complete Stripe billing integration",
    body: `**Issue:** Generated apps need working Stripe billing.

**What to build:**
- Pricing tiers (Free / Pro / Team)
- Checkout flow (Stripe Checkout session)
- Customer portal for billing management
- Webhook handler for subscription events
- Success/cancel redirect handling
- Billing alert emails via Resend`,
    labels: ["generated-app", "billing", "priority"],
  },
  {
    title: "[P0] Generated SaaS — NextAuth with Google OAuth + session management",
    body: `**Issue:** Generated apps need production-ready auth.

**What to build:**
- Google OAuth + email/password auth options
- Session management with JWT refresh tokens
- Protected routes / middleware
- Sign in / sign up / sign out pages
- User avatar + name in nav`,
    labels: ["generated-app", "auth", "priority"],
  },
  {
    title: "[P0] Generated SaaS — database layer with Prisma + PostgreSQL",
    body: `**Issue:** Generated apps need a real database, not just an ORM scaffold.

**What to build:**
- Complete Prisma schema (User, Subscription, whatever the app needs)
- Database connection with proper pooling
- CRUD API for core entities
- Soft delete + audit timestamps
- Migration scripts`,
    labels: ["generated-app", "database", "priority"],
  },
  {
    title: "[P0] Generated SaaS — admin dashboard with stats, user management",
    body: `**Issue:** Users need to manage their SaaS after launch.

**What to build:**
- Stats header (total users, MRR, active trials)
- User management table (list, invite, remove, role)
- Usage metrics with sparkline charts
- Subscription management view`,
    labels: ["generated-app", "priority"],
  },

  // ═══════════════════════════════════════════════════
  // P1 — FIRST MONTH
  // ═══════════════════════════════════════════════════

  {
    title: "[P1] Welcome email drip — immediate + Day 1-2 nudge + first deploy celebration",
    body: `**Issue:** No email communication after signup.

**What to build:**
- Welcome email (immediate on signup)
- Day 1-2 "create your first project" nudge
- Milestone emails: 3rd deploy, 1st custom domain, 1st team invite
- Weekly usage digest (opt-in)
- Re-engagement sequence: Day 7, 14, 21, 30 for inactive users`,
    labels: ["notifications", "growth"],
  },
  {
    title: "[P1] Referral program — give/get mechanism with unique tracking links",
    body: `**Issue:** No viral loop for organic growth.

**What to build:**
- Unique referral link per user
- "Invite a friend, both get 1 free month" reward
- Track referrals through signup flow
- Referral dashboard (count, rewards earned)
- Fraud detection (don't count self-referrals)`,
    labels: ["growth"],
  },
  {
    title: "[P1] Public project showcase / gallery",
    body: `**Issue:** No social proof or inspiration for new users.

**What to build:**
- Users can publish their SaaS to a public gallery
- Browseable + filterable grid
- Each entry: name, tagline, live URL, screenshot, builder
- Upvote / featured sections
- SEO-optimized (targets "built with SaaS Generator X")`,
    labels: ["growth", "social"],
  },
  {
    title: "[P1] Keyboard shortcuts + command palette",
    body: `**Issue:** Power users want speed.

**What to build:**
- \`?\` → keyboard shortcuts help modal
- \`n\` → new project
- \`/\` → search projects
- \`g d\` → go to dashboard
- Shortcuts visible in help modal, closeable with Esc`,
    labels: ["enhancement"],
  },
  {
    title: "[P1] Notification center — bell icon + unread badge + activity feed",
    body: `**Issue:** Users have no visibility into what's happening with their projects.

**What to build:**
- Bell icon in top nav with unread count badge
- Dropdown panel: notifications with icon, title, timestamp
- "Mark all as read" button
- Types: build complete, deploy failed, billing alert, team invite
- Full activity feed page (/notifications)`,
    labels: ["enhancement"],
  },
  {
    title: "[P1] Sentry error tracking in generated apps",
    body: `**Issue:** Generated apps have no error monitoring.

**What to build:**
- Pre-integrated Sentry SDK in generated apps
- DSN configurable via environment variable
- Source maps upload pipeline in CI
- Error alerting webhook when error rate > threshold
- Error distribution dashboard (top errors by frequency)`,
    labels: ["generated-app", "observability"],
  },
  {
    title: "[P1] Preview deployments per pull request",
    body: `**Issue:** No preview environments for generated SaaS.

**What to build:**
- Auto-deploy preview environment for every PR to generated repo
- Share preview URL in PR comment
- Tear down after PR merge/close
- One-click rollback to any previous deployment`,
    labels: ["generated-app", "ci-cd"],
  },
  {
    title: "[P1] Cursor-based pagination for API list endpoints",
    body: `**Issue:** API returns unbounded lists.

**What to build:**
- Implement cursor-based pagination: GET /projects?cursor=xxx&limit=20
- Return { data: [], nextCursor, hasMore }
- Document cursor behavior in API reference`,
    labels: ["api"],
  },
  {
    title: "[P1] Bot protection — CAPTCHA on signup + email verification",
    body: `**Issue:** No protection against fake signups.

**What to build:**
- Cloudflare Turnstile or hCaptcha on signup form
- Disposable email domain detection at registration
- Email verification required before API access
- Monitor for bulk fake signups, auto-suspend pattern`,
    labels: ["security"],
  },
  {
    title: "[P1] Blog with 5-10 launch content posts",
    body: `**Issue:** No content marketing presence.

**What to build:**
- "How to build a SaaS in 10 minutes" post
- "SaaS Generator vs. Vercel templates" comparison
- "How to build an AI writing app" tutorial
- "Micro-SaaS teardown" case study
- RSS feed + sitemap`,
    labels: ["content", "growth"],
  },
  {
    title: "[P1] User settings — profile, security (2FA), billing, API keys",
    body: `**Issue:** Settings page exists but needs to be fully functional.

**What to build:**
- Profile: avatar upload, name, bio, timezone
- Security: password change, TOTP 2FA setup, active sessions + revoke
- Billing: current plan, usage meter, invoice download, upgrade CTA
- API keys: create, name, copy, revoke with confirmation`,
    labels: ["enhancement"],
  },

  // ═══════════════════════════════════════════════════
  // P2 — FIRST QUARTER
  // ═══════════════════════════════════════════════════

  {
    title: "[P2] Interactive onboarding video (60-90 sec)",
    body: `Embeddable walkthrough video on landing page + inside dashboard. Covers: pick niche → generate → deploy. 60-90 seconds, screen recording with voiceover.`,
    labels: ["content", "growth"],
  },
  {
    title: "[P2] Template marketplace — sell premium templates",
    body: `Let users submit community templates. Review + publish flow. Template authors earn revenue share. Creates ecosystem + viral loop.`,
    labels: ["growth", "marketplace"],
  },
  {
    title: "[P2] GraphQL API alongside REST",
    body: `Offer GraphQL endpoint for flexible querying. Schema auto-generated from REST. Enables complex data fetching for advanced users and mobile apps.`,
    labels: ["api"],
  },
  {
    title: "[P2] DDoS protection — Cloudflare integration",
    body: `Use Cloudflare for DDoS mitigation at edge. Configure rate rules. Geo-blocking. Traffic analysis for anomaly detection.`,
    labels: ["security"],
  },
  {
    title: "[P2] White-label options for generated SaaS",
    body: `Allow removing "Built with SaaS Generator" badge on Pro+ plans. Custom domain branding. Custom email sender. API key: WHITELABEL=true removes all branding.`,
    labels: ["generated-app", "billing"],
  },
  {
    title: "[P2] Native iOS/Android app with biometric login",
    body: `Dedicated mobile apps with biometric login (Face ID / fingerprint). Offline mode for viewing recent projects. Background sync for build status updates.`,
    labels: ["mobile"],
  },
  {
    title: "[P2] Compliance readiness — SOC2 / GDPR data processing",
    body: `If serving EU users: DPA agreements, right to deletion (GDPR), data residency options. Prepare for SOC2 Type II audit: evidence collection, access reviews.`,
    labels: ["security", "legal"],
  },
  {
    title: "[P2] Programmatic SEO — auto-generated niche landing pages",
    body: `Auto-generated pages targeting "How to build [X]" queries. Each page targets one niche with template details and CTA. Build programmatically from template metadata.`,
    labels: ["content", "growth"],
  },
  {
    title: "[P2] Revenue analytics dashboard — MRR, churn, LTV, CAC",
    body: `MRR tracking, churn rate, LTV by cohort, CAC by channel. Built in Metabase or custom dashboard. Weekly team review.`,
    labels: ["analytics", "billing"],
  },
  {
    title: "[P2] Community Discord/Slack workspace",
    body: `Official community for users to share projects, get help, network. Organic growth channel + feedback loop. Channel structure: #introductions, #showcase, #help, #feedback.`,
    labels: ["community", "growth"],
  },
  {
    title: "[P2] Twitter/X auto-tweet on deploy (optional)",
    body: `Optional: automatically tweet when you deploy. "Just launched my SaaS using @saasgenerator 🚀 [link]". Requires Twitter OAuth connection. User opts in per-project.`,
    labels: ["social", "growth"],
  },
  {
    title: "[P2] Team management — invite teammates by email with roles",
    body: `Invite teammates by email with role selector (Admin, Editor, Viewer). Pending invitations with resend/cancel. Member list with role badges and remove. Role permissions matrix.`,
    labels: ["enhancement"],
  },
  {
    title: "[P2] Custom domain setup UI for generated SaaS",
    body: `Input field for custom domain. CNAME / A record instructions shown dynamically. SSL provisioning (Let's Encrypt automatic). Status indicator: Checking DNS → Verified → Error.`,
    labels: ["generated-app"],
  },
  {
    title: "[P2] Cohort analysis dashboard — week 1 retention, paying user characteristics",
    body: `Track activation rate by cohort (signup week/month). Identify what predicts paid conversion. Drop-off analysis at each funnel step. Built in PostHog or Metabase.`,
    labels: ["analytics"],
  },
  {
    title: "[P2] Webhook delivery reliability — outbound retry queue",
    body: `Implement persistent outbound webhook queue with exponential backoff. Dead letter queue after max retries. Webhook delivery logs visible to customer in dashboard.`,
    labels: ["api", "reliability"],
  },
] as const;

export type RoadmapIssue = (typeof ROADMAP_ISSUES)[number];
