import { useState } from "react"
import { useFetcher } from "react-router"
import { desc, eq } from "drizzle-orm"
import type { Route } from "./+types/overview"
import { db } from "../lib/db"
import { tickets, digestItems, digestSummary, focusItems, costs } from "../lib/db/schema"
import { SITES, getToday, getMonthYear } from "../lib/data"
import MissionCard from "../components/MissionCard"
import Drawer from "../components/Drawer"
import type { Ticket, FocusItem } from "../lib/db/schema"

export async function loader() {
  const today = getToday()
  const thisMonth = getMonthYear()

  const [allTickets, digest, items, focus, allCosts] = await Promise.all([
    db.select().from(tickets).orderBy(desc(tickets.createdAt)).limit(5),
    db.select().from(digestSummary).where(eq(digestSummary.date, today)).limit(1),
    db.select().from(digestItems).where(eq(digestItems.date, today)).orderBy(digestItems.hoursAgo),
    db.select().from(focusItems).where(eq(focusItems.date, today)).orderBy(focusItems.sortOrder),
    db.select().from(costs).where(eq(costs.monthYear, thisMonth)),
  ])

  const totalVisitors = SITES.reduce((a, s) => a + s.visitors, 0)
  const totalSpend = allCosts.reduce((a, c) => a + c.amount, 0)
  const openTickets = allTickets.filter(t => t.status !== "shipped").length

  const now = new Date()
  const dayName = now.toLocaleDateString("en-GB", { weekday: "long" })
  const dateStr = now
    .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    .replace(",", "")

  return { allTickets, digest: digest[0] ?? null, items, focus, totalVisitors, totalSpend, openTickets, dayName, dateStr }
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData()
  const intent = form.get("intent") as string

  if (intent === "toggle-focus") {
    const { eq: eqFn } = await import("drizzle-orm")
    const id = Number(form.get("id"))
    const done = form.get("done") === "true"
    await db.update(focusItems).set({ done }).where(eqFn(focusItems.id, id))
    return null
  }

  if (intent === "create-ticket") {
    const { desc: descFn } = await import("drizzle-orm")
    const { nextTicketId } = await import("../lib/data")
    const raw = form.get("raw") as string
    const site = form.get("site") as "alvarny" | "studios" | "labs"
    const all = await db.select({ id: tickets.id }).from(tickets).orderBy(descFn(tickets.createdAt))
    const id = nextTicketId(all.map(t => t.id))
    await db.insert(tickets).values({ id, site, title: raw.split("\n")[0].slice(0, 60) || raw.slice(0, 60), preview: raw.slice(0, 90), raw, status: "idea" })
    return null
  }

  if (intent === "update-status") {
    const { eq: eqFn } = await import("drizzle-orm")
    const id = form.get("id") as string
    const status = form.get("status") as Ticket["status"]
    await db.update(tickets).set({ status, updatedAt: new Date() }).where(eqFn(tickets.id, id))
    return null
  }

  return null
}

export default function Overview({ loaderData }: Route.ComponentProps) {
  const { allTickets, digest, items, focus, totalVisitors, totalSpend, openTickets, dayName, dateStr } = loaderData
  const [drawerTicket, setDrawerTicket] = useState<Ticket | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const [draftSite, setDraftSite] = useState<"alvarny" | "studios" | "labs">("alvarny")
  const [focusState, setFocusState] = useState<FocusItem[]>(focus)
  const fetcher = useFetcher()

  const openTicket = (t: Ticket) => { setDrawerTicket(t); setDrawerOpen(true) }

  const toggleFocus = (item: FocusItem) => {
    const next = !item.done
    setFocusState(s => s.map(f => f.id === item.id ? { ...f, done: next } : f))
    fetcher.submit({ intent: "toggle-focus", id: String(item.id), done: String(next) }, { method: "post" })
  }

  const submitDraft = () => {
    if (!draft.trim()) return
    fetcher.submit({ intent: "create-ticket", raw: draft, site: draftSite }, { method: "post" })
    setDraft("")
  }

  const statusLabel = (s: Ticket["status"]) =>
    ({ idea: "Idea", prompt: "Prompted", progress: "In progress", shipped: "Shipped" })[s]

  return (
    <>
      {/* Hero */}
      <div className="hero">
        <div className="card hello">
          <div className="hello-blob" />
          <div className="greet">{dayName} · {dateStr}</div>
          <h1>Good morning, <em>Alvar.</em></h1>
          <p className="hello-summary">
            Traffic across the three properties is up <b>+11% week-on-week</b>, mostly driven by studios. Anthropic API spend is on track for <b>~$420 this month</b>. Two leads are waiting in the studios inbox.
          </p>
          <div className="stats-row">
            <div className="stat-item">
              <div className="v">{(totalVisitors / 1000).toFixed(1)}k</div>
              <div className="l">Visitors · 7d</div>
            </div>
            <div className="stat-item">
              <div className="v">${totalSpend.toFixed(0)}</div>
              <div className="l">Spend · MTD</div>
            </div>
            <div className="stat-item">
              <div className="v">{openTickets}</div>
              <div className="l">Open tickets</div>
            </div>
            <div className="stat-item">
              <div className="v">7</div>
              <div className="l">Active leads</div>
            </div>
          </div>
        </div>

        <div className="card focus-card">
          <h3>Today's <em>focus</em></h3>
          <div className="focus-when">~ 4 hours · Deep work block</div>
          <div className="focus-list">
            {focusState.map(item => (
              <div key={item.id} className={`focus-item${item.done ? " done" : ""}`} onClick={() => toggleFocus(item)}>
                <span className="check-circle">{item.done ? "✓" : ""}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Missions */}
      <div className="section-h">
        <h2>The three <em>missions</em></h2>
        <span style={{ fontSize: 13, color: "var(--mute)" }}>All properties →</span>
      </div>
      <div className="missions">
        {SITES.map(s => <MissionCard key={s.id} site={s} />)}
      </div>

      {/* Bottom grid */}
      <div className="grid-2">
        {/* Digest */}
        <div className="card digest-card">
          <div className="digest-head">
            <h3>Today, in <em>machines that build software</em></h3>
            <span className="digest-when">{new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} CET</span>
          </div>
          {digest ? (
            <>
              <p className="digest-para">{digest.paragraph}</p>
              <div className="digest-list">
                {items.map(item => (
                  <div key={item.id} className="digest-item">
                    <span className="digest-src">{item.source}</span>
                    <span className="digest-ttl">{item.isItalic ? <em>{item.title}</em> : item.title}</span>
                    <span className="digest-age">{item.hoursAgo < 1 ? "just now" : item.hoursAgo < 24 ? `${item.hoursAgo}h` : `${Math.floor(item.hoursAgo / 24)}d`}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="digest-para" style={{ color: "var(--mute)" }}>No digest yet for today.</p>
          )}
        </div>

        {/* Tickets */}
        <div className="card tickets-panel">
          <h3>Tickets <em>&amp; ideas</em></h3>
          <div className="tickets-sub">Capture → translate → ship.</div>
          <div className="compose">
            <textarea
              placeholder="An idea, a bug, a half-formed thought…"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitDraft() }}
            />
            <div className="compose-row">
              <div className="seg">
                {(["alvarny", "studios", "labs"] as const).map(s => (
                  <button key={s} className={`${s}${draftSite === s ? " on" : ""}`} onClick={() => setDraftSite(s)}>{s}</button>
                ))}
              </div>
              <button className="btn-primary" onClick={submitDraft} disabled={!draft.trim()}>Translate ✦</button>
            </div>
          </div>
          <div className="ticket-list">
            {allTickets.map(t => (
              <div key={t.id} className="ticket-row" onClick={() => openTicket(t)}>
                <span className="ticket-id">{t.id}</span>
                <span className="ticket-text">
                  <strong>{t.title}</strong>
                  <small>{t.preview}</small>
                </span>
                <span className="ticket-right">
                  <span className={`site-pill ${t.site}`}>{t.site}</span>
                  <span className={`status-pill ${t.status}`}>{statusLabel(t.status)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Drawer ticket={drawerTicket} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
