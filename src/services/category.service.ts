// src/services/category.service.ts
import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq, or, isNull } from 'drizzle-orm';

export class CategoryService {
  /** Devuelve las categorías default (userId NULL) + las propias del usuario */
  static async listForUser(userId: number) {
    return db
      .select()
      .from(categories)
      .where(or(isNull(categories.userId), eq(categories.userId, userId)));
  }
}