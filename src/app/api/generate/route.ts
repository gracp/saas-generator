import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  initializeProject,
  researchAndGenerateIdeas,
} from "@/lib/orchestrator";
import { getAllProjects } from "@/lib/projects";

// POST /api/generate — start a new SaaS project
// NOTE: This is a long-running operation (research + idea generation).
// It can take 1-3 minutes. Clients should set a long timeout.
export async function POST(request: Request) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5 * 60 * 1000);

  try {
    const session = await getServerSession(authOptions);
    // Get userId from session (system placeholder if not authed yet)
    const userId = (session?.user as { id?: string })?.id ?? undefined;

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
      userId,
    });

    // Step 2: Research + generate ideas
    const { research, ideas } = await researchAndGenerateIdeas(
      result.project.id,
      niche
    );

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
