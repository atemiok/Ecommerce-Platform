import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const promotionsTable = pgTable("promotions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  discountText: text("discount_text"),
  code: text("code"),
  ctaLabel: text("cta_label").notNull().default("Shop the collection"),
  ctaUrl: text("cta_url").notNull().default("/shop"),
  active: boolean("active").notNull().default(false),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Promotion = typeof promotionsTable.$inferSelect;