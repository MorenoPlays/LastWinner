import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TournamentMessageService } from './tournament-message.service';
import { CreateTournamentMessageDto } from './dto/create-tournament-message.dto';
import { UpdateTournamentMessageDto } from './dto/update-tournament-message.dto';

@Controller('tournament-message')
export class TournamentMessageController {
  constructor(
    private readonly tournamentMessageService: TournamentMessageService,
  ) {}

  @Post()
  create(@Body() createTournamentMessageDto: CreateTournamentMessageDto) {
    return this.tournamentMessageService.create(createTournamentMessageDto);
  }

  @Get()
  findAll() {
    return this.tournamentMessageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tournamentMessageService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTournamentMessageDto: UpdateTournamentMessageDto,
  ) {
    return this.tournamentMessageService.update(id, updateTournamentMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tournamentMessageService.remove(id);
  }
}
