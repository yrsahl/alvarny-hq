"use client"

import { Outlet, useNavigate } from "react-router"
import { useState, useEffect, useCallback } from "react"
import type { Route } from "./+types/_dashboard"
import { requireAuth } from "../lib/session.server"
import TopBar from "../components/TopBar"
import CmdPalette from "../components/CmdPalette"

export async function loader({ request }: Route.LoaderArgs) {
  await requireAuth(request)
  return null
}

export default function Dashboard() {
  const [cmdOpen, setCmdOpen] = useState(false)
  const navigate = useNavigate()

  const openCmd = useCallback(() => setCmdOpen(true), [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen(o => !o) }
      if (e.key === "Escape") setCmdOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  return (
    <>
      <TopBar onCmdOpen={openCmd} />
      <main className="page">
        <Outlet />
      </main>
      <CmdPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onNavigate={(path) => { navigate(path); setCmdOpen(false) }} />
    </>
  )
}
