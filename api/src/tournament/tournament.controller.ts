import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('tournament')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ORGANIZER', 'USER')
  create(
    @Body() createTournamentDto: CreateTournamentDto,
    @Request() req: Request & { user: { id: string; role: string } },
  ) {
    return this.tournamentService.create(createTournamentDto, req.user);
  }

  @Post(':id/start')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ORGANIZER')
  async startTournament(
    @Param('id') id: string,
    @Request() req: Request & { user: { id: string; role: string } },
  ) {
    return this.tournamentService.startTournament(id, req.user);
  }

  @Post(':id/finish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ORGANIZER')
  async finishTournament(
    @Param('id') id: string,
    @Request() req: Request & { user: { id: string; role: string } },
  ) {
    return this.tournamentService.finishTournament(id, req.user);
  }

  @Post(':id/declare-winner/:winnerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ORGANIZER')
  async declareWinner(
    @Param('id') id: string,
    @Param('winnerId') winnerId: string,
    @Request() req: Request & { user: { id: string; role: string } },
  ) {
    return this.tournamentService.declareWinner(id, winnerId, req.user);
  }

  @Public()
  @Get()
  findAll() {
    return this.tournamentService.findAll();
  }

  @Public()
  @Get('by-game/:gameId')
  findByGame(@Param('gameId') gameId: string) {
    return this.tournamentService.findByGameId(gameId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tournamentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ORGANIZER')
  update(
    @Param('id') id: string,
    @Body() updateTournamentDto: UpdateTournamentDto,
    @Request() req: Request & { user: { id: string; role: string } },
  ) {
    return this.tournamentService.update(id, updateTournamentDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ORGANIZER')
  remove(
    @Param('id') id: string,
    @Request() req: Request & { user: { id: string; role: string } },
  ) {
    return this.tournamentService.remove(id, req.user);
  }
}
