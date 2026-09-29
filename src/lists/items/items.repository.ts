import { Item } from './entities/item.entity.js';

/**
 * Fields that can be changed on an item. An undefined field means "no change".
 */
export type ItemChanges = Partial<Pick<Item, 'name'>> & {
  /**
   * true marks the item as picked up now (keeping the existing timestamp if it
   * was already picked up), false marks it as not picked up.
   */
  pickedUp?: boolean;
};

export interface ItemsRepository {
  create(listId: number, name: string): Promise<Item | null>;
  findById(listId: number, itemId: number): Promise<Item | null>;
  findAll(listId: number): Promise<Item[] | null>;
  update(
    listId: number,
    itemId: number,
    changes: ItemChanges,
  ): Promise<Item | null>;
  remove(listId: number, itemId: number): Promise<Item | null>;
}

export const ITEMS_REPOSITORY = Symbol('ITEMS_REPOSITORY');
