// src/pages/api/recurring-expenses/index.ts
import type { APIRoute } from 'astro';
import { RecurringExpenseService } from '@/services/recurring-expense.service';
import { recurringExpenseSchema } from '@/lib/validators';

export const GET: APIRoute = async ({ locals, url }) => {
  const user = locals.user;
  if (!user) return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 });

  const pendingOnly = url.searchParams.get('pending') === 'true';

  if (pendingOnly) {
    const today = new Date().toISOString().slice(0, 10);
    const data = await RecurringExpenseService.getPending(Number(user.id), today);
    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await RecurringExpenseService.list(Number(user.id));
  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ locals, request }) => {
  const user = locals.user;
  if (!user) return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 });

  const body = await request.json();
  const parsed = recurringExpenseSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const created = await RecurringExpenseService.create(Number(user.id), parsed.data);

  return new Response(JSON.stringify({ data: created }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};