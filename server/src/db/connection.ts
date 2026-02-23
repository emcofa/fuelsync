import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2';
import type { Database } from './types';

let instance: Kysely<Database> | null = null;

export const db: Kysely<Database> = new Proxy({} as Kysely<Database>, {
  get(_target, prop: string | symbol) {
    if (!instance) {
      const pool = createPool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });
      instance = new Kysely<Database>({
        dialect: new MysqlDialect({ pool }),
      });
    }
    const value = instance[prop as keyof Kysely<Database>];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});
