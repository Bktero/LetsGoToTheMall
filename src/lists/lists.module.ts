import { Module } from '@nestjs/common';
import { ListsService } from './lists.service.js';
import { ListsController } from './lists.controller.js';
import { InMemoryListsRepository } from './in-memory-lists.repository.js';
import { LISTS_REPOSITORY } from './lists.repository.js';

@Module({
  controllers: [ListsController],
  providers: [
    ListsService,
    {
      provide: LISTS_REPOSITORY,
      useClass: InMemoryListsRepository,
    },
  ],
})
export class ListsModule {}
