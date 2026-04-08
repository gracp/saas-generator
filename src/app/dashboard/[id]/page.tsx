"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { ProjectDetail } from "@/components/dashboard/project-detail";
import { GenerationProgress } from "@/components/dashboard/generation-progress";
import type { SaaSProject, ProjectStatus } from "@/lib/projects";
import { Skeleton } from "@/components/ui/skeleton";

const POLL_INTERVAL = 5000; // 5 seconds

// Terminal statuses — stop polling
const TERMINAL = new Set<ProjectStatus>(["idle", "live"]);
// Interactive statuses — stop polling, wait for user
const AWAITING_INPUT = new Set<ProjectStatus>(["selecting"]);
// Show generation progress for these statuses
const ACTIVE_STATUSES = new Set<ProjectStatus>(["researching", "generating_ideas", "building", "deploying"]);

export default function ProjectPage() {
  const params = useParams();
  const id = params?.id as string;
  const [project, setProject] = useState<SaaSProject | null>(null);
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const fetchProject = useCallback(() => {
    if (!id) return;
    fetch(`/api/projects/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProject(data.project);
          const status = data.project.status;
          if (TERMINAL.has(status) || AWAITING_INPUT.has(status)) {
            stopPolling();
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, stopPolling]);

  useEffect(() => {
    if (!id) return;
    fetchProject();
    pollingRef.current = setInterval(fetchProject, POLL_INTERVAL);
    return () => stopPolling();
  }, [id, fetchProject, stopPolling]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 bg-zinc-800" />
        <Skeleton className="h-20 w-full bg-zinc-800" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-64 bg-zinc-800" />
          <Skeleton className="h-64 bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">Project not found</p>
      </div>
    );
  }

  const isActive = ACTIVE_STATUSES.has(project.status);

  return (
    <div className="space-y-6">
      {isActive && (
        <GenerationProgress status={project.status} projectName={project.name} />
      )}
      <ProjectDetail project={project} />
    </div>
  );
}
