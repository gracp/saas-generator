import { NextResponse } from "next/server";
import {
  initializeProject,
  researchAndGenerateIdeas,
  selectIdeaAndBuild,
  deployProject,
} from "@/lib/orchestrator";
import { getAllProjects, getProject } from "@/lib/projects";

// POST /api/generate — start a new SaaS project
export async function POST(request: Request) {
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
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// GET /api/generate — list all projects
export async function GET() {
  const projects = getAllProjects();
  return NextResponse.json({ success: true, projects });
}
