// src/services/savings.service.ts
import { db } from '@/db';
import { savingsMovements } from '@/db/schema';
import { eq, desc, sql, and, gte, lte } from 'drizzle-orm';
import { toCents } from '@/utils/currency';
import type { SavingsMovementInput } from '@/lib/validators';

export class SavingsService {
  static async getBalance(userId: number): Promise<number> {
    const [result] = await db
      .select({ balance: sql<number>`COALESCE(SUM(${savingsMovements.amount}), 0)` })
      .from(savingsMovements)
      .where(eq(savingsMovements.userId, userId));
    return Number(result?.balance ?? 0);
  }

  static async list(userId: number) {
    return db
      .select()
      .from(savingsMovements)
      .where(eq(savingsMovements.userId, userId))
      .orderBy(desc(savingsMovements.movementDate), desc(savingsMovements.id));
  }

  static async addMovement(userId: number, input: SavingsMovementInput) {
    const [created] = await db
      .insert(savingsMovements)
      .values({
        userId,
        amount: toCents(input.amount), // puede ser negativo (retiro) o positivo (depósito)
        movementDate: input.movementDate,
        notes: input.notes ?? null,
      })
      .returning();
    return created;
  }

  static async getNetMovementsInRange(userId: number, options: { from: string; to: string }) {
    const [result] = await db
      .select({ net: sql<number>`COALESCE(SUM(${savingsMovements.amount}), 0)` })
      .from(savingsMovements)
      .where(
        and(
          eq(savingsMovements.userId, userId),
          gte(savingsMovements.movementDate, options.from),
          lte(savingsMovements.movementDate, options.to)
        )
      );
    return Number(result?.net ?? 0);
  }

  static async removeMovement(userId: number, movementId: number): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(savingsMovements)
      .where(eq(savingsMovements.id, movementId))
      .limit(1);

    if (!existing || existing.userId !== userId) return false;

    await db.delete(savingsMovements).where(eq(savingsMovements.id, movementId));
    return true;
  }
}