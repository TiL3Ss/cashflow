// src/pages/api/recurring-expenses/[id]/skip.ts
import type { APIRoute } from 'astro';
import { RecurringExpenseService } from '@/services/recurring-expense.service';

export const POST: APIRoute = async ({ locals, params }) => {
  const user = locals.user;
  if (!user) return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 });

  const id = Number(params.id);
  if (isNaN(id)) return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });

  const result = await RecurringExpenseService.skipOne(Number(user.id), id);
  if (!result) return new Response(JSON.stringify({ error: 'No encontrado' }), { status: 404 });

  return new Response(JSON.stringify({ data: result }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};