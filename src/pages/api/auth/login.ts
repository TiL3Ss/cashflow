// src/pages/api/auth/login.ts
import type { APIRoute } from 'astro';
import { AuthService } from '@/services/auth.service';
import { loginSchema } from '@/lib/validators';
import { signJWT } from '@/lib/jwt';
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from '@/lib/cookies';

export const POST: APIRoute = async ({ request, cookies }) => {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const user = await AuthService.validateCredentials(
    parsed.data.email,
    parsed.data.password
  );

  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Credenciales inválidas' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const token = signJWT({ id: user.id, email: user.email, name: user.name });
  cookies.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);

  return new Response(JSON.stringify({ user }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};