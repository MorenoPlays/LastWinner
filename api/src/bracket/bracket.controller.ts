import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BracketService } from './bracket.service';
import { CreateBracketDto } from './dto/create-bracket.dto';
import { UpdateBracketDto } from './dto/update-bracket.dto';

@Controller('bracket')
export class BracketController {
  constructor(private readonly bracketService: BracketService) {}

  @Post()
  create(@Body() createBracketDto: CreateBracketDto) {
    return this.bracketService.create(createBracketDto);
  }

  @Get()
  findAll() {
    return this.bracketService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bracketService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBracketDto: UpdateBracketDto) {
    return this.bracketService.update(id, updateBracketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bracketService.remove(id);
  }
}
