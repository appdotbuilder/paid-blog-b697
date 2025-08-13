import { serial, text, pgTable, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  credits: integer('credits').notNull().default(0),
  post_count: integer('post_count').notNull().default(0),
  is_admin: boolean('is_admin').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const postsTable = pgTable('posts', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  phone_number: text('phone_number').notNull(),
  image_path: text('image_path'), // Nullable - posts can exist without images
  is_active: boolean('is_active').notNull().default(true),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Define relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  posts: many(postsTable)
}));

export const postsRelations = relations(postsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [postsTable.user_id],
    references: [usersTable.id]
  })
}));

// TypeScript types for the table schemas
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Post = typeof postsTable.$inferSelect;
export type NewPost = typeof postsTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = { 
  users: usersTable, 
  posts: postsTable 
};

export const tableRelations = {
  usersRelations,
  postsRelations
};