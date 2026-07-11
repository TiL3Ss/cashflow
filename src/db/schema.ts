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
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  amount: integer('amount').notNull(),
  expenseDate: text('expense_date').notNull(),
  notes: text('notes'),
  recurringExpenseId: integer('recurring_expense_id').references(() => recurringExpenses.id, {
    onDelete: 'set null',
  }), 
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
  updatedAt: text('updated_at').notNull().default(sql`(current_timestamp)`),
});

// --- Relaciones (para queries con .query y joins tipados) ---

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, { fields: [expenses.userId], references: [users.id] }),
  category: one(categories, { fields: [expenses.categoryId], references: [categories.id] }),
  recurringExpense: one(recurringExpenses, {
    fields: [expenses.recurringExpenseId],
    references: [recurringExpenses.id],
  }),
}));

export const userSettings = sqliteTable('user_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  monthlyIncome: integer('monthly_income').notNull().default(0), // centavos
  incomeDay: integer('income_day').notNull().default(1), // día del mes 1-31 en que se acredita
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
  updatedAt: text('updated_at').notNull().default(sql`(current_timestamp)`),
});

// --- Gastos programados / recurrentes (feature 3) ---
export const recurringExpenses = sqliteTable('recurring_expenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  amount: integer('amount').notNull(), // centavos
  frequency: text('frequency', { enum: ['weekly', 'monthly', 'yearly'] }).notNull(),
  nextRunDate: text('next_run_date').notNull(), // ISO YYYY-MM-DD: próxima fecha en que corresponde generar el gasto
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
  updatedAt: text('updated_at').notNull().default(sql`(current_timestamp)`),
});

// --- Ahorro (feature 4) ---
export const savingsMovements = sqliteTable('savings_movements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // centavos. Positivo = depósito, negativo = retiro
  movementDate: text('movement_date').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
});


export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, { fields: [userSettings.userId], references: [users.id] }),
}));

export const recurringExpensesRelations = relations(recurringExpenses, ({ one, many }) => ({
  user: one(users, { fields: [recurringExpenses.userId], references: [users.id] }),
  category: one(categories, { fields: [recurringExpenses.categoryId], references: [categories.id] }),
  generatedExpenses: many(expenses),
}));

export const savingsMovementsRelations = relations(savingsMovements, ({ one }) => ({
  user: one(users, { fields: [savingsMovements.userId], references: [users.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  expenses: many(expenses),
  categories: many(categories),
}));



// --- Tipos inferidos (los vamos a reexportar desde src/types) ---

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;


export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;

export type RecurringExpense = typeof recurringExpenses.$inferSelect;
export type NewRecurringExpense = typeof recurringExpenses.$inferInsert;

export type SavingsMovement = typeof savingsMovements.$inferSelect;
export type NewSavingsMovement = typeof savingsMovements.$inferInsert;