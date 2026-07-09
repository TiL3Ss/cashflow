// src/pages/api/auth/register.ts
import type { APIRoute } from 'astro';
import { AuthService } from '@/services/auth.service';
import { registerSchema } from '@/lib/validators';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = await AuthService.register(parsed.data);

    return new Response(JSON.stringify({ user }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'EMAIL_ALREADY_EXISTS') {
      return new Response(
        JSON.stringify({ error: 'Ese email ya está registrado' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.error('Register error:', err);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};