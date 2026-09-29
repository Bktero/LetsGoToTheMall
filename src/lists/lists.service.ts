import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateListDto } from './dto/create-list.dto.js';
import type { ListResponse, ListsRepository } from './lists.repository.js';
import { LISTS_REPOSITORY } from './lists.repository.js';
import { UpdateListDto } from './dto/update-list.dto.js';

@Injectable()
export class ListsService {
  private readonly logger = new Logger(ListsService.name);

  constructor(
    @Inject(LISTS_REPOSITORY)
    private readonly repository: ListsRepository,
  ) {}

  async create(createListDto: CreateListDto) {
    this.logger.debug(`Creating list: ${JSON.stringify(createListDto)}...`);
    const list = await this.repository.create(createListDto.title);
    this.logger.log('Created list:', list);
    return list;
  }

  async findAll() {
    this.logger.debug('Finding lists...');
    const lists = await this.repository.findAll();
    this.logger.debug('Found lists:', lists);
    return lists;
  }

  async find(id: string): Promise<ListResponse> {
    this.logger.debug(`Finding list ${id}...`);
    const list = await this.repository.findById(id);
    if (list === null) {
      const message = `List with ID ${id} was not found`;
      this.logger.warn(message);
      throw new NotFoundException(message);
    }
    this.logger.debug('Found list:', list);
    return list;
  }

  async update(
    id: string,
    updateListDto: UpdateListDto,
  ): Promise<ListResponse> {
    this.logger.debug(`Updating list ${id} to`, updateListDto, '...');
    const list = await this.repository.update(id, updateListDto);
    if (list === null) {
      const message = `Cannot update list with ID ${id} because it was not found`;
      this.logger.warn(message);
      throw new NotFoundException(message);
    }
    this.logger.debug(`Updated list ${id}`);
    return list;
  }

  async delete(id: string): Promise<ListResponse> {
    this.logger.debug(`Deleting list ${id}...`);
    const list = await this.repository.delete(id);
    if (list === null) {
      const message = `Cannot delete list with ID ${id} because it was not found`;
      this.logger.warn(message);
      throw new NotFoundException(message);
    }
    this.logger.debug(`Deleted list ${id}`);
    return list;
  }
}
