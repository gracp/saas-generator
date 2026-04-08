"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { ProjectDetail } from "@/components/dashboard/project-detail";
import type { SaaSProject } from "@/lib/projects";
import { Skeleton } from "@/components/ui/skeleton";

const POLL_INTERVAL = 5000; // 5 seconds

// Terminal statuses — stop polling
const TERMINAL = new Set(["idle", "live"]);
// Interactive statuses — stop polling, wait for user
const AWAITING_INPUT = new Set(["selecting"]);

export default function ProjectPage() {
  const params = useParams();
  const id = params?.id as string;
  const [project, setProject] = useState<SaaSProject | null>(null);
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }

  function fetchProject() {
    if (!id) return;
    fetch(`/api/projects/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProject(data.project);
          const status = data.project.status;
          // Stop polling on terminal or user-input statuses
          if (TERMINAL.has(status) || AWAITING_INPUT.has(status)) {
            stopPolling();
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!id) return;
    fetchProject(); // Initial fetch

    // Start polling
    pollingRef.current = setInterval(fetchProject, POLL_INTERVAL);

    return () => stopPolling();
  }, [id]);

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

  return <ProjectDetail project={project} />;
}
