// src/services/expense.service.ts
import { db } from '@/db';
import { expenses, categories } from '@/db/schema';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';
import { toCents } from '@/utils/currency';
import type { CreateExpenseInput, UpdateExpenseInput } from '@/lib/validators';

export class ExpenseService {
  /** Lista los gastos de un usuario, opcionalmente filtrados por rango de fecha (mes) */
  static async list(userId: number, options?: { from?: string; to?: string }) {
    const conditions = [eq(expenses.userId, userId)];

    if (options?.from) conditions.push(gte(expenses.expenseDate, options.from));
    if (options?.to) conditions.push(lte(expenses.expenseDate, options.to));

    return db
      .select({
        id: expenses.id,
        title: expenses.title,
        amount: expenses.amount,
        expenseDate: expenses.expenseDate,
        notes: expenses.notes,
        createdAt: expenses.createdAt,
        category: {
          id: categories.id,
          name: categories.name,
          color: categories.color,
          icon: categories.icon,
        },
      })
      .from(expenses)
      .leftJoin(categories, eq(expenses.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(desc(expenses.expenseDate));
  }

  /** Obtiene un gasto puntual, garantizando que pertenezca al usuario */
  static async getById(userId: number, expenseId: number) {
    const [expense] = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.id, expenseId), eq(expenses.userId, userId)))
      .limit(1);

    return expense ?? null;
  }

  static async create(userId: number, input: CreateExpenseInput) {
    const [created] = await db
      .insert(expenses)
      .values({
        userId,
        title: input.title,
        categoryId: input.categoryId ?? null,
        amount: toCents(input.amount),
        expenseDate: input.expenseDate,
        notes: input.notes ?? null,
      })
      .returning();

    return created;
  }

  /** Actualiza un gasto SOLO si pertenece al usuario (retorna null si no existe o no es suyo) */
  static async update(userId: number, expenseId: number, input: UpdateExpenseInput) {
    const existing = await this.getById(userId, expenseId);
    if (!existing) return null;

    const updateData: Record<string, unknown> = {
      updatedAt: sql`(current_timestamp)`,
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.categoryId !== undefined) updateData.categoryId = input.categoryId;
    if (input.amount !== undefined) updateData.amount = toCents(input.amount);
    if (input.expenseDate !== undefined) updateData.expenseDate = input.expenseDate;
    if (input.notes !== undefined) updateData.notes = input.notes;

    const [updated] = await db
      .update(expenses)
      .set(updateData)
      .where(and(eq(expenses.id, expenseId), eq(expenses.userId, userId)))
      .returning();

    return updated;
  }

  /** Elimina un gasto SOLO si pertenece al usuario */
  static async remove(userId: number, expenseId: number): Promise<boolean> {
    const existing = await this.getById(userId, expenseId);
    if (!existing) return false;

    await db
      .delete(expenses)
      .where(and(eq(expenses.id, expenseId), eq(expenses.userId, userId)));

    return true;
  }

  /** Total gastado por un usuario en un rango (para el dashboard) */
  static async getTotal(userId: number, options?: { from?: string; to?: string }) {
    const conditions = [eq(expenses.userId, userId)];
    if (options?.from) conditions.push(gte(expenses.expenseDate, options.from));
    if (options?.to) conditions.push(lte(expenses.expenseDate, options.to));

    const [result] = await db
      .select({ total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)` })
      .from(expenses)
      .where(and(...conditions));

    return Number(result?.total ?? 0);
  }

  /** Totales agrupados por categoría (para gráficos del dashboard) */
  static async getTotalsByCategory(userId: number, options?: { from?: string; to?: string }) {
    const conditions = [eq(expenses.userId, userId)];
    if (options?.from) conditions.push(gte(expenses.expenseDate, options.from));
    if (options?.to) conditions.push(lte(expenses.expenseDate, options.to));

    const rows = await db
    .select({
      categoryId: categories.id,
      categoryName: categories.name,
      categoryColor: categories.color,
      total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .leftJoin(categories, eq(expenses.categoryId, categories.id))
    .where(and(...conditions))
    .groupBy(categories.id);

  return rows.map((r) => ({ ...r, total: Number(r.total) }));   
  }
}