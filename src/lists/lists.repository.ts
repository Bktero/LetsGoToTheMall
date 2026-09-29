import type { List } from './entities/list.entity.js';

export type ListChanges = Partial<Pick<List, 'title'>>;

export interface ListsRepository {
  create(title: string): Promise<List>;
  findById(listId: number): Promise<List | null>;
  findAll(): Promise<List[]>;
  update(listId: number, changes: ListChanges): Promise<List | null>;
  remove(listId: number): Promise<List | null>;
}

export const LISTS_REPOSITORY = Symbol('LISTS_REPOSITORY');
