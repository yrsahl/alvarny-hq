import { desc } from "drizzle-orm"
import { db } from "../lib/db"
import { deployments } from "../lib/db/schema"
import { SITES, formatRelativeTime } from "../lib/data"
import MissionCard from "../components/MissionCard"

export async function loader() {
  const deploys = await db.select().from(deployments).orderBy(desc(deployments.deployedAt)).limit(10)
  return { deploys }
}

export default function Properties({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { deploys } = loaderData

  return (
    <>
      <div className="section-h">
        <h2>The three <em>missions</em></h2>
        <span style={{ fontSize: 13, color: "var(--mute)" }}>3 properties</span>
      </div>
      <div className="missions">
        {SITES.map(s => <MissionCard key={s.id} site={s} />)}
      </div>

      <div className="card" style={{ padding: "var(--pad)", marginTop: 24 }}>
        <div className="section-h" style={{ marginTop: 0 }}>
          <h2>Recent <em>deployments</em></h2>
        </div>
        <div className="ticket-list">
          {deploys.map(d => (
            <div key={d.id} className="ticket-row" style={{ cursor: "default" }}>
              <span className="ticket-id">{d.id.slice(0, 7)}</span>
              <span className="ticket-text">
                <strong>{d.message}</strong>
                <small>{formatRelativeTime(d.deployedAt)}</small>
              </span>
              <span className="ticket-right">
                <span className={`site-pill ${d.site}`}>{d.site}</span>
                <span className="status-pill shipped">{d.status}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
