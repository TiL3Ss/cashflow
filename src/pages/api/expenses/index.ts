// src/pages/api/expenses/index.ts
import type { APIRoute } from 'astro';
import { ExpenseService } from '@/services/expense.service';
import { createExpenseSchema } from '@/lib/validators';

export const GET: APIRoute = async ({ locals, url }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const from = url.searchParams.get('from') ?? undefined;
  const to = url.searchParams.get('to') ?? undefined;

  const data = await ExpenseService.list(Number(user.id), { from, to });

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ locals, request }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();
  const parsed = createExpenseSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const created = await ExpenseService.create(Number(user.id), parsed.data);

  return new Response(JSON.stringify({ data: created }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};