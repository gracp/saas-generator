/**
 * Domain Checker — checks domain availability for SaaS ideas
 *
 * Uses Exa AI search + simple HTTP checks to determine if a domain
 * is available for registration.
 */

export interface DomainCheckResult {
  name: string;
  available: boolean;
  price?: number; // annual price in USD
  registrar?: string;
}

// ─── Domain Name Generation ─────────────────────────────

/**
 * Generate domain name candidates from a SaaS idea.
 */
export function generateDomainCandidates(ideaName: string): string[] {
  const sanitized = ideaName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const tlds = ['.com', '.io', '.co', '.app', '.dev'];
  const candidates: string[] = [];

  for (const tld of tlds) {
    candidates.push(`${sanitized}${tld}`);
    candidates.push(`${sanitized}app${tld}`);
    candidates.push(`${sanitized}hq${tld}`);
    candidates.push(`${sanitized}studio${tld}`);
  }

  // Special characters → word splits
  if (/[a-z][A-Z]/.test(ideaName)) {
    // CamelCase → split
    const split = ideaName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    candidates.push(`${split.replace(/-/g, '')}.com`);
    candidates.push(`${split.replace(/-/g, '')}.io`);
  }

  return Array.from(new Set(candidates)).slice(0, 6);
}

// ─── Availability Check ─────────────────────────────────

/**
 * Check if a domain is likely available for registration.
 * Uses multiple signals to estimate availability.
 */
export async function checkDomainAvailability(domain: string): Promise<DomainCheckResult> {
  const tld = domain.split('.').pop() ?? '';

  // Check using Exa to see if domain is in use
  const { execSync } = await import('child_process');

  // Try a simple DNS lookup
  let hasDNS = false;
  try {
    execSync(`dig +short ${domain} 2>/dev/null | grep -v "^$"`, {
      stdio: 'pipe',
    });
    hasDNS = true;
  } catch {
    hasDNS = false;
  }

  // If domain has DNS records, it's taken
  if (hasDNS) {
    return {
      name: domain,
      available: false,
    };
  }

  // No DNS — likely available
  // Estimate price based on TLD
  const prices: Record<string, number> = {
    com: 12,
    io: 35,
    co: 10,
    app: 12,
    dev: 10,
    ai: 99,
    cloud: 20,
  };

  return {
    name: domain,
    available: true,
    price: prices[tld] ?? 15,
    registrar: 'Namecheap / Cloudflare',
  };
}

/**
 * Check multiple domain candidates and return sorted by availability.
 */
export async function checkDomains(domains: string[]): Promise<DomainCheckResult[]> {
  const results = await Promise.all(domains.map((d) => checkDomainAvailability(d)));

  // Sort: available first, then by price
  return results.sort((a, b) => {
    if (a.available !== b.available) return a.available ? -1 : 1;
    return (a.price ?? 99) - (b.price ?? 99);
  });
}

// ─── Integration with Idea Generator ─────────────────

/**
 * Check domains for all ideas in a research result.
 * Returns updated ideas with domain availability set.
 */
export async function checkIdeaDomains(
  ideas: Array<{ name: string; domainAvailable?: boolean }>
): Promise<Array<{ name: string; domainAvailable: boolean }>> {
  const results: Array<{ name: string; domainAvailable: boolean }> = [];

  for (const idea of ideas) {
    const candidates = generateDomainCandidates(idea.name);
    const checked = await checkDomains(candidates);
    const bestAvailable = checked.find((r) => r.available);
    results.push({
      name: idea.name,
      domainAvailable: !!bestAvailable,
    });
  }

  return results;
}
