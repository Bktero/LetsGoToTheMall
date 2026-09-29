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
  @ApiOperation({ summary: 'Create a new list.' })
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

  @Get(':id')
  @ApiOperation({ summary: 'Get a list by ID along with its items.' })
  async find(@Param('id') id: string): Promise<ListResponseDto> {
    const list = await this.listsService.find(id);
    return ListResponseDto.fromEntity(list);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit a list by ID.' })
  async update(
    @Param('id') id: string,
    @Body() updateListDto: UpdateListDto,
  ): Promise<ListResponseDto> {
    const list = await this.listsService.update(id, updateListDto);
    return ListResponseDto.fromEntity(list);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a list by ID. Its items will be deleted too.',
  })
  async delete(@Param('id') id: string): Promise<ListResponseDto> {
    const list = await this.listsService.delete(id);
    return ListResponseDto.fromEntity(list);
  }
}
