import { pgTable, text, timestamp, uuid, jsonb, integer, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").unique().notNull(),
  name: text("name"),
  email: text("email").notNull(),
  plan: text("plan").default("Free").notNull(),
  onboardingComplete: boolean("onboarding_complete").default(false).notNull(),
  onboardingStep: integer("onboarding_step").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const brandKits = pgTable("brand_kits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  logoUrl: text("logo_url"),
  colors: text("colors").array(),
  fonts: text("fonts").array(),
  tone: text("tone"),
  niche: text("niche"),
  platforms: text("platforms").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  module: text("module").notNull(),
  title: text("title").notNull(),
  status: text("status").default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contentOutputs = pgTable("content_outputs", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  type: text("type").notNull(),
  contentJson: jsonb("content_json").notNull(),
  version: integer("version").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const swipeFiles = pgTable("swipe_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  category: text("category"),
  notes: text("notes"),
  sourceUrl: text("source_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull().unique(),
  plan: text("plan").notNull(),
  status: text("status").default("active").notNull(),
  renewalDate: timestamp("renewal_date"),
  apiCredits: integer("api_credits").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
