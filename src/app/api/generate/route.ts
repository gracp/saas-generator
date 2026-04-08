import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  initializeProject,
  researchAndGenerateIdeas,
} from "@/lib/orchestrator";
import { getAllProjects } from "@/lib/projects";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

// Server-side analytics tracking (log only, PostHog not available server-side)
function trackProjectCreated(projectId: string, niche?: string) {
  console.log("[Analytics] project_created", { projectId, niche });
}

// POST /api/generate — start a new SaaS project
// NOTE: This is a long-running operation (research + idea generation).
// It can take 1-3 minutes. Clients should set a long timeout.
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id ?? ip;
  const limited = rateLimit({ key: `generate:${userId}`, ...RATE_LIMITS.generate });
  if (!limited.ok) {
    return NextResponse.json(
      { success: false, error: "Too many generation requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter), "X-RateLimit-Remaining": "0" } }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5 * 60 * 1000);

  try {
    // Get userId from session (system placeholder if not authed yet)
    const uid = (session?.user as { id?: string })?.id ?? undefined;

    const body = await request.json();
    const { projectName, niche, description } = body;

    if (!projectName || typeof projectName !== "string") {
      return NextResponse.json(
        { success: false, error: "projectName is required" },
        { status: 400 }
      );
    }

    // Step 1: Create repo + issues
    const result = await initializeProject({
      projectName,
      niche,
      description,
      userId: uid,
    });

    // Step 2: Research + generate ideas
    const { research, ideas } = await researchAndGenerateIdeas(
      result.project.id,
      niche
    );

    // Track project created
    trackProjectCreated(result.project.id, niche);

    return NextResponse.json({
      success: true,
      project: result.project,
      repo: result.repo,
      issues: result.issues,
      research,
      ideas,
    });
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { success: false, error: "Generation timed out after 5 minutes. Try again or reduce the niche scope." },
        { status: 504 }
      );
    }
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeout);
  }
}

// GET /api/generate — list all projects (for in-memory fallback)
export async function GET() {
  const projects = getAllProjects();
  return NextResponse.json({ success: true, projects });
}
