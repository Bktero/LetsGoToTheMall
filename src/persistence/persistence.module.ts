import { Global, Module } from '@nestjs/common';
import { SqliteModule } from './sqlite/sqlite.module.js';

@Module({
  imports: [SqliteModule],
  exports: [SqliteModule],
})
@Global()
export class PersistenceModule {}
