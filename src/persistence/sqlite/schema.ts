import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const lists = sqliteTable('lists', {
  listId: integer('list_id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const items = sqliteTable('items', {
  itemId: integer('item_id').primaryKey({ autoIncrement: true }),
  listId: integer('list_id')
    .notNull()
    .references(() => lists.listId, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  pickedUpAt: integer('picked_up_at', { mode: 'timestamp_ms' }),
});

export const listsRelations = relations(lists, ({ many }) => ({
  items: many(items),
}));

export const itemsRelations = relations(items, ({ one }) => ({
  list: one(lists, {
    fields: [items.listId],
    references: [lists.listId],
  }),
}));
