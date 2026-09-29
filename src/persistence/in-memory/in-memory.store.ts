import { Injectable } from '@nestjs/common';
import { List } from '../../lists/entities/list.entity.js';

@Injectable()
export class InMemoryStore {
  private nextListId: number = 1;
  private nextItemId: number = 1;

  // TODO: seeds are disabled so tests start from an empty store; move them out of the store
  // private firstList: List = {
  //   listId: this.generateNextListId(),
  //   title: 'My first list',
  //   createdAt: new Date(),
  //   items: [
  //     {
  //       itemId: this.generateNextItemId(),
  //       name: 'Gorgonzola',
  //       createdAt: new Date(),
  //       pickedUpAt: null,
  //     },
  //     {
  //       itemId: this.generateNextItemId(),
  //       name: 'Bread',
  //       createdAt: new Date(),
  //       pickedUpAt: null,
  //     },
  //   ],
  // };
  //
  // private secondList = {
  //   listId: this.generateNextListId(),
  //   title: 'My second list',
  //   createdAt: new Date(),
  //   items: [],
  // } satisfies List;

  readonly lists = new Map<number, List>();
  // readonly lists = new Map<number, List>([
  //   [this.firstList.listId, this.firstList],
  //   [this.secondList.listId, this.secondList],
  // ]);

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
