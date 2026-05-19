import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TournamentParticipantService } from './tournament-participant.service';
import { CreateTournamentParticipantDto } from './dto/create-tournament-participant.dto';
import { UpdateTournamentParticipantDto } from './dto/update-tournament-participant.dto';

@Controller('tournament-participant')
export class TournamentParticipantController {
  constructor(private readonly tournamentParticipantService: TournamentParticipantService) {}

  @Post()
  create(@Body() createTournamentParticipantDto: CreateTournamentParticipantDto) {
    return this.tournamentParticipantService.create(createTournamentParticipantDto);
  }

  @Get()
  findAll() {
    return this.tournamentParticipantService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tournamentParticipantService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTournamentParticipantDto: UpdateTournamentParticipantDto) {
    return this.tournamentParticipantService.update(id, updateTournamentParticipantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tournamentParticipantService.remove(id);
  }
}
