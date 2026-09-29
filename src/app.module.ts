import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { ListsModule } from './lists/lists.module.js';

@Module({
  imports: [ListsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
