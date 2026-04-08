"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProjectDetail } from "@/components/dashboard/project-detail";
import type { SaaSProject } from "@/lib/projects";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectPage() {
  const params = useParams();
  const id = params?.id as string;
  const [project, setProject] = useState<SaaSProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/projects/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProject(data.project);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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
