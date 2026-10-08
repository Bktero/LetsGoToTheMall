import { Inject, Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { DATABASE, type MyDatabase } from './database.js';
import { mkdirSync } from 'node:fs';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema.js';
import { dirname } from 'node:path';
import { LISTS_REPOSITORY } from '../../lists/lists.repository.js';
import { SqliteListsRepository } from './sqlite-lists.repository.js';
import { ITEMS_REPOSITORY } from '../../lists/items/items.repository.js';
import { SqliteItemsRepository } from './sqlite-items.repository.js';

@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory: createDatabase,
    },
    {
      provide: LISTS_REPOSITORY,
      useClass: SqliteListsRepository,
    },
    {
      provide: ITEMS_REPOSITORY,
      useClass: SqliteItemsRepository,
    },
  ],
  exports: [LISTS_REPOSITORY, ITEMS_REPOSITORY],
})
export class SqliteModule implements OnApplicationShutdown {
  private readonly logger = new Logger(SqliteModule.name);

  // A module class can inject providers and implement lifecycle hooks,
  // like any other provider. The module creates the database, so it closes it.
  constructor(@Inject(DATABASE) private readonly database: MyDatabase) {}

  onApplicationShutdown(): void {
    this.logger.log('Closing the database...');
    this.database.$client.close();
  }
}

function createDatabase(): MyDatabase {
  const logger = new Logger(SqliteModule.name);
  const path = process.env.LGTTM_DATABASE_PATH ?? 'working/lgttm.sqlite';
  if (path === ':memory:') {
    logger.warn(
      'Database will be created in memory: data will be lost when the application shuts down',
    );
  } else {
    mkdirSync(dirname(path), { recursive: true });
  }
  logger.log(`Connecting to database: ${path}...`);
  const conn = new Database(path);
  conn.pragma('foreign_keys = ON');
  const db = drizzle(conn, { schema });
  migrate(db, { migrationsFolder: 'drizzle' });
  return db;
}
