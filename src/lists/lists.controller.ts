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
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Lists')
@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new list.' })
  create(@Body() createListDto: CreateListDto) {
    return this.listsService.create(createListDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lists.' })
  findAll() {
    return this.listsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a list by ID along with its items.' })
  find(@Param('id') id: string) {
    return this.listsService.find(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit a list by ID.' })
  update(@Param('id') id: string, @Body() updateListDto: UpdateListDto) {
    return this.listsService.update(id, updateListDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a list by ID. Its items will be deleted too.',
  })
  delete(@Param('id') id: string) {
    return this.listsService.delete(id);
  }
}
