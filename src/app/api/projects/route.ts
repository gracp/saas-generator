import { NextResponse } from "next/server";
import { getAllProjects } from "@/lib/projects";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

// GET /api/projects — list all projects
export async function GET(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit({ key: `projects:${ip}`, ...RATE_LIMITS.api });
  if (!limited.ok) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }
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