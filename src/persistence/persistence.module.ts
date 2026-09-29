import { Global, Module } from '@nestjs/common';
import { InMemoryModule } from './in-memory/in-memory.module.js';

@Module({
  imports: [InMemoryModule],
  exports: [InMemoryModule],
})
@Global()
export class PersistenceModule {}
