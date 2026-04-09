import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getAllProjects } from '@/lib/projects';
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';

// GET /api/projects — list all projects (scoped to authenticated user)
export async function GET(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit({ key: `projects:${ip}`, ...RATE_LIMITS.api });
  if (!limited.ok) {
    return NextResponse.json(
      { success: false, error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } }
    );
  }

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;

  let projects = getAllProjects();

  // Data isolation: only return projects belonging to the authenticated user
  if (userId) {
    projects = projects.filter((p) => !p.userId || p.userId === userId);
  }

  const mapped = projects.map((p) => ({
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
  return NextResponse.json({ success: true, projects: mapped });
}
