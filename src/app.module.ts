import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ListsModule } from './lists/lists.module.js';

@Module({
  imports: [ListsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
