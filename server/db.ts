// database.ts
import { Pool } from 'pg'; // ← using native pg here
import { drizzle } from 'drizzle-orm/node-postgres'; // ← not neon-serverless
import * as schema from '@shared/schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
