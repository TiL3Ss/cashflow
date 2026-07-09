// src/lib/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = import.meta.env?.JWT_SECRET ?? process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  id: number;
  email: string;
  name: string;
}

export function signJWT(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}