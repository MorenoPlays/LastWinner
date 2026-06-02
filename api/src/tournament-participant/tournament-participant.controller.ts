import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TournamentParticipantService } from './tournament-participant.service';
import { CreateTournamentParticipantDto } from './dto/create-tournament-participant.dto';
import { UpdateTournamentParticipantDto } from './dto/update-tournament-participant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tournament-participant')
export class TournamentParticipantController {
  constructor(
    private readonly tournamentParticipantService: TournamentParticipantService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createTournamentParticipantDto: CreateTournamentParticipantDto,
    @Request() req: Express.Request & { user: { id: string; role: string } },
  ) {
    const userId = createTournamentParticipantDto.userId || req.user.id;
    return this.tournamentParticipantService.create({
      ...createTournamentParticipantDto,
      userId,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.tournamentParticipantService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tournamentParticipantService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTournamentParticipantDto: UpdateTournamentParticipantDto,
  ) {
    return this.tournamentParticipantService.update(
      id,
      updateTournamentParticipantDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tournamentParticipantService.remove(id);
  }

  @Get('pending/:tournamentId')
  @UseGuards(JwtAuthGuard)
  findPending(@Param('tournamentId') tournamentId: string) {
    return this.tournamentParticipantService.findPendingByTournament(
      tournamentId,
    );
  }

  @Put(':id/approve')
  @UseGuards(JwtAuthGuard)
  approve(
    @Param('id') participantId: string,
    @Request() req: Express.Request & { user: { id: string } },
  ) {
    return this.tournamentParticipantService.approvePending(
      participantId,
      req.user.id,
    );
  }
}
