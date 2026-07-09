// src/db/seed.ts
import 'dotenv/config';
import { db } from './index';
import { categories } from './schema';
import { isNull } from 'drizzle-orm';

const defaultCategories = [
  { name: 'Comida', color: '#f59e0b', icon: 'utensils' },
  { name: 'Transporte', color: '#3b82f6', icon: 'car' },
  { name: 'Vivienda', color: '#8b5cf6', icon: 'home' },
  { name: 'Salud', color: '#ef4444', icon: 'heart-pulse' },
  { name: 'Entretenimiento', color: '#ec4899', icon: 'film' },
  { name: 'Servicios', color: '#06b6d4', icon: 'plug' },
  { name: 'Otros', color: '#6b7280', icon: 'tag' },
];

async function seed() {
  const existing = await db.select().from(categories).where(isNull(categories.userId));
  if (existing.length > 0) {
    console.log(`Ya hay ${existing.length} categorías default, no se vuelve a sembrar`);
    return;
  }
  await db.insert(categories).values(defaultCategories);
  console.log('✅ Categorías default insertadas');
}

seed();