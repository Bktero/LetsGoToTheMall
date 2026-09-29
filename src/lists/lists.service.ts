import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateListDto } from './dto/create-list.dto.js';
import type { List } from './entities/list.entity.js';
import { LISTS_REPOSITORY, type ListsRepository } from './lists.repository.js';
import { UpdateListDto } from './dto/update-list.dto.js';

@Injectable()
export class ListsService {
  private readonly logger = new Logger(ListsService.name);

  constructor(
    @Inject(LISTS_REPOSITORY)
    private readonly repository: ListsRepository,
  ) {}

  async create(createListDto: CreateListDto): Promise<List> {
    this.logger.debug(`Creating list: ${JSON.stringify(createListDto)}...`);
    const list = await this.repository.create(createListDto.title);
    this.logger.log('Created list:', list);
    return list;
  }

  async findAll(): Promise<List[]> {
    this.logger.debug('Finding all lists...');
    const lists = await this.repository.findAll();
    this.logger.debug('Found lists:', lists);
    return lists;
  }

  async findOne(listId: number): Promise<List> {
    this.logger.debug(`Finding list ${listId}...`);
    const list = await this.repository.findById(listId);
    if (list === null) {
      const message = `List ${listId} was not found`;
      this.logger.warn(message);
      throw new NotFoundException(message);
    }
    this.logger.debug('Found list:', list);
    return list;
  }

  async update(listId: number, updateListDto: UpdateListDto): Promise<List> {
    this.logger.debug(`Updating list ${listId} to`, updateListDto, '...');
    const list = await this.repository.update(listId, updateListDto);
    if (list === null) {
      const message = `Cannot update list ${listId} because it was not found`;
      this.logger.warn(message);
      throw new NotFoundException(message);
    }
    this.logger.debug(`Updated list ${listId}`);
    return list;
  }

  async remove(listId: number): Promise<List> {
    this.logger.debug(`Removing list ${listId}...`);
    const list = await this.repository.remove(listId);
    if (list === null) {
      const message = `Cannot remove list ${listId} because it was not found`;
      this.logger.warn(message);
      throw new NotFoundException(message);
    }
    this.logger.debug(`Removed list ${listId}`);
    return list;
  }
}
