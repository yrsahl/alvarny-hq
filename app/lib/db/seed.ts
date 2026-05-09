import { drizzle } from "drizzle-orm/neon-serverless"
import { Pool } from "@neondatabase/serverless"
import * as schema from "./schema"

// Load .env manually since tsx doesn't auto-load it
import { readFileSync } from "fs"
import { resolve } from "path"
try {
  const env = readFileSync(resolve(process.cwd(), ".env"), "utf8")
  for (const line of env.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
} catch {}

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const db = drizzle(pool, { schema })

async function seed() {
  const today = new Date().toISOString().slice(0, 10)
  const thisMonth = today.slice(0, 7)

  await db.insert(schema.tickets).values([
    { id: "A-142", site: "alvarny", title: "Replace homepage hero with kinetic type loop", preview: "Idea: explore something more alive than the current static frame.", raw: "Hero feels static. Want a loop, calm, monochrome maybe.", status: "idea" },
    { id: "A-141", site: "studios", title: "Lead-form: pre-qualify by budget tier", preview: "Three radios + conditional copy; route to right Linear queue.", status: "prompt" },
    { id: "A-140", site: "labs", title: "Pricing: usage-based row for Claude API passthrough", preview: "Show transparent margin, similar to Vercel pricing.", status: "progress" },
    { id: "A-139", site: "alvarny", title: "apps.alvarny.com — per-app billing breakdown", preview: "New tab on each app detail; pulls from Stripe metadata.", status: "progress" },
    { id: "A-138", site: "studios", title: "Case study template + first 2 case studies", preview: "Long-form, image-led, footnotes. Newsreader serif.", status: "idea" },
    { id: "A-137", site: "labs", title: "Add status page at status.alvarnylabs.com", preview: "Connect to existing UptimeRobot probes.", status: "shipped" },
    { id: "A-136", site: "alvarny", title: "Dark mode for /writing", preview: "Match the site's warm gray; no toggle, follow system.", status: "shipped" },
  ]).onConflictDoNothing()

  await db.insert(schema.costs).values([
    { name: "Vercel", scope: "alvarny + studios", category: "hosting", monthYear: thisMonth, amount: 38.40 },
    { name: "Cloudflare", scope: "studios", category: "cdn/edge", monthYear: thisMonth, amount: 5.00 },
    { name: "Fly.io", scope: "labs", category: "hosting", monthYear: thisMonth, amount: 24.80 },
    { name: "Supabase", scope: "alvarny", category: "database", monthYear: thisMonth, amount: 25.00 },
    { name: "Neon", scope: "labs", category: "database", monthYear: thisMonth, amount: 19.00 },
    { name: "Anthropic API", scope: "all sites", category: "ai", monthYear: thisMonth, amount: 312.40, isApi: true },
    { name: "OpenAI API", scope: "labs", category: "ai", monthYear: thisMonth, amount: 48.20, isApi: true },
    { name: "Resend", scope: "all sites", category: "email", monthYear: thisMonth, amount: 8.00 },
    { name: "Linear", scope: "all sites", category: "tools", monthYear: thisMonth, amount: 16.00 },
    { name: "Domains (3)", scope: "all sites", category: "domains", monthYear: thisMonth, amount: 2.40 },
  ])

  await db.insert(schema.digestSummary).values([
    { date: today, headline: "Extended thinking ships; an open-source agent crosses 70% on SWE-Bench.", paragraph: "Anthropic shipped Claude Sonnet with a tunable extended-thinking budget — early benchmarks suggest a real bump in long-horizon tasks. Meanwhile a small but well-built open-source agent edged past 70% on SWE-Bench Verified, mostly on better tool use rather than a smarter base model. Two tooling notes: Cursor finally added project-wide refactor previews, and a Vercel demo turned an entire Stripe checkout into an MCP server in a weekend." },
  ]).onConflictDoNothing()

  await db.insert(schema.digestItems).values([
    { date: today, source: "Anthropic", title: "Extended thinking, 200k context, faster vision", hoursAgo: 2 },
    { date: today, source: "arXiv", title: "Tool-Augmented Agents and the End of \"Pure\" Benchmarks", isItalic: true, hoursAgo: 6 },
    { date: today, source: "Cursor", title: "Project-wide refactor previews land in 0.42", hoursAgo: 8 },
    { date: today, source: "HN", title: "Show HN: a 700-line MCP server that wraps any REST API", hoursAgo: 10 },
    { date: today, source: "Vercel", title: "AI SDK 5 — first-class streaming for tool calls", hoursAgo: 14 },
    { date: today, source: "Substack", title: "Why \"agent reliability\" is the only metric that ships", isItalic: true, hoursAgo: 24 },
  ])

  await db.insert(schema.deployments).values([
    { id: "a1c4f2e", site: "alvarny", message: "feat: kinetic hero variant behind feature flag", deployedAt: new Date(Date.now() - 2 * 3_600_000) },
    { id: "8e7b3a1", site: "labs", message: "fix: idle SSE timeout on /agent stream", deployedAt: new Date(Date.now() - 24 * 3_600_000) },
    { id: "3df2c91", site: "studios", message: "chore: lead-form copy + a11y pass", deployedAt: new Date(Date.now() - 5 * 24 * 3_600_000) },
  ]).onConflictDoNothing()

  await db.insert(schema.focusItems).values([
    { date: today, text: "Ship A-140 pricing row to staging", done: true, sortOrder: 0 },
    { date: today, text: "Review labs case study draft (30m)", done: false, sortOrder: 1 },
    { date: today, text: "Reply to 2 leads in studios inbox", done: false, sortOrder: 2 },
    { date: today, text: "Read MCP server article on HN", done: false, sortOrder: 3 },
  ])

  console.log("Seeded.")
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
