import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';

interface RequestUser {
  id: string;
  role: string;
}

@Injectable()
export class TournamentService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTournamentDto: CreateTournamentDto, user: RequestUser) {
    return this.prisma.tournament.create({
      data: {
        ...createTournamentDto,
        organizerId: createTournamentDto.organizerId || user.id,
      },
    });
  }

  findAll() {
    return this.prisma.tournament.findMany({
      include: {
        organizer: { select: { id: true, username: true } },
        participants: { select: { id: true, status: true } },
      },
    });
  }

  findByGameId(gameId: string) {
    return this.prisma.tournament.findMany({
      where: { gameId },
      include: {
        organizer: { select: { id: true, username: true } },
        participants: { select: { id: true, status: true } },
      },
    });
  }

  async findOne(id: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
      include: {
        organizer: { select: { id: true, username: true } },
        participants: {
          include: {
            user: { select: { id: true, username: true, email: true } },
          },
        },
        game:true
      },
    });
    if (!tournament) throw new NotFoundException('Tournament not found');
    return tournament;
  }

  async update(id: string, updateTournamentDto: UpdateTournamentDto, user: RequestUser) {
    const tournament = await this.prisma.tournament.findUnique({ where: { id } });
    if (!tournament) throw new NotFoundException('Tournament not found');
    if (user.role !== 'ADMIN' && tournament.organizerId !== user.id) {
      throw new ForbiddenException('Only the tournament organizer or an admin can update this tournament');
    }
    return this.prisma.tournament.update({ where: { id }, data: updateTournamentDto });
  }

  async remove(id: string, user: RequestUser) {
    const tournament = await this.prisma.tournament.findUnique({ where: { id } });
    if (!tournament) throw new NotFoundException('Tournament not found');
    if (user.role !== 'ADMIN' && tournament.organizerId !== user.id) {
      throw new ForbiddenException('Only the tournament organizer or an admin can delete this tournament');
    }
    return this.prisma.tournament.delete({ where: { id } });
  }
}
