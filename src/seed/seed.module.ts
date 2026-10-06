import { Module } from '@nestjs/common';
import { SeedService } from './seed.service.js';
import { ListsModule } from '../lists/lists.module.js';
import { ItemsModule } from '../lists/items/items.module.js';

@Module({
  imports: [ListsModule, ItemsModule],
  providers: [SeedService],
})
export class SeedModule {}
