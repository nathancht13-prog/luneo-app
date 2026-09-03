import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// One row per story generated, used to enforce the free plan's monthly
// quota (count rows for an email within the current calendar month).
export const storyGenerationsTable = pgTable("story_generations", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type StoryGeneration = typeof storyGenerationsTable.$inferSelect;
