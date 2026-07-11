// src/pages/api/settings/index.ts
import type { APIRoute } from 'astro';
import { SettingsService } from '@/services/settings.service';
import { settingsSchema } from '@/lib/validators';
import { fromCents } from '@/utils/currency';

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 });
  }

  const settings = await SettingsService.getOrDefault(Number(user.id));

  return new Response(
    JSON.stringify({
      data: {
        monthlyIncome: fromCents(settings.monthlyIncome),
        incomeDay: settings.incomeDay,
        configured: 'configured' in settings ? settings.configured : true,
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};

export const PUT: APIRoute = async ({ locals, request }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 });
  }

  const body = await request.json();
  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const updated = await SettingsService.upsert(Number(user.id), parsed.data);

  return new Response(JSON.stringify({ data: updated }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};