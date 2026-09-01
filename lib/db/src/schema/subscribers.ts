import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

// Tracks whether the email tied to a Whop membership currently has an
// active paid subscription. Populated by the Whop webhook
// (membership.activated / membership.deactivated), read at request time
// to decide whether to unlock the full story content.
export const subscribersTable = pgTable("subscribers", {
  email: text("email").primaryKey(),
  active: boolean("active").notNull().default(false),
  plan: text("plan"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Subscriber = typeof subscribersTable.$inferSelect;
