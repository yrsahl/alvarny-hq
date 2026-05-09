import { createCookieSessionStorage, redirect } from "react-router"

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "hq_session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET ?? "dev-secret-please-change!!"],
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  },
})

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"))
}

export async function requireAuth(request: Request) {
  const session = await getSession(request)
  if (!session.get("authed")) throw redirect("/login")
  return session
}

export async function createUserSession(redirectTo: string) {
  const session = await sessionStorage.getSession()
  session.set("authed", true)
  return redirect(redirectTo, {
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
  })
}

export async function destroySession(request: Request) {
  const session = await getSession(request)
  return redirect("/login", {
    headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
  })
}
