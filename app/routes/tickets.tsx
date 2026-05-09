import { useState } from "react"
import { useFetcher } from "react-router"
import { desc, eq } from "drizzle-orm"
import type { Route } from "./+types/tickets"
import { db } from "../lib/db"
import { tickets } from "../lib/db/schema"
import { nextTicketId } from "../lib/data"
import Drawer from "../components/Drawer"
import type { Ticket } from "../lib/db/schema"

export async function loader() {
  const allTickets = await db.select().from(tickets).orderBy(desc(tickets.createdAt))
  return { allTickets }
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData()
  const intent = form.get("intent") as string

  if (intent === "create") {
    const raw = form.get("raw") as string
    const site = form.get("site") as Ticket["site"]
    const all = await db.select({ id: tickets.id }).from(tickets).orderBy(desc(tickets.createdAt))
    const id = nextTicketId(all.map(t => t.id))
    await db.insert(tickets).values({ id, site, title: raw.split("\n")[0].slice(0, 60) || raw.slice(0, 60), preview: raw.slice(0, 90), raw, status: "idea" })
  }

  if (intent === "status") {
    const id = form.get("id") as string
    const status = form.get("status") as Ticket["status"]
    await db.update(tickets).set({ status, updatedAt: new Date() }).where(eq(tickets.id, id))
  }

  return null
}

const statusLabel = (s: Ticket["status"]) =>
  ({ idea: "Idea", prompt: "Prompted", progress: "In progress", shipped: "Shipped" })[s]

export default function Tickets({ loaderData }: Route.ComponentProps) {
  const { allTickets } = loaderData
  const [drawerTicket, setDrawerTicket] = useState<Ticket | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const [draftSite, setDraftSite] = useState<Ticket["site"]>("alvarny")
  const fetcher = useFetcher()

  const submitDraft = () => {
    if (!draft.trim()) return
    fetcher.submit({ intent: "create", raw: draft, site: draftSite }, { method: "post" })
    setDraft("")
  }

  const openTicket = (t: Ticket) => { setDrawerTicket(t); setDrawerOpen(true) }

  return (
    <>
      <div className="section-h">
        <h2>Tickets <em>&amp; ideas</em></h2>
        <span style={{ fontSize: 13, color: "var(--mute)" }}>{allTickets.length} total</span>
      </div>

      <div className="card tickets-panel" style={{ marginBottom: 24 }}>
        <div className="compose">
          <textarea
            placeholder="An idea, a bug, a half-formed thought… Alvarny HQ translates it into a Claude Code prompt."
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitDraft() }}
            style={{ minHeight: 100 }}
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

      <Drawer ticket={drawerTicket} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
