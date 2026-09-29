export interface ListResponse {
  id: string;
  title: string;
  createdAt: Date;
  items: Array<{
    id: number;
    name: string;
    isCompleted: boolean;
    position: number;
  }>;
}

export type ListChanges = Partial<Pick<ListResponse, 'title'>>;

export interface ListsRepository {
  create(title: string): Promise<ListResponse>;
  findById(listId: string): Promise<ListResponse | null>;
  findAll(): Promise<ListResponse[]>;
  update(id: string, changes: ListChanges): Promise<ListResponse | null>;
  delete(id: string): Promise<ListResponse | null>;
}

export const LISTS_REPOSITORY = Symbol('LISTS_REPOSITORY');
