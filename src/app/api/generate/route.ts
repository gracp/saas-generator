import { NextResponse } from "next/server";
import {
  initializeProject,
  researchAndGenerateIdeas,
} from "@/lib/orchestrator";
import { getAllProjects } from "@/lib/projects";

// POST /api/generate — start a new SaaS project
// NOTE: This is a long-running operation (research + idea generation).
// It can take 1-3 minutes. Clients should set a long timeout.
export async function POST(request: Request) {
  // 5-minute timeout for the full generation pipeline
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5 * 60 * 1000);

  try {
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

// GET /api/generate — list all projects
export async function GET() {
  const projects = getAllProjects();
  return NextResponse.json({ success: true, projects });
}
