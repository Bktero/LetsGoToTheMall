import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ListsService } from './lists.service.js';
import { CreateListDto } from './dto/create-list.dto.js';
import { UpdateListDto } from './dto/update-list.dto.js';
import { ListResponseDto } from './dto/list-response.dto.js';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Lists')
@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new empty list.' })
  async create(@Body() createListDto: CreateListDto): Promise<ListResponseDto> {
    const list = await this.listsService.create(createListDto);
    return ListResponseDto.fromEntity(list);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lists.' })
  async findAll(): Promise<ListResponseDto[]> {
    const lists = await this.listsService.findAll();
    return lists.map((list) => ListResponseDto.fromEntity(list));
  }

  @Get(':listId')
  @ApiOperation({ summary: 'Get a list by ID along with its items.' })
  async findOne(@Param('listId') listId: number): Promise<ListResponseDto> {
    const list = await this.listsService.findOne(listId);
    return ListResponseDto.fromEntity(list);
  }

  @Patch(':listId')
  @ApiOperation({ summary: 'Edit a list by ID.' })
  async update(
    @Param('listId') listId: number,
    @Body() updateListDto: UpdateListDto,
  ): Promise<ListResponseDto> {
    const list = await this.listsService.update(listId, updateListDto);
    return ListResponseDto.fromEntity(list);
  }

  @Delete(':listId')
  @ApiOperation({
    summary: 'Remove a list by ID. Its items will be removed too.',
  })
  async remove(@Param('listId') listId: number): Promise<ListResponseDto> {
    const list = await this.listsService.remove(listId);
    return ListResponseDto.fromEntity(list);
  }
}
