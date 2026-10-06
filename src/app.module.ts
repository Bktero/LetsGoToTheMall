import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { ListsModule } from './lists/lists.module.js';
import { ItemsModule } from './lists/items/items.module.js';
import { PersistenceModule } from './persistence/persistence.module.js';
import { SeedModule } from './seed/seed.module.js';

@Module({
  imports: [ListsModule, ItemsModule, PersistenceModule, SeedModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
