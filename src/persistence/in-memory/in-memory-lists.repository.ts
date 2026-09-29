import { Injectable } from '@nestjs/common';
import { List } from '../../lists/entities/list.entity.js';
import { ListChanges, ListsRepository } from '../../lists/lists.repository.js';
import { InMemoryStore } from './in-memory.store.js';

@Injectable()
export class InMemoryListsRepository implements ListsRepository {
  constructor(private readonly store: InMemoryStore) {}

  private getList(listId: number) {
    return this.store.lists.get(listId) ?? null;
  }

  async create(title: string): Promise<List> {
    const newList: List = {
      listId: this.store.generateNextListId(),
      title,
      createdAt: new Date(),
      items: [],
    };
    this.store.lists.set(newList.listId, newList);
    return newList;
  }

  async findById(listId: number): Promise<List | null> {
    return this.getList(listId);
  }

  async findAll(): Promise<List[]> {
    const iter = this.store.lists.values();
    return Array.from(iter);
  }

  async update(listId: number, changes: ListChanges): Promise<List | null> {
    const list = this.getList(listId);
    if (list === null) {
      return null;
    }
    if (changes.title !== undefined) {
      list.title = changes.title;
    }
    return list;
  }

  async remove(listId: number): Promise<List | null> {
    const list = this.getList(listId);
    if (list === null) {
      return null;
    }
    this.store.lists.delete(listId);
    return list;
  }
}
