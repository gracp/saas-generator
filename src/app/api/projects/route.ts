import { NextResponse } from "next/server";
import { getProject, getAllProjects, updateProject } from "@/lib/projects";
import {
  selectIdeaAndBuild,
  deployProject,
} from "@/lib/orchestrator";

// GET /api/projects — list all projects
export async function GET() {
  const projects = getAllProjects().map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    niche: p.niche,
    selectedIdea: p.selectedIdea
      ? { name: p.selectedIdea.name, tagline: p.selectedIdea.tagline }
      : null,
    githubRepo: p.githubRepo,
    vercelUrl: p.vercelUrl,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    eventCount: p.events.length,
  }));
  return NextResponse.json({ success: true, projects });
}

// POST /api/projects/:id/select-idea — pick an idea and start building
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { ideaIndex, action } = body;

    const project = getProject(params.id);
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    if (action === "select-idea") {
      if (typeof ideaIndex !== "number") {
        return NextResponse.json(
          { success: false, error: "ideaIndex is required" },
          { status: 400 }
        );
      }
      const result = await selectIdeaAndBuild(params.id, ideaIndex);
      return NextResponse.json({
        success: true,
        project: getProject(params.id),
        worktrees: result.worktrees,
      });
    }

    if (action === "deploy") {
      const result = await deployProject(params.id);
      return NextResponse.json({
        success: true,
        project: getProject(params.id),
        url: result.url,
      });
    }

    return NextResponse.json(
      { success: false, error: "Unknown action" },
      { status: 400 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Operation failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
