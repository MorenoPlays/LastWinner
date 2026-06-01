import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ClipService } from './clip.service';
import { CreateClipDto } from './dto/create-clip.dto';
import { UpdateClipDto } from './dto/update-clip.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Prisma } from '@prisma/client';

@Controller('clip')
export class ClipController {
  constructor(private readonly clipService: ClipService) {}

  @Get()
  @Public()
  findAll() {
    return this.clipService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.clipService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createClipDto: CreateClipDto) {
    const data: Prisma.ClipCreateInput = {
      title: createClipDto.title,
      videoUrl: createClipDto.videoUrl,
      thumbnail: createClipDto.thumbnail,
      views: createClipDto.views,
      likes: createClipDto.likes,
      user: { connect: { id: createClipDto.userId } },
      game: { connect: { id: createClipDto.gameId } },
    };

    return this.clipService.create(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateClipDto: UpdateClipDto) {
    return this.clipService.update(id, updateClipDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.clipService.remove(id);
  }
}
