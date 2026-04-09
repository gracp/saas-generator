import { FolderKanban, Rocket, Wrench, ExternalLink, GitBranch } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { ProjectStatus } from '@/lib/projects';
import { STATUS_LABELS } from '@/lib/projects';

const STATUS_COLORS: Record<ProjectStatus, string> = {
  idle: 'bg-zinc-500',
  researching: 'bg-blue-500',
  generating_ideas: 'bg-violet-500',
  selecting: 'bg-amber-500',
  building: 'bg-orange-500',
  reviewing: 'bg-cyan-500',
  deploying: 'bg-emerald-500',
  live: 'bg-green-500',
};

const PROGRESS_MAP: Record<ProjectStatus, number> = {
  idle: 0,
  researching: 14,
  generating_ideas: 28,
  selecting: 42,
  building: 56,
  reviewing: 70,
  deploying: 85,
  live: 100,
};

export interface ProjectCardData {
  id: string;
  name: string;
  status: ProjectStatus;
  selectedIdea?: { name: string; tagline: string } | null;
  githubRepo?: string;
  vercelUrl?: string;
  createdAt: string;
  updatedAt: string;
  eventCount: number;
}

export function ProjectCard({ project }: { project: ProjectCardData }) {
  const progress = PROGRESS_MAP[project.status];

  return (
    <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-2 w-2 rounded-full ${STATUS_COLORS[project.status]} ${project.status === 'live' ? 'animate-pulse' : ''}`}
            />
            <CardTitle className="text-base text-zinc-100">{project.name}</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-[10px] border-0">
            {STATUS_LABELS[project.status]}
          </Badge>
        </div>
        {project.selectedIdea && (
          <CardDescription className="text-zinc-500 text-xs mt-1">
            {project.selectedIdea.tagline}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>Pipeline progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1 bg-zinc-800" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {project.githubRepo && (
              <a
                href={project.githubRepo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <GitBranch className="h-3.5 w-3.5" />
              </a>
            )}
            {project.vercelUrl && (
              <a
                href={project.vercelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          <Link href={`/dashboard/${project.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-500 hover:text-zinc-100 text-xs h-7"
            >
              View Details →
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsHeader({ projects }: { projects: ProjectCardData[] }) {
  const total = projects.length;
  const live = projects.filter((p) => p.status === 'live').length;
  const building = projects.filter((p) => ['building', 'reviewing'].includes(p.status)).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-zinc-500">Total Projects</CardTitle>
          <FolderKanban className="h-4 w-4 text-zinc-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-100">{total}</div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-zinc-500">Building</CardTitle>
          <Wrench className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-100">{building}</div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-zinc-500">Live</CardTitle>
          <Rocket className="h-4 w-4 text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-100">{live}</div>
        </CardContent>
      </Card>
    </div>
  );
}
