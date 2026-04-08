"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StatsHeader } from "@/components/dashboard/stats-header";
import { ProjectCard, type ProjectCardData } from "@/components/dashboard/project-card";
import { NewProjectSheet } from "@/components/dashboard/new-project-sheet";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardContent() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setSheetOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProjects(data.projects ?? []);
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
        <NewProjectSheet
          open={sheetOpen}
          onOpenChange={(v) => setSheetOpen(v)}
        />
      </div>

      <StatsHeader projects={projects} />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <Skeleton className="h-4 w-32 bg-zinc-800" />
              <Skeleton className="h-3 w-48 bg-zinc-800" />
              <Skeleton className="h-1.5 w-full bg-zinc-800" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState onCreateProject={() => setSheetOpen(true)} />
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

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="space-y-4"><Skeleton className="h-8 w-48 bg-zinc-800" /><Skeleton className="h-40 w-full bg-zinc-800" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
