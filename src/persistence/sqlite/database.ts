import type { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

export const DATABASE = Symbol('DATABASE');

export type MyDatabase = ReturnType<typeof drizzle<typeof schema>>;
