import { Injectable } from '@nestjs/common';
import {
  ItemChanges,
  ItemsRepository,
} from '../../lists/items/items.repository.js';
import { Item } from '../../lists/items/entities/item.entity.js';
import { InMemoryStore } from './in-memory.store.js';

@Injectable()
export class InMemoryItemsRepository implements ItemsRepository {
  constructor(private readonly store: InMemoryStore) {}

  private getList(listId: number) {
    return this.store.lists.get(listId) ?? null;
  }

  private getItem(listId: number, itemId: number) {
    const list = this.getList(listId);
    if (list === null) {
      return null;
    }
    return list.items.find((item) => item.itemId === itemId) ?? null;
  }

  async create(listId: number, name: string): Promise<Item | null> {
    const list = this.getList(listId);
    if (list === null) {
      return null;
    }
    const newItem: Item = {
      createdAt: new Date(),
      itemId: this.store.generateNextItemId(),
      name,
      pickedUpAt: null,
    };
    list.items.push(newItem);
    return newItem;
  }

  async findById(listId: number, itemId: number): Promise<Item | null> {
    return this.getItem(listId, itemId);
  }

  async findAll(listId: number): Promise<Item[] | null> {
    const list = this.getList(listId);
    if (list === null) {
      return null;
    }
    const iter = list.items.values();
    return Array.from(iter);
  }

  async update(
    listId: number,
    itemId: number,
    changes: ItemChanges,
  ): Promise<Item | null> {
    const item = this.getItem(listId, itemId);
    if (item === null) {
      return null;
    }
    if (changes.name !== undefined) {
      item.name = changes.name;
    }
    if (changes.pickedUp !== undefined) {
      if (changes.pickedUp) {
        // Keep the original timestamp if the item was already picked up
        item.pickedUpAt ??= new Date();
      } else {
        item.pickedUpAt = null;
      }
    }
    return item;
  }

  async remove(listId: number, itemId: number): Promise<Item | null> {
    const list = this.getList(listId);
    if (list === null) {
      return null;
    }
    const index = list.items.findIndex((item) => item.itemId === itemId);
    if (index === -1) {
      return null;
    }
    const [removed] = list.items.splice(index, 1);
    return removed;
  }
}
