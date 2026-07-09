// src/db/index.ts
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const databaseUrl = import.meta.env?.DATABASE_URL ?? process.env.DATABASE_URL;
const authToken = import.meta.env?.TURSO_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN;

const client = createClient({
  url: databaseUrl!,
  authToken: authToken!,
});

export const db = drizzle(client, { schema });