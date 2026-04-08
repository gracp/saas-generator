#!/usr/bin/env node
/**
 * Create roadmap GitHub issues
 * Usage: node scripts/create-roadmap-issues.js [--dry-run]
 */

const { execSync } = require("child_process");

const DRY_RUN = process.argv.includes("--dry-run");
const REPO = "gracp/saas-generator";

const ISSUES = [
  // P0 — MUST HAVE AT LAUNCH
  {
    title: "[P0] Onboarding wizard — 3-step flow (niche → generate → first SaaS)",
    body: `**Issue:** New users land on a blank dashboard with no guidance.

**What to build:**
- Step 1 — Niche picker: visual cards with icons/descriptions + search/filter
- Step 2 — Idea preview: animated preview showing what will be generated
- Step 3 — First deploy celebration: confetti + share modal
- Progress bar with step dots + back button
- "Resume on return" — track completion in user profile`,
    labels: ["enhancement", "priority"],
  },
  {
    title: "[P0] Dashboard empty state — branded CTA to create first SaaS",
    body: `**Issue:** Empty dashboard looks broken, not inviting.

**What to build:**
- Friendly illustration (rocket/building theme)
- Headline: "Your SaaS empire starts here"
- Primary CTA: "Create your first SaaS"
- Secondary: "Browse templates" link`,
    labels: ["enhancement", "priority"],
  },
  {
    title: "[P0] Project creation wizard — template picker + naming + confirmation",
    body: `**Issue:** No guided flow for creating a new project.

**What to build:**
- Template selection grid with screenshot previews and category filters
- Real-time slug generation from project name
- Optional description + feature tags
- Confirmation review card before creation
- Post-creation redirect to project workspace`,
    labels: ["enhancement", "priority"],
  },
  {
    title: "[P0] First deploy celebration — confetti + share modal + milestone email",
    body: `**Issue:** First successful deploy is the key activation moment — make it memorable.

**What to build:**
- Confetti animation on first deploy completion
- "Share your SaaS" modal: Open Graph preview, Twitter/X + LinkedIn share buttons
- Milestone email triggered at same moment with Vercel URL + GitHub link`,
    labels: ["enhancement", "priority"],
  },
  {
    title: "[P0] Progress bar during SaaS generation with step labels",
    body: `**Issue:** Users bail during generation thinking it is stuck.

**What to build:**
- Real-time status bar: "Fetching templates..." → "Building structure..." → "Adding features..." → "Done!"
- Estimated time remaining
- Cancel button
- Non-blocking — user can use dashboard while building`,
    labels: ["enhancement", "priority"],
  },
  {
    title: "[P0] Core event tracking — signup → first project → first deploy → activation funnel",
    body: `**Issue:** Cannot measure activation without tracking the funnel.

**What to build:**
- PostHog/Mixpanel integration
- Track: visitor_signup, email_verified, first_project_created, first_template_selected, first_deploy, plan_upgraded
- UTM parameter persistence through signup
- Internal funnel dashboard (PostHog or Metabase)
- Cohort tracking setup from day 1`,
    labels: ["analytics", "priority"],
  },
  {
    title: "[P0] Stripe checkout — full working flow with webhooks, plan upgrades, and usage metering",
    body: `**Issue:** Stripe is wired but needs real price IDs and webhook endpoint verification.

**What to build:**
- Create real Stripe products and price IDs ($0/Hobby, $29/Maker, $99/Studio)
- Add webhook endpoint to Stripe dashboard pointing to /api/billing/webhook
- Handle checkout.session.completed, customer.subscription.deleted, invoice.payment_failed
- Usage meter on settings page: "X/Y projects used"
- Upgrade/downgrade flow with proration`,
    labels: ["billing", "priority"],
  },
  {
    title: "[P0] Multi-tenant data isolation — row-level security enforcement on all queries",
    body: `**Issue:** Can User A access User B's projects via API enumeration?

**What to build:**
- Every DB query scoped to authenticated user (WHERE userId = :current_user)
- Test: verify User A cannot fetch User B's projects via direct API call
- All API routes return 401/404 for unauthorized access (never 403 leaking info)`,
    labels: ["security", "priority"],
  },
  {
    title: "[P0] Rate limiting — per-user, per-IP, per-endpoint with 429 responses",
    body: `**Issue:** API is unprotected against abuse and DoS.

**What to build:**
- Auth endpoints: 5/min per IP
- General API: 100/min per user
- Generation endpoints: 10/min per user
- Return 429 with Retry-After header
- Log abuse patterns for manual review`,
    labels: ["security", "priority"],
  },
  {
    title: "[P0] Stripe webhook — signature verification, idempotency, exponential backoff retry",
    body: `**Issue:** Webhook handler does not verify signatures or prevent replay attacks.

**What to build:**
- Verify Stripe-Signature header using webhook secret
- Store stripe_event_id in DB to prevent replay
- Implement exponential backoff retry (up to 5 attempts)
- Process webhooks asynchronously via queue
- Dead letter queue for permanently failed events`,
    labels: ["billing", "security", "priority"],
  },
  {
    title: "[P0] Email notifications — wire to authenticated user, send build + deploy emails",
    body: `**Issue:** Emails are scaffolded but not wired to real user sessions.

**What to build:**
- sendBuildStartedEmail() wired to authenticated user email
- sendDeployCompleteEmail() with real Vercel URL + GitHub link
- HTML email templates (dark-themed, branded with SaaS Generator identity)
- Use Resend dev mode (delivered@resend.dev) until production API key is set`,
    labels: ["notifications", "priority"],
  },
  {
    title: "[P0] API keys management UI in dashboard settings",
    body: `**Issue:** Users have no way to manage their API keys.

**What to build:**
- List active API keys with name, created date, last used
- "Create new key" with name input modal
- Copy-to-clipboard with "Copied!" feedback
- Revoke key with confirmation dialog
- Store hashed keys in DB (never plaintext)`,
    labels: ["enhancement", "priority"],
  },
  {
    title: "[P0] Usage-based metering display — project count + deploy count vs plan limits",
    body: `**Issue:** Users do not know how close they are to their plan limits.

**What to build:**
- "X/Y projects used" meter on settings page
- "Z deploys this month" counter
- Upgrade CTA when approaching limits
- Soft limits with warning emails before hard blocking`,
    labels: ["billing", "priority"],
  },
  {
    title: "[P0] Generated SaaS — complete landing page (hero, social proof, features, pricing, FAQ)",
    body: `**Issue:** Generated landing pages need to be fully functional and beautiful out of the box.

**What to build:**
- Hero with headline, subhead, dual CTAs (above fold, no scroll needed)
- Social proof section (stats + testimonials)
- Feature grid with icons
- How it works (3 steps)
- Pricing section (3 tiers with Stripe Checkout)
- FAQ section (6-8 questions)
- Footer with links
- Dark theme (zinc-950, violet-500 accents) + responsive + scroll animations`,
    labels: ["generated-app", "priority"],
  },
  {
    title: "[P0] Generated SaaS — complete Stripe billing (checkout, portal, webhooks, alerts)",
    body: `**Issue:** Generated apps need working Stripe billing, not just scaffolded code.

**What to build:**
- Pricing tiers (Free / Pro / Team) with Stripe Checkout sessions
- Customer Portal for billing management
- Webhook handler for subscription lifecycle events
- Success/cancel redirect handling
- Billing alert emails via Resend
- Invoice download links`,
    labels: ["generated-app", "billing", "priority"],
  },
  {
    title: "[P0] Generated SaaS — NextAuth with Google OAuth + session management",
    body: `**Issue:** Generated apps need production-ready auth, not just auth scaffolding.

**What to build:**
- Google OAuth + email/password auth options
- JWT session management with refresh token rotation
- Protected routes / middleware
- Sign in / sign up / sign out pages
- User avatar + name in navigation bar
- Session revocation endpoint`,
    labels: ["generated-app", "auth", "priority"],
  },
  {
    title: "[P0] Generated SaaS — Prisma schema + PostgreSQL + CRUD API for core entities",
    body: `**Issue:** Generated apps need a real database with complete CRUD, not just an ORM scaffold.

**What to build:**
- Complete Prisma schema (User, Subscription, and app-specific models)
- Database connection with connection pooling (PgBouncer or Supabase pooler)
- CRUD API routes for all core entities
- Soft delete + audit timestamps on all models
- Database migration scripts (backward compatible)`,
    labels: ["generated-app", "database", "priority"],
  },
  {
    title: "[P0] Generated SaaS — admin dashboard (stats, user management, revenue metrics)",
    body: `**Issue:** Users need to manage their SaaS after launch, not just build it.

**What to build:**
- Stats header: total users, MRR, active trials, churn rate
- User management table: list, invite by email, remove, role (Admin/Editor/Viewer)
- Subscription management view per user
- Usage metrics with sparkline charts (7-day trend)
- Revenue analytics mini-dashboard`,
    labels: ["generated-app", "priority"],
  },

  // P1 — FIRST MONTH
  {
    title: "[P1] Welcome email drip — immediate + Day 1-2 nudge + milestone emails",
    body: `**Issue:** No email communication after signup.

**What to build:**
- Welcome email (immediate on signup, warm tone)
- Day 1-2 "create your first project" nudge with direct CTA
- Milestone emails: 3rd deploy, 1st custom domain, 1st team invite
- Weekly usage digest (opt-in)
- Re-engagement sequence: Day 7, 14, 21, 30 for inactive users
- "You are almost there" abandonment email for users who started but never deployed`,
    labels: ["notifications", "growth"],
  },
  {
    title: "[P1] Referral program — give/get mechanism with unique tracking links",
    body: `**Issue:** No viral loop for organic growth.

**What to build:**
- Unique referral link per user (e.g., saasgenerator.com/ref/username)
- "Invite a friend, both get 1 free month" reward
- Referral dashboard: count of referrals, rewards earned, pending rewards
- Fraud detection: do not count self-referrals
- Affiliate link export for external promoters`,
    labels: ["growth"],
  },
  {
    title: "[P1] Public project showcase / gallery",
    body: `**Issue:** No social proof or inspiration for new users.

**What to build:**
- Users publish their SaaS to public gallery (/showcase)
- Browseable + filterable grid (by category, feature, deploy count)
- Each entry: name, tagline, live URL, screenshot, builder, upvote count
- Featured section (curated by admin)
- SEO-optimized (targets "built with SaaS Generator X" queries)`,
    labels: ["growth", "social"],
  },
  {
    title: "[P1] Keyboard shortcuts + command palette",
    body: `**Issue:** Power users want speed.

**What to build:**
- ? → keyboard shortcuts help modal
- n → new project
- / → search projects
- g d → go to dashboard
- Esc → close modals
- Shortcuts visible in help modal`,
    labels: ["enhancement"],
  },
  {
    title: "[P1] Notification center — bell icon, unread badge, activity feed",
    body: `**Issue:** Users have no visibility into what is happening with their projects.

**What to build:**
- Bell icon in top nav with unread count badge (red dot or number)
- Dropdown panel: notifications with icon, title, timestamp, unread dot
- "Mark all as read" button
- Notification types: build complete, deploy failed, billing alert, team invite
- Full activity feed page at /notifications with filtering`,
    labels: ["enhancement"],
  },
  {
    title: "[P1] Sentry error tracking in generated apps",
    body: `**Issue:** Generated apps have no error monitoring when they go live.

**What to build:**
- Pre-integrated Sentry SDK in generated apps
- DSN configurable via environment variable (SENTRY_DSN)
- Source maps upload pipeline in CI
- Error alerting webhook when error rate exceeds threshold
- Error distribution dashboard: top errors by frequency`,
    labels: ["generated-app", "observability"],
  },
  {
    title: "[P1] Preview deployments per pull request in generated repos",
    body: `**Issue:** No preview environments for generated SaaS before going live.

**What to build:**
- Auto-deploy preview environment for every PR to generated repo
- Share preview URL in PR comment automatically
- Tear down preview after PR merge or close
- Branch-based isolated environments
- One-click rollback to any previous deployment`,
    labels: ["generated-app", "ci-cd"],
  },
  {
    title: "[P1] Cursor-based pagination for API list endpoints",
    body: `**Issue:** API returns unbounded lists which can be slow and large.

**What to build:**
- Implement cursor-based pagination: GET /projects?cursor=xxx&limit=20
- Return { data: [], nextCursor, hasMore }
- Cursor is opaque string encoding offset
- Document in API reference`,
    labels: ["api"],
  },
  {
    title: "[P1] Bot protection — CAPTCHA on signup + email verification before API access",
    body: `**Issue:** No protection against fake signups and disposable email accounts.

**What to build:**
- Cloudflare Turnstile or hCaptcha on signup and login forms
- Disposable email domain detection at registration (block known disposable domains)
- Email verification required before API key generation
- Monitor for bulk fake signups and auto-suspend detected patterns`,
    labels: ["security"],
  },
  {
    title: "[P1] Blog with 5-10 launch content posts targeting SEO",
    body: `**Issue:** No content marketing presence.

**What to build:**
- "How to build a SaaS in 10 minutes" — SEO headline
- "SaaS Generator vs. Vercel templates vs. Bubble" — comparison post
- "How to build an AI writing app" — tutorial
- "Micro-SaaS teardown: what works in 2026" — case study
- "Top 10 niches for micro-SaaS in 2026" — niche research post
- RSS feed + sitemap.xml`,
    labels: ["content", "growth"],
  },
  {
    title: "[P1] User settings — profile, security (2FA), billing, API keys (fully functional)",
    body: `**Issue:** Settings page exists but is not fully functional.

**What to build:**
- Profile: avatar upload with crop/resize, name, bio, timezone (auto-detect)
- Security: password change form, TOTP 2FA setup (QR code + verification), active sessions list + revoke, "Sign out all devices"
- Billing: current plan card, usage meter, invoice history with download, upgrade/downgrade CTA
- API keys: create named key, copy-to-clipboard, revoke with confirmation`,
    labels: ["enhancement"],
  },
  {
    title: "[P1] Interactive product tour — 4-6 step tooltip walkthrough on first login",
    body: `**Issue:** New users do not know what to do after signing up.

**What to build:**
- 4-6 step guided tour using tooltips/highlights on key UI elements
- Progress bar at top showing step X of Y
- Skip option on each step
- "Resume on next login" if user closes mid-tour
- Steps: pick niche → review ideas → customize → deploy → invite team`,
    labels: ["enhancement"],
  },
  {
    title: "[P1] Mobile-responsive dashboard + bottom tab navigation",
    body: `**Issue:** Dashboard is not mobile-friendly.

**What to build:**
- Projects grid collapses to single column on mobile
- Side nav becomes hamburger menu on mobile
- Bottom tab bar on mobile: Dashboard, Projects, Create (+), Notifications, Profile
- Full-width cards with swipeable actions on mobile
- Mobile push notifications (opt-in after first in-app notification)`,
    labels: ["mobile"],
  },

  // P2 — FIRST QUARTER
  {
    title: "[P2] Interactive onboarding video (60-90 sec) on landing + dashboard",
    body: `Embeddable walkthrough video on landing page and inside dashboard. Covers: pick niche → generate → deploy. 60-90 seconds, screen recording with voiceover. Target: visual learners and first-time visitors.`,
    labels: ["content", "growth"],
  },
  {
    title: "[P2] Template marketplace — community template submissions with revenue share",
    body: `Let users submit their SaaS as a community template. Review + publish flow. Template authors earn revenue share (e.g., 30%). Creates ecosystem, content loop, and viral distribution of good templates.`,
    labels: ["growth", "marketplace"],
  },
  {
    title: "[P2] GraphQL API alongside REST for flexible querying",
    body: `Offer GraphQL endpoint for flexible querying. Schema auto-generated from REST models. Enables complex data fetching for advanced users and mobile apps. Reduces over-fetching on mobile.`,
    labels: ["api"],
  },
  {
    title: "[P2] DDoS protection — Cloudflare integration at edge",
    body: `Use Cloudflare for DDoS mitigation at edge. Configure rate rules for common attack patterns. Geo-blocking for non-target markets. Traffic analysis for anomaly detection with automatic alerting.`,
    labels: ["security"],
  },
  {
    title: "[P2] White-label option for generated SaaS — remove branding on Pro+ plans",
    body: `Allow removing "Built with SaaS Generator" badge on Pro+ plans. Custom domain branding with custom email sender. API key: WHITELABEL=true removes all tool badges and footer links from generated SaaS.`,
    labels: ["generated-app", "billing"],
  },
  {
    title: "[P2] Native iOS/Android app with biometric login + offline mode",
    body: `Dedicated mobile apps (React Native or Flutter) with biometric login (Face ID / fingerprint). Offline mode for viewing recent projects. Background sync for build status updates. Push notifications for build completions.`,
    labels: ["mobile"],
  },
  {
    title: "[P2] Compliance readiness — SOC2 Type II preparation + GDPR data handling",
    body: `If serving EU users: DPA agreements, right to deletion (GDPR), data residency options. Prepare for SOC2 Type II audit: evidence collection, access reviews, change management logging. CCPA compliance for California users.`,
    labels: ["security", "legal"],
  },
  {
    title: "[P2] Programmatic SEO — auto-generated niche landing pages for each template",
    body: `Auto-generated pages targeting "How to build [X] in [Y minutes]" queries. Each page targets one niche with template details, demo screenshot, feature list, and CTA. Build programmatically from template metadata at deploy time.`,
    labels: ["content", "growth"],
  },
  {
    title: "[P2] Revenue analytics dashboard — MRR, churn, LTV, CAC by cohort",
    body: `MRR tracking, churn rate by cohort, LTV by acquisition channel, CAC by campaign. Weekly team review dashboard. Built in Metabase or custom with Stripe + DB data. Export to CSV.`,
    labels: ["analytics", "billing"],
  },
  {
    title: "[P2] Community Discord — official workspace for users to share projects and get help",
    body: `Official community for users to share projects, get help, and network. Organic growth channel + feedback loop. Channel structure: #introductions, #showcase, #help, #feedback, #feature-requests. Bot integration for build status notifications.`,
    labels: ["community", "growth"],
  },
  {
    title: "[P2] Twitter/X auto-tweet on deploy — optional, per-project opt-in",
    body: `Optional: automatically tweet when a project is deployed. "Just launched [SaaS Name] using @SaaSGenerator 🚀 [link]". Requires Twitter OAuth connection. User opts in per-project. Good for viral sharing of new launches.`,
    labels: ["social", "growth"],
  },
  {
    title: "[P2] Team management — invite teammates by email with role-based permissions",
    body: `Invite teammates by email with role selector (Admin, Editor, Viewer). Pending invitations list with resend/cancel options. Role permissions matrix visible to admins. Bulk invite via CSV upload.`,
    labels: ["enhancement"],
  },
  {
    title: "[P2] Custom domain setup UI for generated SaaS — CNAME, SSL, status indicator",
    body: `Input field for custom domain in project settings. CNAME / A record instructions shown dynamically based on DNS provider. SSL provisioning via Let's Encrypt (automatic). Status indicator: "Checking DNS..." → "Verified" → "Error: CNAME not found". Fallback to platform subdomain.`,
    labels: ["generated-app"],
  },
  {
    title: "[P2] Cohort analysis — week 1 retention, paid conversion predictors by cohort",
    body: `Track activation rate by cohort (signup week/month). Identify what predicts paid conversion (signup source, first template used, time to first deploy). Drop-off analysis at each funnel step. Built in PostHog or Metabase with auto-refresh.`,
    labels: ["analytics"],
  },
  {
    title: "[P2] Webhook delivery reliability — outbound retry queue with dead letter queue",
    body: `Implement persistent outbound webhook queue (Redis or Inngest) with exponential backoff. Dead letter queue after max retries (5 attempts). Webhook delivery logs visible to customer in dashboard: status, HTTP response code, full request/response payload.`,
    labels: ["api", "reliability"],
  },
  {
    title: "[P2] Email deliverability — SPF/DKIM/DMARC setup for production sending domain",
    body: `Implement SPF, DKIM, DMARC records for sending domain. Use Resend with proper DNS setup for production. Preheader and subject line best practices. Bounce and complaint handling via webhook. Monitor deliverability via seed list.`,
    labels: ["notifications"],
  },
  {
    title: "[P2] Graceful shutdown + zero-downtime deployments",
    body: `Handle SIGTERM correctly: drain connections, finish in-flight requests, stop accepting new. Use rolling deployments (no blue-green flash). Health check endpoint for load balancer verification. Database migration strategy: backward-compatible migrations only.`,
    labels: ["security"],
  },
  {
    title: "[P2] Database backups + point-in-time recovery (PITR) + quarterly restore tests",
    body: `Automated daily snapshots + PITR for PostgreSQL (Supabase). Store backups in separate region/account. Test restore procedure quarterly. Document RTO/RPO targets. Separate read replica credentials for analytics queries.`,
    labels: ["security"],
  },
  {
    title: "[P2] Uptime SLA + status page + incident post-mortems",
    body: `Publish status page (Better Stack or Statuscake). Define SLA (99.9% uptime = ~8.7h downtime/year). Public incident post-mortems for any outage > 30 minutes. Dedicated status page URL (status.saasgenerator.dev).`,
    labels: ["security"],
  },
  {
    title: "[P2] SSO/SAML configuration for enterprise customers",
    body: `SSO provider selection: Google, GitHub, Microsoft, Okta. SAML metadata upload / entity ID / ACS URL display. "Require SSO login" admin toggle for organization. SCIM provisioning for user lifecycle management.`,
    labels: ["auth", "enterprise"],
  },
  {
    title: "[P2] API versioning + deprecation policy",
    body: `Version API from day one (/v1/). Communicate deprecation via Sunset header and changelog entry. Minimum 6-month deprecation window before removal. Maintain older versions during transition. Auto-generated SDKs per version.`,
    labels: ["api"],
  },
];

async function createIssue(title, body, labels) {
  if (DRY_RUN) {
    console.log(`[DRY RUN] Would create: ${title}`);
    return;
  }
  const labelArgs = labels.map((l) => `-l "${l}"`).join(" ");
  const bodyEscaped = body.replace(/"/g, '\\"').replace(/\n/g, '\\n');
  try {
    const result = execSync(
      `gh issue create --repo ${REPO} --title "${title}" --body "${bodyEscaped}" ${labelArgs}`,
      { encoding: "utf-8" }
    );
    console.log(`✅ ${title}`);
    console.log(`   ${result.trim()}`);
  } catch (err) {
    console.error(`❌ Failed: ${title}`);
    console.error(`   ${err.message}`);
  }
}

async function main() {
  console.log(`\n${DRY_RUN ? "[DRY RUN] " : ""}Creating ${ISSUES.length} roadmap issues...\n`);

  for (const issue of ISSUES) {
    await createIssue(issue.title, issue.body, issue.labels);
    await new Promise((r) => setTimeout(r, 500)); // Avoid rate limiting
  }

  console.log(`\n${DRY_RUN ? "[DRY RUN] " : ""}Done! ${ISSUES.length} issues processed.\n`);
}

main().catch(console.error);
