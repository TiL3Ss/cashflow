// src/pages/api/categories/index.ts
import type { APIRoute } from 'astro';
import { CategoryService } from '@/services/category.service';

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await CategoryService.listForUser(Number(user.id));

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};