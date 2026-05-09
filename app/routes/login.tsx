import { Form, redirect, useActionData, useNavigation } from "react-router"
import type { Route } from "./+types/login"
import { createUserSession, getSession } from "../lib/session.server"

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request)
  if (session.get("authed")) throw redirect("/")
  return null
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData()
  const password = form.get("password") as string

  const expected = process.env.HQ_PASSWORD ?? process.env.ORBIT_PASSWORD
  const isDev = process.env.NODE_ENV !== "production"
  if (!isDev && expected && password !== expected) return { error: "Wrong passphrase." }
  if (!isDev && !expected && !password?.trim()) return { error: "Enter a passphrase." }

  return createUserSession("/")
}

export default function Login() {
  const data = useActionData<typeof action>()
  const nav = useNavigation()
  const pending = nav.state === "submitting"

  return (
    <div className="login-overlay">
      <div className="login-card">
        <div className="planet planet-lg" />
        <h1 className="login-h1">Alvarny HQ<em>.</em></h1>
        <p className="login-tag">A calm vantage point above everything you ship.</p>
        <Form method="post">
          <div className="login-field">
            <label className="login-label">Passphrase</label>
            <input className="login-input" name="password" type="password" autoFocus placeholder="••••••••••" />
          </div>
          {data?.error && <p className="login-error">{data.error}</p>}
          <button className="login-btn" type="submit" disabled={pending}>
            {pending ? "Entering…" : "Enter Alvarny HQ ✦"}
          </button>
        </Form>
        <div className="login-footer">
          <span>Private · single operator</span>
          <span>v0.1.0</span>
        </div>
      </div>
    </div>
  )
}
