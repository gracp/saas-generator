'use client';

import { Rocket, ExternalLink, GitBranch, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ProjectCardData } from '@/components/dashboard/project-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function LaunchPadPage() {
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProjects(data.projects ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const liveProjects = projects.filter((p) => p.status === 'live');

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 bg-zinc-800" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-40 bg-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Launch Pad</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Your deployed SaaS products — live and ready for users.
        </p>
      </div>

      {liveProjects.length === 0 ? (
        <div className="text-center py-20">
          <Rocket className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 text-sm mb-2">No live projects yet</p>
          <p className="text-zinc-600 text-xs mb-6">Generate and build a project to see it here</p>
          <Link href="/dashboard">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              Go to Projects
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {liveProjects.map((project) => (
            <Card key={project.id} className="bg-zinc-900 border-zinc-800 overflow-hidden">
              <CardContent className="p-0">
                {/* Mock banner */}
                <div className="h-24 bg-gradient-to-r from-violet-600/20 to-emerald-600/20 flex items-center justify-center">
                  <Rocket className="h-10 w-10 text-emerald-400" />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-zinc-100 truncate">{project.name}</h3>
                      {project.selectedIdea?.tagline && (
                        <p className="text-xs text-zinc-500 mt-0.5 truncate">
                          {project.selectedIdea.tagline}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    {project.vercelUrl ? (
                      <a
                        href={project.vercelUrl}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View Live
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-500 text-xs">
                        No URL yet
                      </span>
                    )}
                    {project.githubRepo && (
                      <a
                        href={project.githubRepo}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 text-xs transition-colors"
                      >
                        <GitBranch className="h-3.5 w-3.5" />
                        GitHub
                      </a>
                    )}
                    <Link
                      href={`/dashboard/${project.id}`}
                      className="ml-auto inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      Manage
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {liveProjects.length > 0 && (
        <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center">
          <p className="text-zinc-500 text-sm">Ready to launch another?</p>
          <Link href="/dashboard" className="inline-block mt-3">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              <Rocket className="h-4 w-4 mr-2" />
              Generate New SaaS
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
