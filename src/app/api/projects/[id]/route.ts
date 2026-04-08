import { NextResponse } from "next/server";
import { getProject } from "@/lib/projects";
import { selectIdeaAndBuild, deployProject } from "@/lib/orchestrator";

// GET /api/projects/[id] — get a single project
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const project = getProject(params.id);
  if (!project) {
    return NextResponse.json(
      { success: false, error: "Project not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, project });
}

// POST /api/projects/[id] — actions on a project (select-idea, deploy)
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
      { success: false, error: "Unknown action. Use 'select-idea' or 'deploy'." },
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