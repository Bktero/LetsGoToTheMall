import { ListChanges, ListsRepository } from '../../lists/lists.repository.js';
import { List } from '../../lists/entities/list.entity.js';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE, type MyDatabase } from './database.js';
import { lists } from './schema.js';
import { eq } from 'drizzle-orm';
import { hasChanges } from './has-changes.js';

@Injectable()
export class SqliteListsRepository implements ListsRepository {
  constructor(@Inject(DATABASE) private readonly database: MyDatabase) {}

  async create(title: string): Promise<List> {
    const [row] = await this.database
      .insert(lists)
      .values({ title })
      .returning();
    return { ...row, items: [] };
  }

  async findAll(): Promise<List[]> {
    return this.database.query.lists.findMany({
      orderBy: (lists, { asc }) => [asc(lists.listId)],
      with: {
        items: {
          orderBy: (items, { asc }) => [asc(items.itemId)],
        },
      },
    });
  }

  async findById(listId: number): Promise<List | null> {
    const row = await this.database.query.lists.findFirst({
      where: (lists, { eq }) => eq(lists.listId, listId),
      with: {
        items: { orderBy: (items, { asc }) => [asc(items.itemId)] },
      },
    });
    return row ?? null;
  }

  async remove(listId: number): Promise<List | null> {
    const row = await this.findById(listId);
    if (row === null) {
      return null;
    }
    await this.database.delete(lists).where(eq(lists.listId, listId));
    return row;
  }

  async update(listId: number, changes: ListChanges): Promise<List | null> {
    const row = await this.findById(listId);
    if (row === null) {
      return null;
    }

    if (!hasChanges(changes)) {
      return row;
    }

    const [updatedRow] = await this.database
      .update(lists)
      .set(changes)
      .where(eq(lists.listId, listId))
      .returning();

    return { ...updatedRow, items: row.items };
  }
}
