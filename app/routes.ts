import { type RouteConfig, index, layout, route } from "@react-router/dev/routes"

export default [
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.ts"),
  layout("routes/_dashboard.tsx", [
    index("routes/overview.tsx"),
    route("properties", "routes/properties.tsx"),
    route("tickets", "routes/tickets.tsx"),
    route("signals", "routes/signals.tsx"),
    route("costs", "routes/costs.tsx"),
  ]),
] satisfies RouteConfig
