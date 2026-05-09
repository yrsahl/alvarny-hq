import { text, integer, real, boolean, serial, timestamp, pgTable } from "drizzle-orm/pg-core"

export const tickets = pgTable("tickets", {
  id: text("id").primaryKey(),
  site: text("site").$type<"alvarny" | "studios" | "labs">().notNull(),
  title: text("title").notNull(),
  preview: text("preview").notNull().default(""),
  raw: text("raw"),
  status: text("status").$type<"idea" | "prompt" | "progress" | "shipped">().notNull().default("idea"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const costs = pgTable("costs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  scope: text("scope").notNull(),
  category: text("category").notNull(),
  monthYear: text("month_year").notNull(),
  amount: real("amount").notNull(),
  isApi: boolean("is_api").notNull().default(false),
})

export const digestItems = pgTable("digest_items", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  source: text("source").notNull(),
  title: text("title").notNull(),
  isItalic: boolean("is_italic").notNull().default(false),
  hoursAgo: integer("hours_ago").notNull().default(0),
})

export const digestSummary = pgTable("digest_summary", {
  id: serial("id").primaryKey(),
  date: text("date").notNull().unique(),
  headline: text("headline").notNull(),
  paragraph: text("paragraph").notNull(),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
})

export const deployments = pgTable("deployments", {
  id: text("id").primaryKey(),
  site: text("site").$type<"alvarny" | "studios" | "labs">().notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("deployed"),
  deployedAt: timestamp("deployed_at").notNull().defaultNow(),
})

export const focusItems = pgTable("focus_items", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  text: text("text").notNull(),
  done: boolean("done").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
})

export type Ticket = typeof tickets.$inferSelect
export type NewTicket = typeof tickets.$inferInsert
export type Cost = typeof costs.$inferSelect
export type DigestItem = typeof digestItems.$inferSelect
export type DigestSummary = typeof digestSummary.$inferSelect
export type Deployment = typeof deployments.$inferSelect
export type FocusItem = typeof focusItems.$inferSelect
