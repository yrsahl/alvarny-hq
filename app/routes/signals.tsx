import { eq } from "drizzle-orm"
import { db } from "../lib/db"
import { digestItems, digestSummary } from "../lib/db/schema"
import { getToday } from "../lib/data"

export async function loader() {
  const today = getToday()
  const [digest, items] = await Promise.all([
    db.select().from(digestSummary).where(eq(digestSummary.date, today)).limit(1),
    db.select().from(digestItems).where(eq(digestItems.date, today)).orderBy(digestItems.hoursAgo),
  ])
  return { digest: digest[0] ?? null, items }
}

export default function Signals({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { digest, items } = loaderData

  return (
    <>
      <div className="section-h">
        <h2>Signals <em>from the field</em></h2>
        <span style={{ fontSize: 13, color: "var(--mute)" }}>Updated 2m ago</span>
      </div>

      <div className="card digest-card">
        <div className="digest-head">
          <h3>Today's <em>digest</em></h3>
          <span className="digest-when">
            {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} CET · from the field
          </span>
        </div>
        {digest ? (
          <>
            <p className="digest-para">{digest.paragraph}</p>
            <div className="digest-list">
              {items.map(item => (
                <div key={item.id} className="digest-item">
                  <span className="digest-src">{item.source}</span>
                  <span className="digest-ttl">{item.isItalic ? <em>{item.title}</em> : item.title}</span>
                  <span className="digest-age">
                    {item.hoursAgo < 1 ? "just now" : item.hoursAgo < 24 ? `${item.hoursAgo}h` : `${Math.floor(item.hoursAgo / 24)}d`}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="digest-para" style={{ color: "var(--mute)" }}>No digest yet for today. Check back later.</p>
        )}
      </div>
    </>
  )
}
