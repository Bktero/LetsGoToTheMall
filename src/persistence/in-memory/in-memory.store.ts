import { Injectable, Logger } from '@nestjs/common';
import { List } from '../../lists/entities/list.entity.js';

@Injectable()
export class InMemoryStore {
  private nextListId: number = 1;
  private nextItemId: number = 1;
  private logger = new Logger(InMemoryStore.name);

  readonly lists = new Map<number, List>();

  /**
   * Generate the next ID for a list.
   */
  generateNextListId(): number {
    this.logger.log('Generate a new list id');
    return this.nextListId++;
  }

  /**
   * Generate the next ID for an item.
   */
  generateNextItemId(): number {
    this.logger.log('Generate a new item id');
    return this.nextItemId++;
  }
}
