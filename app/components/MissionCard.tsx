import { useNavigate } from "react-router"
import type { SiteStats } from "../lib/data"

export default function MissionCard({ site }: { site: SiteStats }) {
  const navigate = useNavigate()
  const isDown = (s: string) => s.startsWith("−") || s.startsWith("-")

  return (
    <div className="mission-card" onClick={() => navigate("/properties")}>
      <div className={`mission-thumb ${site.id}`}>
        <span className="mission-wordmark">{site.name}</span>
        <span className="mission-badge">{site.tag}</span>
      </div>
      <div className="mission-body">
        <h3>{site.name}</h3>
        <div className="mission-domain">{site.domain}</div>
        <div className="mission-blurb">{site.blurb}</div>
        <div className="mission-grid4">
          <div className="mission-stat">
            <div className="v">
              {(site.visitors / 1000).toFixed(1)}k
              <small className={isDown(site.visitorsΔ) ? "down" : ""}>{site.visitorsΔ}</small>
            </div>
            <div className="l">Visitors · 7d</div>
          </div>
          <div className="mission-stat">
            <div className="v">{site.rev ? `$${(site.rev / 1000).toFixed(1)}k` : "—"}</div>
            <div className="l">{site.revLabel}</div>
          </div>
          <div className="mission-stat">
            <div className="v">${site.cost.toFixed(0)}</div>
            <div className="l">Cost · MTD</div>
          </div>
          <div className="mission-stat">
            <div className="v">{site.uptime}%</div>
            <div className="l">Uptime</div>
          </div>
        </div>
        <div className="mission-meta">
          <span className="chip good">● Live</span>
          <span className="chip">{site.stack.split(" · ")[0]}</span>
          <span className="chip">{site.deploy}</span>
          <span className={`chip${site.ssl < 60 ? " warn" : ""}`} style={{ marginLeft: "auto" }}>
            SSL {site.ssl}d
          </span>
        </div>
      </div>
    </div>
  )
}
