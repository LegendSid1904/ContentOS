import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

type DB = ReturnType<typeof drizzle>;

function createDb(): DB {
  const connectionString = process.env.SUPABASE_DATABASE_URL;
  if (!connectionString || connectionString === "/" || !connectionString.startsWith("postgres")) {
    throw new Error("SUPABASE_DATABASE_URL is not configured");
  }
  const client = postgres(connectionString);
  return drizzle(client, { schema });
}

let _db: DB | null = null;

export function getDb(): DB {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

export const db = new Proxy<DB>({} as DB, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop);
  },
});
