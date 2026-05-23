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
  create(@Body() createTournamentDto: CreateTournamentDto, @Request() req: Request & { user: { id: string; role: string } }) {
    return this.tournamentService.create(createTournamentDto, req.user);
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
