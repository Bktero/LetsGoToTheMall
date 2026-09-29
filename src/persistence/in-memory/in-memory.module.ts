import { Module } from '@nestjs/common';
import { InMemoryStore } from './in-memory.store.js';
import { LISTS_REPOSITORY } from '../../lists/lists.repository.js';
import { InMemoryListsRepository } from './in-memory-lists.repository.js';
import { ITEMS_REPOSITORY } from '../../lists/items/items.repository.js';
import { InMemoryItemsRepository } from './in-memory-items.repository.js';

@Module({
  providers: [
    InMemoryStore,
    {
      provide: LISTS_REPOSITORY,
      useClass: InMemoryListsRepository,
    },
    {
      provide: ITEMS_REPOSITORY,
      useClass: InMemoryItemsRepository,
    },
  ],
  exports: [LISTS_REPOSITORY, ITEMS_REPOSITORY],
})
export class InMemoryModule {}
