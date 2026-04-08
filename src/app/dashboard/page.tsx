"use client";

import { useEffect, useState } from "react";
import {
  StatsHeader,
  ProjectCard,
  type ProjectCardData,
} from "@/components/dashboard/project-card";
import { NewProjectSheet } from "@/components/dashboard/new-project-sheet";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/generate")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProjects(data.projects);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Projects</h1>
          <p className="text-xs text-zinc-500">
            Your generated SaaS applications
          </p>
        </div>
        <NewProjectSheet />
      </div>

      <StatsHeader projects={projects} />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <Skeleton className="h-4 w-32 bg-zinc-800" />
              <Skeleton className="h-3 w-48 bg-zinc-800" />
              <Skeleton className="h-1.5 w-full bg-zinc-800" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500 text-sm">
            No projects yet. Click &#34;New Project&#34; to generate your first SaaS.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
