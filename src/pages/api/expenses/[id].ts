// src/pages/api/expenses/[id].ts
import type { APIRoute } from 'astro';
import { ExpenseService } from '@/services/expense.service';
import { updateExpenseSchema } from '@/lib/validators';

export const GET: APIRoute = async ({ locals, params }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const expenseId = Number(params.id);
  if (isNaN(expenseId)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const expense = await ExpenseService.getById(Number(user.id), expenseId);

  if (!expense) {
    return new Response(JSON.stringify({ error: 'Gasto no encontrado' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ data: expense }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PUT: APIRoute = async ({ locals, params, request }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const expenseId = Number(params.id);
  if (isNaN(expenseId)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();
  const parsed = updateExpenseSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const updated = await ExpenseService.update(Number(user.id), expenseId, parsed.data);

  if (!updated) {
    return new Response(JSON.stringify({ error: 'Gasto no encontrado' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ data: updated }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ locals, params }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const expenseId = Number(params.id);
  if (isNaN(expenseId)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const deleted = await ExpenseService.remove(Number(user.id), expenseId);

  if (!deleted) {
    return new Response(JSON.stringify({ error: 'Gasto no encontrado' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(null, { status: 204 });
};