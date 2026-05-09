import { eq } from "drizzle-orm"
import { db } from "../lib/db"
import { costs } from "../lib/db/schema"
import { getMonthYear } from "../lib/data"

export async function loader() {
  const thisMonth = getMonthYear()
  const allCosts = await db.select().from(costs).where(eq(costs.monthYear, thisMonth))
  return { allCosts }
}

export default function Costs({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { allCosts } = loaderData
  const sorted = [...allCosts].sort((a, b) => b.amount - a.amount)
  const total = allCosts.reduce((a, c) => a + c.amount, 0)
  const apiTotal = allCosts.filter(c => c.isApi).reduce((a, c) => a + c.amount, 0)
  const maxAmount = Math.max(...allCosts.map(c => c.amount), 1)
  const monthLabel = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <div className="card" style={{ padding: "var(--pad)", marginBottom: 18 }}>
      <div className="section-h" style={{ marginTop: 0 }}>
        <h2>Money <em>in motion</em></h2>
        <span style={{ fontSize: 12.5, color: "var(--mute)" }}>
          {monthLabel} · to date
        </span>
      </div>

      <div className="costs-grid">
        {[
          { label: "Spend · MTD", value: `$${total.toFixed(0)}`, delta: "+5%" },
          { label: "AI APIs", value: `$${apiTotal.toFixed(0)}`, delta: "+18%", down: true },
          { label: "Forecast", value: "$642" },
          { label: "Budget", value: "$700" },
        ].map(({ label, value, delta, down }) => (
          <div key={label} className="lcard">
            <div className="l">{label}</div>
            <div className="v">
              {value}
              {delta && <small className={down ? "down" : ""}>{delta}</small>}
            </div>
          </div>
        ))}
      </div>

      <div className="vendor-list">
        {sorted.map(c => (
          <div key={c.id} className="vendor-row">
            <div className={`vendor-ic${c.isApi ? " api" : ""}`}>{c.isApi ? "API" : c.name[0]}</div>
            <div className="vendor-name">
              <strong>{c.name}</strong>
              <small>{c.scope}</small>
            </div>
            <div className="vendor-cat">{c.category}</div>
            <div className="vendor-bar">
              <div className={`vendor-bar-fill${c.isApi ? " api" : ""}`} style={{ width: `${(c.amount / maxAmount) * 100}%` }} />
            </div>
            <div className="vendor-amt">${c.amount.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
