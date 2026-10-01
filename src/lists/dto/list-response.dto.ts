import { List } from '../entities/list.entity.js';

export class ListResponseDto {
  /**
   * The ID of the list.
   * @example 42
   */
  listId: number;

  /**
   * The title of the list.
   * @example "Leroy Merlin"
   */
  title: string;

  /**
   * When the list was created.
   */
  createdAt: Date;

  /**
   * The items of the list.
   */
  itemCount: number;

  static fromEntity(list: List): ListResponseDto {
    return {
      listId: list.listId,
      title: list.title,
      createdAt: list.createdAt,
      itemCount: list.items.length,
    };
  }
}
