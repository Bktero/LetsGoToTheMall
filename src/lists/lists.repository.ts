import type { List } from './entities/list.entity.js';

export type ListChanges = Partial<Pick<List, 'title'>>;

export interface ListsRepository {
  create(title: string): Promise<List>;
  findById(id: string): Promise<List | null>;
  findAll(): Promise<List[]>;
  update(id: string, changes: ListChanges): Promise<List | null>;
  delete(id: string): Promise<List | null>;
}

export const LISTS_REPOSITORY = Symbol('LISTS_REPOSITORY');
