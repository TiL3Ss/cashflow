// src/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // NULL = categoría default del sistema, visible para todos
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color').notNull().default('#6b7280'),
  icon: text('icon').notNull().default('tag'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const expenses = sqliteTable('expenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  categoryId: integer('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  // Monto en centavos (evita floats). $1.500,50 -> 150050
  amount: integer('amount').notNull(),
  expenseDate: text('expense_date').notNull(), // formato ISO: YYYY-MM-DD
  notes: text('notes'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(current_timestamp)`),
});

// --- Relaciones (para queries con .query y joins tipados) ---

export const usersRelations = relations(users, ({ many }) => ({
  expenses: many(expenses),
  categories: many(categories),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [expenses.categoryId],
    references: [categories.id],
  }),
}));

// --- Tipos inferidos (los vamos a reexportar desde src/types) ---

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;