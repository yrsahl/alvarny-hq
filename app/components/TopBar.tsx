import { Form, NavLink } from "react-router"

const NAV = [
  { to: "/", label: "Overview" },
  { to: "/properties", label: "Properties" },
  { to: "/tickets", label: "Tickets" },
  { to: "/signals", label: "Signals" },
  { to: "/costs", label: "Costs" },
]

export default function TopBar({ onCmdOpen }: { onCmdOpen: () => void }) {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <div className="planet" />
        <span className="brand-name">Orbit<em>.</em></span>
      </div>

      <nav className="topbar-nav">
        {NAV.map(({ to, label }) => (
          <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => isActive ? "active" : ""}>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="topbar-right">
        <span className="pill">
          <span className="pulse-dot" />
          All systems nominal
        </span>
        <button className="pill" onClick={onCmdOpen} style={{ fontFamily: "var(--font-mono), 'Geist Mono', monospace" }}>
          ⌘ K
        </button>
        <Form action="/logout" method="post">
          <button type="submit" className="avatar" title="Sign out">A</button>
        </Form>
      </div>
    </header>
  )
}
