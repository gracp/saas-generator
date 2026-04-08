import { NextResponse } from "next/server";
import { getAllProjects } from "@/lib/projects";

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