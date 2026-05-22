import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';

@Injectable()
export class TournamentService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTournamentDto: CreateTournamentDto) {
    return this.prisma.tournament.create({ data: createTournamentDto });
  }

  findAll() {
    return this.prisma.tournament.findMany();
  }

  findByGameId(gameId: string) {
    return this.prisma.tournament.findMany({
      where: { gameId },
      include: {
        organizer: { select: { id: true, username: true } },
      },
    });
  }

  async findOne(id: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
      include: {
        participants: true,
        organizer: { select: { id: true, username: true } },
      },
    });
    if (!tournament) throw new NotFoundException('Tournament not found');
    return tournament;
  }

  update(id: string, updateTournamentDto: UpdateTournamentDto) {
    return this.prisma.tournament.update({ where: { id }, data: updateTournamentDto });
  }

  remove(id: string) {
    return this.prisma.tournament.delete({ where: { id } });
  }
}
