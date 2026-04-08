"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StatsHeader } from "@/components/dashboard/stats-header";
import { ProjectCard, type ProjectCardData } from "@/components/dashboard/project-card";
import { NewProjectSheet } from "@/components/dashboard/new-project-sheet";
import { EmptyState } from "@/components/dashboard/empty-state";
import { OnboardingWizard } from "@/components/dashboard/onboarding-wizard";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardContentProps {
  onboardingCompleted: boolean;
}

function DashboardContent({ onboardingCompleted }: DashboardContentProps) {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setSheetOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProjects(data.projects ?? []);
          // Show onboarding if user has 0 projects and hasn't completed onboarding
          if ((data.projects ?? []).length === 0 && !onboardingCompleted) {
            setShowOnboarding(true);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [onboardingCompleted]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  return (
    <>
      {showOnboarding && (
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
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
        ) : projects.length === 0 && !showOnboarding ? (
          <EmptyState onCreateProject={() => setSheetOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  // Server-side check for onboarding status - default to true if can't verify
  const [onboardingCompleted, setOnboardingCompleted] = useState(true);
  const [paramsResolved, setParamsResolved] = useState(false);

  useEffect(() => {
    searchParams.then((params) => {
      // If there's an onboarding=complete query param, user completed it
      if (params.onboarding === "complete") {
        setOnboardingCompleted(true);
      }
      setParamsResolved(true);
    });
  }, [searchParams]);

  // Don't render until we resolve the params
  if (!paramsResolved) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 bg-zinc-800" />
        <Skeleton className="h-40 w-full bg-zinc-800" />
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="space-y-4"><Skeleton className="h-8 w-48 bg-zinc-800" /><Skeleton className="h-40 w-full bg-zinc-800" /></div>}>
      <DashboardContent onboardingCompleted={onboardingCompleted} />
    </Suspense>
  );
}
