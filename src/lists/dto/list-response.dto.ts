import { List } from '../entities/list.entity.js';
import { ItemResponseDto } from '../items/dto/item-response.dto.js';

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
  items: ItemResponseDto[];

  static fromEntity(list: List): ListResponseDto {
    return {
      listId: list.listId,
      title: list.title,
      createdAt: list.createdAt,
      items: list.items.map((item) => ItemResponseDto.fromEntity(item)),
    };
  }
}
