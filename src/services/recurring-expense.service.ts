// src/services/recurring-expense.service.ts
import { db } from '@/db';
import { recurringExpenses, expenses, categories } from '@/db/schema';
import { eq, and, lte } from 'drizzle-orm';
import { toCents } from '@/utils/currency';
import { advanceDate } from '@/utils/dates';
import type { RecurringExpenseInput } from '@/lib/validators';

export class RecurringExpenseService {
  static async list(userId: number) {
    return db
      .select({
        id: recurringExpenses.id,
        title: recurringExpenses.title,
        amount: recurringExpenses.amount,
        frequency: recurringExpenses.frequency,
        nextRunDate: recurringExpenses.nextRunDate,
        active: recurringExpenses.active,
        notes: recurringExpenses.notes,
        category: {
          id: categories.id,
          name: categories.name,
          color: categories.color,
          icon: categories.icon,
        },
      })
      .from(recurringExpenses)
      .leftJoin(categories, eq(recurringExpenses.categoryId, categories.id))
      .where(eq(recurringExpenses.userId, userId));
  }

  /** Gastos programados activos cuya fecha ya llegó o pasó, y todavía no se confirmaron */
  static async getPending(userId: number, today: string) {
    return db
      .select({
        id: recurringExpenses.id,
        title: recurringExpenses.title,
        amount: recurringExpenses.amount,
        categoryId: recurringExpenses.categoryId,
        frequency: recurringExpenses.frequency,
        nextRunDate: recurringExpenses.nextRunDate,
        category: {
          name: categories.name,
          color: categories.color,
          icon: categories.icon,
        },
      })
      .from(recurringExpenses)
      .leftJoin(categories, eq(recurringExpenses.categoryId, categories.id))
      .where(
        and(
          eq(recurringExpenses.userId, userId),
          eq(recurringExpenses.active, true),
          lte(recurringExpenses.nextRunDate, today)
        )
      );
  }

  static async create(userId: number, input: RecurringExpenseInput) {
    const [created] = await db
      .insert(recurringExpenses)
      .values({
        userId,
        title: input.title,
        categoryId: input.categoryId ?? null,
        amount: toCents(input.amount),
        frequency: input.frequency,
        nextRunDate: input.nextRunDate,
        notes: input.notes ?? null,
      })
      .returning();
    return created;
  }

  static async toggleActive(userId: number, id: number, active: boolean) {
    const [updated] = await db
      .update(recurringExpenses)
      .set({ active, updatedAt: new Date().toISOString() })
      .where(and(eq(recurringExpenses.id, id), eq(recurringExpenses.userId, userId)))
      .returning();
    return updated ?? null;
  }

  static async remove(userId: number, id: number): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(recurringExpenses)
      .where(and(eq(recurringExpenses.id, id), eq(recurringExpenses.userId, userId)))
      .limit(1);

    if (!existing) return false;

    await db.delete(recurringExpenses).where(eq(recurringExpenses.id, id));
    return true;
  }

  /**
   * Confirma un gasto programado pendiente: crea el gasto real vinculado,
   * y avanza nextRunDate a la siguiente ocurrencia.
   */
  static async confirmOne(userId: number, recurringExpenseId: number) {
    const [recurring] = await db
      .select()
      .from(recurringExpenses)
      .where(and(eq(recurringExpenses.id, recurringExpenseId), eq(recurringExpenses.userId, userId)))
      .limit(1);

    if (!recurring) return null;

    const [createdExpense] = await db
      .insert(expenses)
      .values({
        userId,
        title: recurring.title,
        categoryId: recurring.categoryId,
        amount: recurring.amount,
        expenseDate: recurring.nextRunDate,
        notes: recurring.notes,
        recurringExpenseId: recurring.id,
      })
      .returning();

    const nextDate = advanceDate(recurring.nextRunDate, recurring.frequency as 'weekly' | 'monthly' | 'yearly');

    await db
      .update(recurringExpenses)
      .set({ nextRunDate: nextDate, updatedAt: new Date().toISOString() })
      .where(eq(recurringExpenses.id, recurring.id));

    return createdExpense;
  }

  /** Descarta la ocurrencia pendiente sin generar el gasto (avanza igual la fecha) */
  static async skipOne(userId: number, recurringExpenseId: number) {
    const [recurring] = await db
      .select()
      .from(recurringExpenses)
      .where(and(eq(recurringExpenses.id, recurringExpenseId), eq(recurringExpenses.userId, userId)))
      .limit(1);

    if (!recurring) return null;

    const nextDate = advanceDate(recurring.nextRunDate, recurring.frequency as 'weekly' | 'monthly' | 'yearly');

    const [updated] = await db
      .update(recurringExpenses)
      .set({ nextRunDate: nextDate, updatedAt: new Date().toISOString() })
      .where(eq(recurringExpenses.id, recurring.id))
      .returning();

    return updated;
  }
}