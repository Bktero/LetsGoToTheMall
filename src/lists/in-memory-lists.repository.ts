import { Injectable } from '@nestjs/common';
import {
  ListChanges,
  ListResponse,
  ListsRepository,
} from './lists.repository.js';

@Injectable()
export class InMemoryListsRepository implements ListsRepository {
  private firstList: ListResponse = {
    id: 'mock-uuid-1234',
    title: 'My first list',
    createdAt: new Date(),
    items: [
      { id: 1, name: 'Gorgonzola', isCompleted: false, position: 0 },
      { id: 2, name: 'Bread', isCompleted: false, position: 1 },
    ],
  };

  private lists = new Map<string, ListResponse>([
    [this.firstList.id, this.firstList],
    [
      'mock-uuid-5678',
      {
        id: 'mock-uuid-5678',
        title: 'My second list',
        createdAt: new Date(),
        items: [],
      } satisfies ListResponse,
    ],
  ]);

  async create(title: string): Promise<ListResponse> {
    const newList: ListResponse = {
      id: `mock-uuid-${Date.now()}`,
      title,
      createdAt: new Date(),
      items: [],
    };
    this.lists.set(newList.id, newList);
    return newList;
  }

  async findById(id: string): Promise<ListResponse | null> {
    return this.lists.get(id) ?? null;
  }

  async findAll(): Promise<ListResponse[]> {
    const iter = this.lists.values();
    return Array.from(iter);
  }

  async update(id: string, changes: ListChanges): Promise<ListResponse | null> {
    const list = this.lists.get(id);
    if (list === undefined) {
      return null;
    }
    if (changes.title !== undefined) {
      list.title = changes.title;
    }
    return list;
  }

  async delete(id: string): Promise<ListResponse | null> {
    const list = this.lists.get(id);
    if (list === undefined) {
      return null;
    }
    this.lists.delete(id);
    return list;
  }
}
