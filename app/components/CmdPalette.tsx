import { useState, useEffect, useRef } from "react"

const ITEMS = [
  { group: "Navigate", label: "Overview", path: "/", key: "⌘1" },
  { group: "Navigate", label: "Properties", path: "/properties", key: "⌘2" },
  { group: "Navigate", label: "Tickets", path: "/tickets", key: "⌘3" },
  { group: "Navigate", label: "Signals", path: "/signals", key: "⌘4" },
  { group: "Navigate", label: "Costs", path: "/costs", key: "⌘5" },
  { group: "Quick", label: "New ticket", path: "/tickets", key: "N" },
  { group: "Quick", label: "Today's digest", path: "/signals", key: "D" },
]

interface Props {
  open: boolean
  onClose: () => void
  onNavigate: (path: string) => void
}

export default function CmdPalette({ open, onClose, onNavigate }: Props) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = ITEMS.filter(i => !query || i.label.toLowerCase().includes(query.toLowerCase()))

  useEffect(() => {
    if (open) { setQuery(""); setSelected(0); setTimeout(() => inputRef.current?.focus(), 50) }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)) }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
      if (e.key === "Enter" && filtered[selected]) { onNavigate(filtered[selected].path); onClose() }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, filtered, selected, onNavigate, onClose])

  let lastGroup = ""

  return (
    <div className={`cmd-mask${open ? " open" : ""}`} onClick={onClose}>
      <div className="cmd-modal" onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="cmd-input"
          placeholder="Where to?"
          value={query}
          onChange={e => { setQuery(e.target.value); setSelected(0) }}
        />
        <div className="cmd-results">
          {filtered.map((item, i) => {
            const showGroup = item.group !== lastGroup
            lastGroup = item.group
            return (
              <div key={item.label}>
                {showGroup && <div className="cmd-group">{item.group}</div>}
                <div
                  className={`cmd-item${i === selected ? " selected" : ""}`}
                  onClick={() => { onNavigate(item.path); onClose() }}
                >
                  <span className="accent-star">✦</span>
                  <span>{item.label}</span>
                  <span className="shortcut">{item.key}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
