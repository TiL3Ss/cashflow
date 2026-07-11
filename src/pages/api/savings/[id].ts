// src/pages/api/savings/[id].ts
import type { APIRoute } from 'astro';
import { SavingsService } from '@/services/savings.service';

export const DELETE: APIRoute = async ({ locals, params }) => {
  const user = locals.user;
  if (!user) return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 });

  const movementId = Number(params.id);
  if (isNaN(movementId)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });
  }

  const deleted = await SavingsService.removeMovement(Number(user.id), movementId);

  if (!deleted) {
    return new Response(JSON.stringify({ error: 'Movimiento no encontrado' }), { status: 404 });
  }

  return new Response(null, { status: 204 });
};