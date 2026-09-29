import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto.js';
import { UpdateItemDto } from './dto/update-item.dto.js';
import { Item } from './entities/item.entity.js';
import { ITEMS_REPOSITORY, type ItemsRepository } from './items.repository.js';

@Injectable()
export class ItemsService {
  private readonly logger = new Logger(ItemsService.name);

  constructor(
    @Inject(ITEMS_REPOSITORY)
    private readonly repository: ItemsRepository,
  ) {}

  async create(listId: number, createItemDto: CreateItemDto): Promise<Item> {
    this.logger.debug(
      `Creating item: ${JSON.stringify(createItemDto)} in list ${listId}...`,
    );
    const item = await this.repository.create(listId, createItemDto.name);
    if (item === null) {
      const message = `Cannot create item. The list ${listId} probably doesn't exist.`;
      this.logger.warn(message);
      throw new NotFoundException(message);
    }
    this.logger.log('Created item:', item);
    return item;
  }

  async findAll(listId: number): Promise<Item[]> {
    this.logger.debug(`Finding all items in list ${listId}...`);
    const items = await this.repository.findAll(listId);
    if (items === null) {
      const message = `Cannot finds items. The list ${listId} probably doesn't exist.`;
      this.logger.warn(message);
      throw new NotFoundException(message);
    }
    this.logger.log('Found items:', items);
    return items;
  }

  async findOne(listId: number, itemId: number): Promise<Item> {
    this.logger.debug(`Finding item ${itemId} in list ${listId}...`);
    const item = await this.repository.findById(listId, itemId);
    if (item === null) {
      const message = `Item ${itemId} was not found in list ${listId}`;
      this.logger.warn(message);
      throw new NotFoundException(message);
    }
    this.logger.log('Found item:', item);
    return item;
  }

  async update(
    listId: number,
    itemId: number,
    updateItemDto: UpdateItemDto,
  ): Promise<Item> {
    this.logger.debug(
      `Updating item ${itemId} to`,
      updateItemDto,
      `in list ${listId}...`,
    );
    const item = await this.repository.update(listId, itemId, updateItemDto);
    if (item === null) {
      const message = `Cannot update item ${itemId} in list ${listId} because it was not found`;
      this.logger.warn(message);
      throw new NotFoundException(message);
    }
    this.logger.log(`Updated item ${itemId}`);
    return item;
  }

  async remove(listId: number, itemId: number): Promise<Item> {
    this.logger.debug(`Removing item ${itemId} in list ${listId}...`);
    const item = await this.repository.remove(listId, itemId);
    if (item === null) {
      const message = `Cannot remove item ${itemId} in list ${listId} because it was not found`;
      this.logger.warn(message);
      throw new NotFoundException(message);
    }
    this.logger.log(`Removed item ${itemId}`);
    return item;
  }
}
