// src/middleware/index.ts
import { defineMiddleware } from 'astro:middleware';
import { verifyJWT } from '@/lib/jwt';
import { AUTH_COOKIE_NAME } from '@/lib/cookies';

const PROTECTED_ROUTES = ['/dashboard', '/expenses'];
const AUTH_ROUTES = ['/login', '/register'];

export const onRequest = defineMiddleware(async (context, next) => {
  const token = context.cookies.get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? verifyJWT(token) : null;

  context.locals.user = payload
    ? { id: String(payload.id), name: payload.name, email: payload.email }
    : null;

  const pathname = context.url.pathname;
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected && !context.locals.user) {
    return context.redirect('/login');
  }

  if (isAuthRoute && context.locals.user) {
    return context.redirect('/dashboard');
  }

  return next();
});