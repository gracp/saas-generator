"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  GitBranch,
  ExternalLink,
  CheckCircle2,
  Circle,
  Loader2,
  Rocket,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import type { SaaSProject, ProjectEvent, ProjectStatus } from "@/lib/projects";
import { STATUS_LABELS } from "@/lib/projects";

const STAGES: { key: ProjectStatus; label: string }[] = [
  { key: "researching", label: "Research" },
  { key: "generating_ideas", label: "Generate Ideas" },
  { key: "selecting", label: "Select" },
  { key: "building", label: "Build" },
  { key: "reviewing", label: "Review" },
  { key: "deploying", label: "Deploy" },
  { key: "live", label: "Live" },
];

const STAGE_ORDER: ProjectStatus[] = [
  "researching",
  "generating_ideas",
  "selecting",
  "building",
  "reviewing",
  "deploying",
  "live",
];

function getStageIndex(status: ProjectStatus): number {
  return STAGE_ORDER.indexOf(status);
}

function StageIndicator({ current }: { current: ProjectStatus }) {
  const currentIdx = getStageIndex(current);

  return (
    <div className="flex items-center gap-2">
      {STAGES.map((stage, i) => {
        const isComplete = i < currentIdx;
        const isCurrent = i === currentIdx;
        const isPending = i > currentIdx;

        return (
          <div key={stage.key} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {isComplete ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : isCurrent ? (
                <Loader2 className="h-4 w-4 text-violet-400 animate-spin" />
              ) : (
                <Circle className="h-4 w-4 text-zinc-700" />
              )}
              <span
                className={`text-[10px] font-medium ${
                  isComplete
                    ? "text-emerald-400"
                    : isCurrent
                      ? "text-violet-400"
                      : "text-zinc-600"
                }`}
              >
                {stage.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div
                className={`h-px w-4 ${i < currentIdx ? "bg-emerald-400/50" : "bg-zinc-800"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function EventTimeline({ events }: { events: ProjectEvent[] }) {
  return (
    <ScrollArea className="h-64">
      <div className="space-y-3">
        {events
          .slice()
          .reverse()
          .map((event, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className={`mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                  event.type === "success"
                    ? "bg-emerald-400"
                    : event.type === "warning"
                      ? "bg-amber-400"
                      : event.type === "error"
                        ? "bg-red-400"
                        : "bg-zinc-600"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-300">{event.message}</p>
                <p className="text-[10px] text-zinc-600">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
      </div>
    </ScrollArea>
  );
}

export function ProjectDetail({ project }: { project: SaaSProject }) {
  const [deploying, setDeploying] = useState(false);

  async function handleSelectIdea(ideaIndex: number) {
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "select-idea", ideaIndex }),
      });
      window.location.reload();
    } catch {
      // handle error
    }
  }

  async function handleDeploy() {
    setDeploying(true);
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deploy" }),
      });
      window.location.reload();
    } catch {
      // handle error
    } finally {
      setDeploying(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-500 hover:text-zinc-100"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">
              {project.name}
            </h1>
            <p className="text-xs text-zinc-500">
              Created {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {project.githubRepo && (
            <a href={project.githubRepo} target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-800 text-zinc-400 hover:text-zinc-100"
              >
                <GitBranch className="h-4 w-4 mr-2" />
                Repo
              </Button>
            </a>
          )}
          {project.vercelUrl && (
            <a href={project.vercelUrl} target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-800 text-zinc-400 hover:text-zinc-100"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Live Site
              </Button>
            </a>
          )}
          {project.status === "selecting" && !project.selectedIdea && (
            <Badge className="bg-amber-500/10 text-amber-400 border-0">
              Pick an idea below
            </Badge>
          )}
        </div>
      </div>

      {/* Pipeline Stage */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-zinc-400">Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <StageIndicator current={project.status} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Research Data */}
          {project.researchData && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-400">
                  Market Research
                </CardTitle>
                <CardDescription className="text-zinc-600">
                  {project.researchData.niche}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      label: "Demand",
                      score: project.researchData.demandScore,
                      color: "text-emerald-400",
                    },
                    {
                      label: "Competition",
                      score: project.researchData.competitionScore,
                      color: "text-amber-400",
                    },
                    {
                      label: "Monetization",
                      score: project.researchData.monetizationScore,
                      color: "text-violet-400",
                    },
                  ].map((metric) => (
                    <div key={metric.label} className="text-center">
                      <p className={`text-lg font-bold ${metric.color}`}>
                        {metric.score}
                      </p>
                      <p className="text-[10px] text-zinc-600">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>
                <Separator className="bg-zinc-800" />
                <div>
                  <p className="text-[10px] font-medium text-zinc-500 mb-2">
                    Pain Points
                  </p>
                  <ul className="space-y-1">
                    {project.researchData.painPoints.map((point, i) => (
                      <li
                        key={i}
                        className="text-xs text-zinc-400 flex items-start gap-2"
                      >
                        <span className="text-zinc-600 mt-0.5">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generated Ideas */}
          {project.ideas && project.ideas.length > 0 && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Generated Ideas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.ideas.map((idea, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border p-4 transition-colors ${
                      project.selectedIdea?.name === idea.name
                        ? "border-violet-500 bg-violet-500/5"
                        : "border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-zinc-100">
                          {idea.name}
                        </p>
                        <p className="text-xs text-zinc-500">{idea.tagline}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] border-0 ${
                          idea.validationScore >= 80
                            ? "bg-emerald-500/10 text-emerald-400"
                            : idea.validationScore >= 60
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {idea.validationScore}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-zinc-500 mb-3">
                      {idea.coreFeature}
                    </p>
                    <div className="flex items-center gap-2">
                      {project.status === "selecting" &&
                        !project.selectedIdea && (
                          <Button
                            size="sm"
                            className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-7"
                            onClick={() => handleSelectIdea(i)}
                          >
                            Select & Build
                          </Button>
                        )}
                      {project.selectedIdea?.name === idea.name && (
                        <Badge className="bg-violet-500/10 text-violet-400 border-0">
                          ✓ Selected
                        </Badge>
                      )}
                      <span className="text-[10px] text-zinc-600">
                        {idea.domainAvailable
                          ? "✓ Domain available"
                          : "✗ Domain taken"}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Event Timeline */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm text-zinc-400">
                Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EventTimeline events={project.events} />
            </CardContent>
          </Card>

          {/* Deploy button */}
          {(project.status === "reviewing" || project.status === "building") &&
            project.selectedIdea && (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-6">
                  <Button
                    onClick={handleDeploy}
                    disabled={deploying}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {deploying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deploying...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Deploy to Vercel
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
        </div>
      </div>
    </div>
  );
}
