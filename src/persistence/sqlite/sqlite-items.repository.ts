import { ItemChanges, ItemsRepository, } from '../../lists/items/items.repository.js';
import { Item } from '../../lists/items/entities/item.entity.js';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE, type MyDatabase } from './database.js';
import { items } from './schema.js';
import { and, eq } from 'drizzle-orm';
import { hasChanges } from './has-changes.js';

/**
 * Columns that an update can change, derived from the schema so that the types
 * stay in sync. A key that is not listed here fails the build.
 */
type DatabaseItemChanges = Partial<
  Pick<typeof items.$inferInsert, 'name' | 'pickedUpAt'>
>;

@Injectable()
export class SqliteItemsRepository implements ItemsRepository {
  constructor(@Inject(DATABASE) private readonly database: MyDatabase) {}

  async create(listId: number, name: string): Promise<Item | null> {
    if (!(await this.listExists(listId))) {
      return null;
    }

    const [row] = await this.database
      .insert(items)
      .values({
        listId,
        name,
      })
      .returning();
    return row;
  }

  async findAll(listId: number): Promise<Item[] | null> {
    if (!(await this.listExists(listId))) {
      return null;
    }

    return this.database.query.items.findMany({
      where: (items, { eq }) => eq(items.listId, listId),
      orderBy: (items, { asc }) => [asc(items.itemId)],
    });
  }

  async findById(listId: number, itemId: number): Promise<Item | null> {
    const row = await this.database.query.items.findFirst({
      where: (items, { eq, and }) =>
        and(eq(items.listId, listId), eq(items.itemId, itemId)),
    });

    return row ?? null;
  }

  async remove(listId: number, itemId: number): Promise<Item | null> {
    const [row] = await this.database
      .delete(items)
      .where(and(eq(items.listId, listId), eq(items.itemId, itemId)))
      .returning();

    return row ?? null;
  }

  async update(
    listId: number,
    itemId: number,
    changes: ItemChanges,
  ): Promise<Item | null> {
    const item = await this.findById(listId, itemId);
    if (item === null) {
      return null;
    }

    if (!hasChanges(changes)) {
      return item;
    }

    const dbChanges: DatabaseItemChanges = {
      name: changes.name,
      pickedUpAt: newPickedUpAt(item.pickedUpAt, changes.pickedUp),
    };

    const [updatedRow] = await this.database
      .update(items)
      .set(dbChanges)
      .where(and(eq(items.listId, listId), eq(items.itemId, itemId)))
      .returning();

    return updatedRow ?? null;
  }

  private async listExists(listId: number) {
    const row = await this.database.query.lists.findFirst({
      where: (lists, { eq }) => eq(lists.listId, listId),
    });
    return row !== undefined;
  }
}

/**
 * Computes the new pickedUpAt value from the current one and the requested change.
 * Returns undefined when there is no change, so that the column is left untouched.
 */
function newPickedUpAt(
  current: Date | null,
  pickedUp: boolean | undefined,
): Date | null | undefined {
  if (pickedUp === undefined) {
    return undefined;
  }
  // Keep the original timestamp if the item was already picked up
  return pickedUp ? (current ?? new Date()) : null;
}
