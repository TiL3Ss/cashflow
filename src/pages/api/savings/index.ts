// src/pages/api/savings/index.ts
import type { APIRoute } from 'astro';
import { SavingsService } from '@/services/savings.service';
import { savingsMovementSchema } from '@/lib/validators';

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 });

  const [balance, movements] = await Promise.all([
    SavingsService.getBalance(Number(user.id)),
    SavingsService.list(Number(user.id)),
  ]);

  return new Response(JSON.stringify({ data: { balance, movements } }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ locals, request }) => {
  const user = locals.user;
  if (!user) return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 });

  const body = await request.json();
  const parsed = savingsMovementSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const created = await SavingsService.addMovement(Number(user.id), parsed.data);

  return new Response(JSON.stringify({ data: created }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};