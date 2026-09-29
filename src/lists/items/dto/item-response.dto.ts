import { Item } from '../entities/item.entity.js';

export class ItemResponseDto {
  /**
   * The ID of the item.
   * @example 51
   */
  itemId: number;

  /**
   * The name of the item.
   * @example "Gorgonzola"
   */
  name: string;

  /**
   * When the item was created.
   */
  createdAt: Date;

  /**
   * When the item was picked up.
   *
   * If null, it means the item hasn't been picked up yet.
   */
  pickedUpAt: Date | null;

  static fromEntity(item: Item): ItemResponseDto {
    return {
      itemId: item.itemId,
      name: item.name,
      createdAt: item.createdAt,
      pickedUpAt: item.pickedUpAt,
    };
  }
}
