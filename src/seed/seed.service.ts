import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ListsService } from '../lists/lists.service.js';
import { ItemsService } from '../lists/items/items.service.js';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly listsService: ListsService,
    private readonly itemsService: ItemsService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.LGTTM_SEED_DATA === 'true') {
      this.logger.log('Seeding data...');
      await this.seed();
    } else {
      this.logger.debug("Don't seed data");
    }
  }

  private async seed() {
    await this.seedList(
      'Carrefour',
      ['Gorgonzola', 'Pain', 'Beurre', 'Glaces', 'Petits pots'],
      ['Ail', 'Oignons'],
    );

    await this.seedList('Decathlon', ['Catadioptres orange'], []);
  }

  private async listExists(title: string) {
    const lists = await this.listsService.findAll();
    return lists.some((l) => l.title === title);
  }

  private async seedList(
    title: string,
    toPickUpNames: string[],
    pickedUpNames: string[],
  ) {
    if (await this.listExists(title)) {
      // Don't seed the same list again
      return;
    }

    const list = await this.listsService.create({ title });

    for (const name of toPickUpNames) {
      await this.itemsService.create(list.listId, { name });
    }

    for (const name of pickedUpNames) {
      const item = await this.itemsService.create(list.listId, { name });
      await this.itemsService.update(list.listId, item.itemId, {
        pickedUp: true,
      });
    }
  }
}
