import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// Better Auth Tables
// ============================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").default("user"), // 'admin' | 'user'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Better Auth Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// Type exports for auth
export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;

// Enums
export const resourceTypeEnum = pgEnum("resource_type", [
  "BOOK",
  "COURSE",
  "YOUTUBE_SERIES",
  "PODCAST",
  "ARTICLE",
  "COHORT_PROGRAM",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "pending",
  "approved",
  "rejected",
]);

// Creators table
export const creators = pgTable("creators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  websiteUrl: text("website_url"),
  twitterUrl: text("twitter_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Resources table
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  url: text("url").notNull(),
  type: resourceTypeEnum("type").notNull(),
  price: text("price").notNull().default("Free"),
  imageUrl: text("image_url"),
  creatorId: integer("creator_id")
    .notNull()
    .references(() => creators.id),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  isFeatured: boolean("is_featured").default(false).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tags table
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

// Resource-Tags junction table (many-to-many)
export const resourceTags = pgTable(
  "resource_tags",
  {
    resourceId: integer("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.resourceId, table.tagId] })]
);

// Pending submissions from agents
export const pendingSubmissions = pgTable("pending_submissions", {
  id: serial("id").primaryKey(),

  // Core resource data (denormalized - not FKs yet)
  title: text("title").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  type: resourceTypeEnum("type").notNull(),
  price: text("price").default("Unknown"),
  imageUrl: text("image_url"),

  // These are TEXT, not foreign keys - resolved on approval
  creatorName: text("creator_name").notNull(),
  creatorUrl: text("creator_url"),
  suggestedCategory: text("suggested_category").notNull(),
  suggestedTags: jsonb("suggested_tags").$type<string[]>().default([]),

  // Agent metadata
  metadata: jsonb("metadata").$type<{
    discoveryTopic?: string;
    sourceAgent?: string;
    confidenceScore?: number;
    urlVerified?: boolean;
    [key: string]: unknown;
  }>(),

  // Review workflow
  status: submissionStatusEnum("status").default("pending").notNull(),
  reviewNotes: text("review_notes"),
  reviewedAt: timestamp("reviewed_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const creatorsRelations = relations(creators, ({ many }) => ({
  resources: many(resources),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  resources: many(resources),
}));

export const resourcesRelations = relations(resources, ({ one, many }) => ({
  creator: one(creators, {
    fields: [resources.creatorId],
    references: [creators.id],
  }),
  category: one(categories, {
    fields: [resources.categoryId],
    references: [categories.id],
  }),
  resourceTags: many(resourceTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  resourceTags: many(resourceTags),
}));

export const resourceTagsRelations = relations(resourceTags, ({ one }) => ({
  resource: one(resources, {
    fields: [resourceTags.resourceId],
    references: [resources.id],
  }),
  tag: one(tags, {
    fields: [resourceTags.tagId],
    references: [tags.id],
  }),
}));

// Type exports
export type Creator = typeof creators.$inferSelect;
export type NewCreator = typeof creators.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type ResourceType = (typeof resourceTypeEnum.enumValues)[number];
export type SubmissionStatus = (typeof submissionStatusEnum.enumValues)[number];
export type PendingSubmission = typeof pendingSubmissions.$inferSelect;
export type NewPendingSubmission = typeof pendingSubmissions.$inferInsert;
