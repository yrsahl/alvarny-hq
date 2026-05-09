export type SiteId = "alvarny" | "studios" | "labs";
export type TicketStatus = "idea" | "prompt" | "progress" | "shipped";

export interface SiteStats {
  id: SiteId;
  name: string;
  tag: string;
  domain: string;
  sub: string;
  blurb: string;
  stack: string;
  visitors: number;
  visitorsΔ: string;
  rev: number | null;
  revLabel: string;
  cost: number;
  uptime: number;
  ssl: number;
  deploy: string;
}

export const SITES: SiteStats[] = [
  {
    id: "alvarny",
    name: "alvarny",
    tag: "Personal",
    domain: "alvarny.com",
    sub: "apps.alvarny.com",
    blurb: "Portfolio + app lifecycle hub. Quiet front, deep back.",
    stack: "Next.js · Vercel · Supabase",
    visitors: 12480,
    visitorsΔ: "+8.2%",
    rev: null,
    revLabel: "—",
    cost: 38.4,
    uptime: 99.98,
    ssl: 41,
    deploy: "main → prod",
  },
  {
    id: "studios",
    name: "alvarny studios",
    tag: "Web & Shops",
    domain: "alvarnystudios.com",
    sub: "projects.alvarnystudios.com",
    blurb: "Marketing site funnels leads into the project portal.",
    stack: "Astro · Cloudflare · Linear",
    visitors: 4820,
    visitorsΔ: "+22.4%",
    rev: 18450,
    revLabel: "MRR",
    cost: 22.1,
    uptime: 99.94,
    ssl: 89,
    deploy: "main → prod",
  },
  {
    id: "labs",
    name: "alvarny labs",
    tag: "App Development",
    domain: "alvarnylabs.com",
    sub: "projects.alvarnylabs.com",
    blurb: "R&D shopfront for native + AI app builds.",
    stack: "SvelteKit · Fly · Postgres",
    visitors: 2140,
    visitorsΔ: "−3.1%",
    rev: 9200,
    revLabel: "MRR",
    cost: 64.8,
    uptime: 99.86,
    ssl: 162,
    deploy: "main → prod",
  },
];

export const SITE_REPO: Record<SiteId, string> = {
  alvarny: "~/code/alvarny",
  studios: "~/code/alvarny-studios",
  labs: "~/code/alvarny-labs",
};

export function formatRelativeTime(d: Date | string): string {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "< 1h ago";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function getMonthYear(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function nextTicketId(existing: string[]): string {
  const nums = existing.map((id) => parseInt(id.replace("A-", ""), 10)).filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 136;
  return `A-${max + 1}`;
}
