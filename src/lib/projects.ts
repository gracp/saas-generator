/**
 * Project state machine — tracks SaaS projects through the generate → launch pipeline
 */

// ─── Types ───────────────────────────────────────────────

// Validate CUID format (Prisma default ID format)
// CUIDs are 25 characters, start with "c" or "cl", alphanumeric
export function isValidCuid(id: string): boolean {
  return /^c[lo]_?[a-z0-9]{24}$/.test(id) || /^cl[a-z0-9]{20}$/.test(id);
}

export type ProjectStatus =
  | "idle"
  | "researching"
  | "generating_ideas"
  | "selecting"
  | "building"
  | "reviewing"
  | "deploying"
  | "live";

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  idle: "Not Started",
  researching: "🔍 Researching",
  generating_ideas: "💡 Generating Ideas",
  selecting: "👆 Awaiting Selection",
  building: "🔨 Building",
  reviewing: "📋 Reviewing",
  deploying: "🚀 Deploying",
  live: "✅ Live",
};

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  idle: "zinc",
  researching: "blue",
  generating_ideas: "violet",
  selecting: "amber",
  building: "orange",
  reviewing: "cyan",
  deploying: "emerald",
  live: "green",
};

// State machine transitions — only these transitions are valid
const TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  idle: ["researching"],
  researching: ["generating_ideas", "idle"],
  generating_ideas: ["selecting", "idle"],
  selecting: ["building", "generating_ideas"],
  building: ["reviewing", "building"], // can stay in building while agents work
  reviewing: ["building", "deploying"], // send back for fixes, or proceed
  deploying: ["live", "reviewing"], // launch or roll back
  live: ["deploying"], // can re-deploy
};

export interface SaaSProject {
  id: string;
  name: string;
  userId?: string;
  status: ProjectStatus;
  niche?: string;
  selectedIdea?: GeneratedIdea;
  researchData?: ResearchResult;
  ideas?: GeneratedIdea[];
  githubRepo?: string;
  vercelUrl?: string;
  branchProtectionEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
  events: ProjectEvent[];
}

export interface ProjectEvent {
  timestamp: string;
  status: ProjectStatus;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

export interface ResearchResult {
  niche: string;
  demandScore: number;
  competitionScore: number;
  monetizationScore: number;
  painPoints: string[];
  similarProducts: string[];
  suggestedFeatures: string[];
  pricingSuggestion: string;
}

export interface GeneratedIdea {
  name: string;
  tagline: string;
  targetUser: string;
  coreFeature: string;
  monetization: string;
  mvpScope: string[];
  domainAvailable: boolean;
  validationScore: number;
}

// ─── In-memory store (swap for DB later) ────────────────

const projects: Map<string, SaaSProject> = new Map();

export function createProject(name: string): SaaSProject {
  const project: SaaSProject = {
    id: crypto.randomUUID(),
    name,
    status: "idle",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    events: [
      {
        timestamp: new Date().toISOString(),
        status: "idle",
        message: "Project created",
        type: "info",
      },
    ],
  };
  projects.set(project.id, project);
  return project;
}

export function getProject(id: string): SaaSProject | undefined {
  return projects.get(id);
}

export function getAllProjects(): SaaSProject[] {
  return Array.from(projects.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function transitionStatus(
  projectId: string,
  newStatus: ProjectStatus,
  message: string,
  eventType: ProjectEvent["type"] = "info"
): SaaSProject | null {
  const project = projects.get(projectId);
  if (!project) return null;

  const allowed = TRANSITIONS[project.status];
  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Invalid transition: ${project.status} → ${newStatus}. Allowed: ${allowed.join(", ")}`
    );
  }

  project.status = newStatus;
  project.updatedAt = new Date().toISOString();
  project.events.push({
    timestamp: new Date().toISOString(),
    status: newStatus,
    message,
    type: eventType,
  });

  projects.set(projectId, project);
  return project;
}

export function addEvent(
  projectId: string,
  message: string,
  eventType: ProjectEvent["type"] = "info"
): void {
  const project = projects.get(projectId);
  if (!project) return;
  project.updatedAt = new Date().toISOString();
  project.events.push({
    timestamp: new Date().toISOString(),
    status: project.status,
    message,
    type: eventType,
  });
  projects.set(projectId, project);
}

export function updateProject(
  projectId: string,
  updates: Partial<SaaSProject>
): SaaSProject | null {
  const project = projects.get(projectId);
  if (!project) return null;
  Object.assign(project, updates, { updatedAt: new Date().toISOString() });
  projects.set(projectId, project);
  return project;
}

export function deleteProject(projectId: string): boolean {
  return projects.delete(projectId);
}
