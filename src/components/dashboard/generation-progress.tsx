"use client";

import { Loader2, CheckCircle2, Search, Code, Rocket, Globe } from "lucide-react";
import type { ProjectStatus } from "@/lib/projects";

const STEPS = [
  {
    key: "researching",
    label: "Researching market & competitors",
    detail: "Scanning industry trends, competitors, and market gaps using AI...",
    icon: Search,
    estimate: 15,
  },
  {
    key: "generating",
    label: "Generating SaaS ideas",
    detail: "Crafting unique business ideas validated against real market data...",
    icon: Rocket,
    estimate: 10,
  },
  {
    key: "building",
    label: "Building your application",
    detail: "Scaffolding, landing page, auth, billing, and core feature — all in parallel...",
    icon: Code,
    estimate: 60,
  },
  {
    key: "deploying",
    label: "Deploying to Vercel",
    detail: "Building the app, running tests, and going live on your custom Vercel URL...",
    icon: Globe,
    estimate: 30,
  },
];

// Map ProjectStatus to step keys
const STATUS_TO_STEP: Partial<Record<ProjectStatus, string>> = {
  researching: "researching",
  generating_ideas: "generating",
  building: "building",
  deploying: "deploying",
};

const STEP_ORDER = ["researching", "generating", "building", "deploying"] as const;

function getStepIndex(status: ProjectStatus): number {
  const stepKey = STATUS_TO_STEP[status];
  if (!stepKey) return -1;
  return STEP_ORDER.indexOf(stepKey as typeof STEP_ORDER[number]);
}

function getTotalEstimate(status: ProjectStatus): number {
  const currentIdx = getStepIndex(status);
  if (currentIdx < 0) return 0;
  return STEPS.slice(currentIdx).reduce((sum, step) => sum + step.estimate, 0);
}

function getOverallProgress(status: ProjectStatus): number {
  const stepIdx = getStepIndex(status);
  if (stepIdx < 0) return 0;
  // Each step gets 25% of the progress
  return Math.round(((stepIdx + 1) / STEPS.length) * 100);
}

interface GenerationProgressProps {
  status: ProjectStatus;
  projectName: string;
}

export function GenerationProgress({ status, projectName }: GenerationProgressProps) {
  const currentStepIdx = getStepIndex(status);

  // Only show for active generation statuses
  if (currentStepIdx < 0) return null;

  const totalEstimate = getTotalEstimate(status);
  const overallProgress = getOverallProgress(status);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      {/* Progress bar at top */}
      <div className="h-1 bg-zinc-800">
        <div
          className="h-full bg-violet-500 transition-all duration-500 ease-out"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 text-violet-400 animate-spin" />
            <span className="text-sm font-medium text-zinc-200">
              Building {projectName}...
            </span>
          </div>
          <span className="text-xs text-zinc-500">
            ~{totalEstimate}s remaining
          </span>
        </div>

        {/* Step list */}
        <div className="space-y-3">
          {STEPS.map((step, idx) => {
            const isComplete = idx < currentStepIdx;
            const isActive = idx === currentStepIdx;
            const isPending = idx > currentStepIdx;
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className={`
                  flex items-center gap-3 rounded-md p-3 transition-all duration-300
                  ${isActive ? "bg-violet-500/10 border-l-2 border-violet-500" : ""}
                  ${isComplete ? "bg-emerald-500/5" : ""}
                  ${isPending ? "opacity-50" : ""}
                `}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : isActive ? (
                    <div className="relative">
                      <Icon className="h-5 w-5 text-violet-400" />
                      <span className="absolute inset-0 animate-ping opacity-30">
                        <Icon className="h-5 w-5 text-violet-400" />
                      </span>
                    </div>
                  ) : (
                    <Icon className="h-5 w-5 text-zinc-600" />
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <span
                    className={`
                      text-sm block
                      ${isActive ? "text-zinc-100 font-medium" : ""}
                      ${isComplete ? "text-emerald-400" : ""}
                      ${isPending ? "text-zinc-500" : ""}
                    `}
                  >
                    {step.label}
                  </span>
                  {isActive && step.detail && (
                    <span className="text-xs text-zinc-500 block mt-0.5 truncate">
                      {step.detail}
                    </span>
                  )}
                </div>

                {/* Status indicator */}
                {isActive && (
                  <Loader2 className="h-4 w-4 text-violet-400 animate-spin flex-shrink-0" />
                )}
                {isComplete && (
                  <span className="text-[10px] text-emerald-400 font-medium flex-shrink-0">
                    Done
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Completion step */}
        <div
          className={`
            flex items-center gap-3 rounded-md p-3
            ${status === "live" ? "bg-emerald-500/10 border-l-2 border-emerald-500" : "opacity-50"}
          `}
        >
          <div className="flex-shrink-0">
            {status === "live" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-zinc-600" />
            )}
          </div>
          <span
            className={`text-sm flex-1 ${status === "live" ? "text-emerald-400 font-medium" : "text-zinc-500"}`}
          >
            Done! Your SaaS is live
          </span>
          {status === "live" && (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          )}
        </div>
      </div>
    </div>
  );
}
