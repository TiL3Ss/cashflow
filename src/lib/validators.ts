// src/lib/validators.ts (agregar al archivo existente)
import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().trim().toLowerCase().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const createExpenseSchema = z.object({
  title: z.string().trim().min(1, 'El título es requerido').max(200),
  categoryId: z.number().int().positive().nullable().optional(),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (formato YYYY-MM-DD)'),
  notes: z.string().max(1000).nullable().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;