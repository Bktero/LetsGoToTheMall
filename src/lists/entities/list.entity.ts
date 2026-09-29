import { Item } from '../items/entities/item.entity.js';

export class List {
  listId: number;
  title: string;
  createdAt: Date;
  items: Item[];
}
