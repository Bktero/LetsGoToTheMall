import { Injectable } from '@nestjs/common';
import { List } from '../../lists/entities/list.entity.js';

@Injectable()
export class InMemoryStore {
  private nextListId: number = 1;
  private nextItemId: number = 1;

  readonly lists = new Map<number, List>();

  /**
   * Generate the next ID for a list.
   */
  generateNextListId(): number {
    return this.nextListId++;
  }

  /**
   * Generate the next ID for an item.
   */
  generateNextItemId(): number {
    return this.nextItemId++;
  }
}
