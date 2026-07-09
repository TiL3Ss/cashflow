// src/pages/api/auth/logout.ts
import type { APIRoute } from 'astro';
import { AUTH_COOKIE_NAME } from '@/lib/cookies';

export const POST: APIRoute = async ({ cookies }) => {
  cookies.delete(AUTH_COOKIE_NAME, { path: '/' });
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};