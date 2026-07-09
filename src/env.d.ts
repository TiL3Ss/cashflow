// src/env.d.ts
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user: {
      id: string;
      name: string;
      email: string;
    } | null;
  }
}

interface ImportMetaEnv {
  readonly DATABASE_URL: string;
  readonly TURSO_AUTH_TOKEN: string;
  readonly JWT_SECRET: string;
  readonly PUBLIC_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}