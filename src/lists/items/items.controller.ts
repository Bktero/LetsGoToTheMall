import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ItemsService } from './items.service.js';
import { CreateItemDto } from './dto/create-item.dto.js';
import { UpdateItemDto } from './dto/update-item.dto.js';
import { ItemResponseDto } from './dto/item-response.dto.js';
import { ApiOperation } from '@nestjs/swagger';

@Controller('lists/:listId/items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new item in the give list.' })
  async create(
    @Param('listId') listId: number,
    @Body() createItemDto: CreateItemDto,
  ): Promise<ItemResponseDto> {
    const item = await this.itemsService.create(listId, createItemDto);
    return ItemResponseDto.fromEntity(item);
  }

  @Get()
  @ApiOperation({ summary: 'Get all items in a list.' })
  async findAll(@Param('listId') listId: number): Promise<ItemResponseDto[]> {
    const items = await this.itemsService.findAll(listId);
    return items.map((item) => ItemResponseDto.fromEntity(item));
  }

  @Get(':itemId')
  @ApiOperation({ summary: 'Get an item by ID in a list.' })
  async findOne(
    @Param('listId') listId: number,
    @Param('itemId') itemId: number,
  ): Promise<ItemResponseDto> {
    const item = await this.itemsService.findOne(listId, itemId);
    return ItemResponseDto.fromEntity(item);
  }

  @Patch(':itemId')
  @ApiOperation({ summary: 'Edit an item by ID in a list.' })
  async update(
    @Param('listId') listId: number,
    @Param('itemId') itemId: number,
    @Body() updateItemDto: UpdateItemDto,
  ): Promise<ItemResponseDto> {
    const item = await this.itemsService.update(listId, itemId, updateItemDto);
    return ItemResponseDto.fromEntity(item);
  }

  @Delete(':itemId')
  @ApiOperation({ summary: 'Remove an item by ID in a list.' })
  async remove(
    @Param('listId') listId: number,
    @Param('itemId') itemId: number,
  ): Promise<ItemResponseDto> {
    const item = await this.itemsService.remove(listId, itemId);
    return ItemResponseDto.fromEntity(item);
  }
}
