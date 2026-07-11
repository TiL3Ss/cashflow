// src/pages/api/recurring-expenses/[id].ts
import type { APIRoute } from 'astro';
import { RecurringExpenseService } from '@/services/recurring-expense.service';

export const DELETE: APIRoute = async ({ locals, params }) => {
  const user = locals.user;
  if (!user) return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 });

  const id = Number(params.id);
  if (isNaN(id)) return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });

  const deleted = await RecurringExpenseService.remove(Number(user.id), id);
  if (!deleted) return new Response(JSON.stringify({ error: 'No encontrado' }), { status: 404 });

  return new Response(null, { status: 204 });
};