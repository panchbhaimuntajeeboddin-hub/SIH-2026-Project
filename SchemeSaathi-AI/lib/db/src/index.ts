import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/schemesaathi";

if (!process.env.DATABASE_URL) {
  console.warn("⚠️ DATABASE_URL environment variable is not set. Using default local connection string.");
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });

export * from "./schema";
export { eq, and, or, ilike, count } from "drizzle-orm";
