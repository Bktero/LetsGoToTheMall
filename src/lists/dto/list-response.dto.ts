import { Item } from '../entities/item.entity.js';
import { List } from '../entities/list.entity.js';

export class ItemResponseDto {
  /**
   * The ID of the item.
   * @example 1
   */
  id: number;

  /**
   * The name of the item.
   * @example "Gorgonzola"
   */
  name: string;

  /**
   * Whether the item has been picked up.
   * @example false
   */
  isCompleted: boolean;

  /**
   * The position of the item in its list, starting at 0.
   * @example 0
   */
  position: number;

  static fromEntity(item: Item): ItemResponseDto {
    const dto = new ItemResponseDto();
    dto.id = item.id;
    dto.name = item.name;
    dto.isCompleted = item.isCompleted;
    dto.position = item.position;
    return dto;
  }
}

export class ListResponseDto {
  /**
   * The ID of the list.
   * @example "mock-uuid-1234"
   */
  id: string;

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
    const dto = new ListResponseDto();
    dto.id = list.id;
    dto.title = list.title;
    dto.createdAt = list.createdAt;
    dto.items = list.items.map((item) => ItemResponseDto.fromEntity(item));
    return dto;
  }
}
