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

export const settingsSchema = z.object({
  monthlyIncome: z.number().nonnegative('El sueldo no puede ser negativo'),
  incomeDay: z.number().int().min(1).max(31, 'El día debe estar entre 1 y 31'),
});

export const savingsMovementSchema = z.object({
  amount: z.number().refine((val) => val !== 0, 'El monto no puede ser 0'),
  movementDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  notes: z.string().max(500).nullable().optional(),
});

export const recurringExpenseSchema = z.object({
  title: z.string().trim().min(1, 'El título es requerido').max(200),
  categoryId: z.number().int().positive().nullable().optional(),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  frequency: z.enum(['weekly', 'monthly', 'yearly']),
  nextRunDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  notes: z.string().max(1000).nullable().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type SavingsMovementInput = z.infer<typeof savingsMovementSchema>;
export type RecurringExpenseInput = z.infer<typeof recurringExpenseSchema>;
