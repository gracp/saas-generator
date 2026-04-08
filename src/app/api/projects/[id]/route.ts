import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProject, deleteProject } from "@/lib/projects";
import { selectIdeaAndBuild, deployProject } from "@/lib/orchestrator";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

// GET /api/projects/[id] — get a single project
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ip = getClientIp(request);
  const limited = rateLimit({ key: `project:${ip}:${params.id}`, ...RATE_LIMITS.api });
  if (!limited.ok) {
    return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });
  }

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;

  const project = getProject(params.id);
  if (!project) {
    return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
  }

  // Data isolation: only owner can access their project
  if (project.userId && userId && project.userId !== userId) {
    return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, project });
}

// POST /api/projects/[id] — actions on a project (select-idea, deploy)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    const body = await request.json();
    const { ideaIndex, action } = body;

    const project = getProject(params.id);
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    // Data isolation: only owner can modify their project
    if (project.userId && userId && project.userId !== userId) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
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

// DELETE /api/projects/[id] — delete a project
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;

  const project = getProject(params.id);
  if (!project) {
    return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
  }

  // Data isolation: only owner can delete their project
  if (project.userId && userId && project.userId !== userId) {
    return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
  }

  const existed = deleteProject(params.id);
  if (!existed) {
    return NextResponse.json(
      { success: false, error: "Project not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true });
}