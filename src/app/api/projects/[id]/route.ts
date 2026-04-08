import { NextResponse } from "next/server";
import { getProject } from "@/lib/projects";

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
