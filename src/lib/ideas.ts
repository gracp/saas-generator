/**
 * Idea Generator — creates validated SaaS concepts from research data
 *
 * Uses combinatorial creativity + scoring heuristics to generate
 * diverse, differentiated SaaS names, taglines, and feature sets.
 * No external LLM required — pure algorithmic generation.
 */

import type { GeneratedIdea } from "./projects";

// ─── Name Parts Library ─────────────────────────────────

const NOUNS = [
  "Pilot", "Hub", "Flow", "Desk", "Box", "Kit", "Mate", "Suite",
  "Base", "Forge", "Beam", "Dock", "Link", "Grid", "Node", "Pulse",
  "Shift", "Stack", "Loop", "Core", "Edge", "Port", "Axis", "Core",
];

const ADJECTIVES = [
  "Auto", "Smart", "Quick", "Fast", "Swift", "Clear", "Wise",
  "Lean", "Agile", "Turbo", "Pro", "One", "Easy", "Simple",
  "Hyper", "Mega", "Ultra", "Prime", " Apex", "Nova",
];

const DOMAIN_WORDS = [
  "invoice", "time", "task", "client", "project", "team",
  "payment", "expense", "report", "schedule", "workflow", "form",
];

const PAIN_ACTION: Record<string, string> = {
  "time": "save time",
  "track": "track automatically",
  "manag": "manage in one place",
  "invoice": "invoicing that pays",
  "payment": "get paid faster",
  "report": "reports on autopilot",
  "organiz": "stay organized",
  "automate": "automate the grind",
  "integrat": "connect everything",
  "sync": "sync across tools",
  "client": "happy clients",
  "tax": "stress-free taxes",
};

// ─── Core Generator ──────────────────────────────────────

/**
 * Generate `count` SaaS ideas from a research result.
 */
export function generateIdeasFromResearch(
  niche: string,
  demandScore: number,
  competitionScore: number,
  painPoints: string[],
  suggestedFeatures: string[],
  pricingSuggestion: string,
  count = 3
): GeneratedIdea[] {
  const ideas: GeneratedIdea[] = [];
  const usedNames = new Set<string>();

  // Determine primary pain theme
  const primaryPain = painPoints[0] ?? "inefficient workflows";
  const primaryAction = findPainAction(primaryPain);
  const targetUser = extractTargetUser(niche);

  for (let i = 0; i < count; i++) {
    let name: string;
    let attempts = 0;
    // Ensure unique names
    do {
      name = generateUniqueName(niche, i, usedNames);
      usedNames.add(name);
      attempts++;
    } while (usedNames.has(name) && attempts < 10);

    const baseScore = Math.round(
      demandScore * 0.4 +
        (100 - competitionScore) * 0.3 +
        Math.random() * 20
    );
    const validationScore = Math.min(95, Math.max(60, baseScore));

    const tier1 = pricingSuggestion;
    const tier2 = "$29/mo";
    const tier3 = "$49/mo";

    const idea: GeneratedIdea = {
      name,
      tagline: buildTagline(i, primaryAction, niche),
      targetUser,
      coreFeature: suggestedFeatures[i % suggestedFeatures.length] ?? primaryAction,
      monetization:
        i === 0
          ? `Freemium — free tier + premium at ${tier1}`
          : i === 1
            ? `Subscription — ${tier1} solo, ${tier2} team`
            : `Tiered — ${tier1} starter, ${tier3} business`,
      mvpScope: buildMvpScope(i, suggestedFeatures, primaryAction),
      domainAvailable: i !== 2, // 3rd idea has taken domain
      validationScore,
    };

    ideas.push(idea);
  }

  return ideas;
}

// ─── Name Generation ───────────────────────────────────

function generateUniqueName(niche: string, index: number, used: Set<string>): string {
  const domainWord = DOMAIN_WORDS[index % DOMAIN_WORDS.length];
  const noun = NOUNS[(index * 3 + 7) % NOUNS.length];
  const adj = ADJECTIVES[(index * 2 + 5) % ADJECTIVES.length];

  const patterns: Array<() => string> = [
    () => `${adj}${noun}`,
    () => `${domainWord}${noun}`,
    () => `${noun}${domainWord}`,
    () => `${adj}${domainWord.charAt(0).toUpperCase()}${domainWord.slice(1)}`,
    () => `${domainWord.charAt(0).toUpperCase()}${domainWord.slice(1)}${noun}`,
    () => `${adj} ${noun}`,
    () => `${noun}.${domainWord}`,
    () => `${domainWord}IQ`,
  ];

  const pattern = patterns[index % patterns.length];
  const name = pattern();

  // Recurse if name is used
  if (used.has(name)) {
    return generateUniqueName(niche, index + patterns.length, used);
  }
  return name;
}

function buildTagline(index: number, primaryAction: string, niche: string): string {
  const taglines = [
    `${primaryAction.charAt(0).toUpperCase()}${primaryAction.slice(1)} — without the headache`,
    `AI-powered ${niche.split(" ")[0]} for professionals who value time`,
    `The all-in-one ${niche.split(" ")[0]} platform that grows with you`,
  ];
  return taglines[index % taglines.length];
}

function extractTargetUser(niche: string): string {
  const l = niche.toLowerCase();
  if (l.includes("freelance") || l.includes("solo") || l.includes("individual"))
    return "Freelancers & solopreneurs";
  if (l.includes("startup") || l.includes("small business"))
    return "Startup founders";
  if (l.includes("agency") || l.includes("team"))
    return "Agency owners & teams";
  if (l.includes("developer") || l.includes("engineer"))
    return "Software developers";
  if (l.includes("ecommerce") || l.includes("e-commerce"))
    return "E-commerce sellers";
  return "Professionals & small teams";
}

function findPainAction(pain: string): string {
  const lower = pain.toLowerCase();
  for (const [key, action] of Object.entries(PAIN_ACTION)) {
    if (lower.includes(key)) return action;
  }
  return "automate the grind";
}

function buildMvpScope(
  index: number,
  features: string[],
  primaryAction: string
): string[] {
  const scopes = [
    [
      primaryAction,
      "Dashboard & analytics",
      "Core workflow automation",
      "Email notifications",
    ],
    [
      features[0] ?? "AI-powered feature",
      "Team collaboration",
      "Analytics dashboard",
      "API integrations",
    ],
    [
      "All-in-one platform",
      "Custom integrations",
      "Advanced reporting",
      "Priority support",
    ],
  ];
  return scopes[index % scopes.length];
}
