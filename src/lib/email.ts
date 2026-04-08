import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM ?? "SaaS Generator <hello@resend.dev>";

const isDev = process.env.NODE_ENV === "development";

// ─── Send Build Started Email ───────────────────────────
export async function sendBuildStartedEmail({
  to,
  projectName,
  ideaName,
  dashboardUrl,
}: {
  to: string;
  projectName: string;
  ideaName: string;
  dashboardUrl: string;
}) {
  if (!resend) {
    console.log("[Email] RESEND_API_KEY not set — skipping build-started email to", to);
    return;
  }
  try {
    await resend.emails.send({
      from: FROM,
      to: isDev ? "delivered@resend.dev" : to,
      subject: `🚀 ${projectName} — Build started!`,
      html: buildStartedEmail({ projectName, ideaName, dashboardUrl }),
    });
  } catch (err) {
    console.error("[Email] Failed to send build-started email:", err);
  }
}

// ─── Send Deploy Complete Email ───────────────────────
export async function sendDeployCompleteEmail({
  to,
  projectName,
  ideaName,
  vercelUrl,
  githubUrl,
  dashboardUrl,
}: {
  to: string;
  projectName: string;
  ideaName: string;
  vercelUrl: string;
  githubUrl: string;
  dashboardUrl: string;
}) {
  if (!resend) {
    console.log("[Email] RESEND_API_KEY not set — skipping deploy-complete email to", to);
    return;
  }
  try {
    await resend.emails.send({
      from: FROM,
      to: isDev ? "delivered@resend.dev" : to,
      subject: `🎉 ${projectName} is LIVE!`,
      html: deployCompleteEmail({ projectName, ideaName, vercelUrl, githubUrl, dashboardUrl }),
    });
  } catch (err) {
    console.error("[Email] Failed to send deploy-complete email:", err);
  }
}

// ─── Email Templates ────────────────────────────────────
function buildStartedEmail({
  projectName,
  ideaName,
  dashboardUrl,
}: {
  projectName: string;
  ideaName: string;
  dashboardUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset=\"utf-8\">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #09090b; color: #fafafa; margin: 0; padding: 40px 20px; }
    .container { max-width: 560px; margin: 0 auto; }
    .logo { font-size: 20px; font-weight: bold; color: #a78bfa; margin-bottom: 32px; }
    h1 { font-size: 24px; font-weight: 700; margin: 0 0 16px; color: #fafafa; }
    p { font-size: 15px; line-height: 1.6; color: #a1a1aa; margin: 0 0 16px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; background: rgba(139, 92, 246, 0.15); color: #a78bfa; margin-bottom: 24px; }
    .btn { display: inline-block; padding: 12px 24px; border-radius: 8px; background: #7c3aed; color: white; font-weight: 600; font-size: 14px; text-decoration: none; margin-top: 8px; }
    .footer { margin-top: 40px; font-size: 12px; color: #52525b; }
  </style>
</head>
<body>
  <div class=\"container\">
    <div class=\"logo\">⚡ SaaS Generator</div>
    <span class=\"badge\">Build Started</span>
    <h1>Your SaaS is being built right now</h1>
    <p><strong style=\"color:#fafafa\">${projectName}</strong> — powered by <strong style=\"color:#fafafa\">${ideaName}</strong> — is now being built by specialist AI agents.</p>
    <p>Our agents are working in parallel on: project scaffolding, a landing page, Stripe billing, and your core feature. This typically takes 2-3 minutes.</p>
    <p>We'll email you again when your app is live and deployed!</p>
    <a href=\"${dashboardUrl}\" class=\"btn\">Track Progress →</a>
    <div class=\"footer\">SaaS Generator — From idea to launch in minutes.</div>
  </div>
</body>
</html>
  `;
}

function deployCompleteEmail({
  projectName,
  ideaName,
  vercelUrl,
  githubUrl,
  dashboardUrl,
}: {
  projectName: string;
  ideaName: string;
  vercelUrl: string;
  githubUrl: string;
  dashboardUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset=\"utf-8\">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #09090b; color: #fafafa; margin: 0; padding: 40px 20px; }
    .container { max-width: 560px; margin: 0 auto; }
    .logo { font-size: 20px; font-weight: bold; color: #a78bfa; margin-bottom: 32px; }
    h1 { font-size: 24px; font-weight: 700; margin: 0 0 16px; color: #fafafa; }
    p { font-size: 15px; line-height: 1.6; color: #a1a1aa; margin: 0 0 16px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; background: rgba(34, 197, 94, 0.15); color: #22c55e; margin-bottom: 24px; }
    .hero-btn { display: inline-block; padding: 14px 28px; border-radius: 8px; background: #7c3aed; color: white; font-weight: 700; font-size: 16px; text-decoration: none; margin: 8px 0; }
    .secondary-btn { display: inline-block; padding: 12px 24px; border-radius: 8px; border: 1px solid #3f3f46; color: #a1a1aa; font-weight: 600; font-size: 14px; text-decoration: none; margin: 8px 8px 8px 0; }
    .footer { margin-top: 40px; font-size: 12px; color: #52525b; }
  </style>
</head>
<body>
  <div class=\"container\">
    <div class=\"logo\">⚡ SaaS Generator</div>
    <span class=\"badge\">🚀 LIVE</span>
    <h1>${projectName} is deployed and ready for customers!</h1>
    <p>Your SaaS — <strong style=\"color:#fafafa\">${ideaName}</strong> — has been built and deployed to Vercel. Here's what you got:</p>
    <p>✅ Next.js 14 app with TypeScript + Tailwind<br>
    ✅ Beautiful landing page<br>
    ✅ Stripe billing (subscriptions + checkout)<br>
    ✅ Authentication (NextAuth.js)<br>
    ✅ PostgreSQL database<br>
    ✅ Your core feature implemented</p>
    <a href=\"${vercelUrl}\" class=\"hero-btn\">🚀 View ${projectName} Live →</a>
    <br>
    <a href=\"${githubUrl}\" class=\"secondary-btn\">View Source on GitHub</a>
    <a href=\"${dashboardUrl}\" class=\"secondary-btn\">Manage in Dashboard</a>
    <div class=\"footer\">SaaS Generator — From idea to launch in minutes. You own 100% of the code.</div>
  </div>
</body>
</html>
  `;
}
