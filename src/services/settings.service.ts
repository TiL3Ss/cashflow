// src/services/settings.service.ts
import { db } from '@/db';
import { userSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { toCents } from '@/utils/currency';
import type { SettingsInput } from '@/lib/validators';

export class SettingsService {
  static async getByUserId(userId: number) {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);
    return settings ?? null;
  }

  /** Devuelve la config real, o un default en memoria si el usuario nunca la configuró */
  static async getOrDefault(userId: number) {
    const existing = await this.getByUserId(userId);
    if (existing) return existing;
    return { monthlyIncome: 0, incomeDay: 1, configured: false as const };
  }

  static async upsert(userId: number, input: SettingsInput) {
    const existing = await this.getByUserId(userId);
    const payload = {
      monthlyIncome: toCents(input.monthlyIncome),
      incomeDay: input.incomeDay,
    };

    if (existing) {
      const [updated] = await db
        .update(userSettings)
        .set({ ...payload, updatedAt: new Date().toISOString() })
        .where(eq(userSettings.userId, userId))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(userSettings)
      .values({ userId, ...payload })
      .returning();
    return created;
  }
}