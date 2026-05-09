import { useState } from "react"
import { useFetcher } from "react-router"
import type { Ticket } from "../lib/db/schema"

interface Props {
  ticket: Ticket | null
  open: boolean
  onClose: () => void
  onPromptGenerated?: (prompt: string) => void
}

function buildFallback(raw: string, site: string, title: string): string {
  const repo = ({ alvarny: "~/code/alvarny", studios: "~/code/alvarny-studios", labs: "~/code/alvarny-labs" } as Record<string, string>)[site] ?? site
  return [
    `# Task: ${title}`, "", "## Repo", repo, "", "## Context", raw || "(no extra notes)", "",
    "## Acceptance criteria",
    "1. Implementation matches the description above.",
    "2. Existing tests pass; add coverage for new behavior.",
    "3. No new dependencies unless justified inline.",
    "", "## Constraints",
    "- Match existing code style and component conventions.",
    "- Do not modify unrelated files.",
  ].join("\n")
}

export default function Drawer({ ticket, open, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const statusFetcher = useFetcher()

  if (!ticket) return (
    <>
      <div className={`drawer-mask${open ? " open" : ""}`} onClick={onClose} />
      <aside className={`drawer${open ? " open" : ""}`} />
    </>
  )

  const prompt = buildFallback(ticket.raw ?? ticket.preview, ticket.site, ticket.title)

  const copy = () => {
    navigator.clipboard?.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  const markPrompted = () => {
    statusFetcher.submit({ id: ticket.id, status: "prompt" }, { method: "post", action: "/tickets" })
    onClose()
  }

  return (
    <>
      <div className={`drawer-mask${open ? " open" : ""}`} onClick={onClose} />
      <aside className={`drawer${open ? " open" : ""}`}>
        <div className="drawer-head">
          <div>
            <h4>{ticket.title}</h4>
            <span className="meta">{ticket.id} · {ticket.site}</span>
          </div>
          <button className="drawer-close" onClick={onClose}>Close</button>
        </div>
        <div className="drawer-body">
          <div>
            <div className="drawer-label">Raw note</div>
            <div className="drawer-raw">{ticket.raw || ticket.preview}</div>
          </div>
          <div>
            <div className="drawer-label">Generated Claude Code prompt</div>
            <pre className="drawer-prompt">{prompt}</pre>
          </div>
        </div>
        <div className="drawer-foot">
          <button className="btn-primary" onClick={copy}>{copied ? "Copied ✓" : "Copy prompt"}</button>
          <button className="btn-outline" onClick={markPrompted}>Mark prompted</button>
          <button className="btn-accent">Open in CC ↗</button>
        </div>
      </aside>
    </>
  )
}
