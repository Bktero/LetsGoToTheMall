import { Item } from './item.entity.js';

export class List {
  id: string;
  title: string;
  createdAt: Date;
  items: Item[];
}
