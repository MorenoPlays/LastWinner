import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTournamentMessageDto } from './dto/create-tournament-message.dto';
import { UpdateTournamentMessageDto } from './dto/update-tournament-message.dto';

@Injectable()
export class TournamentMessageService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTournamentMessageDto: CreateTournamentMessageDto) {
    return this.prisma.tournamentMessage.create({ data: createTournamentMessageDto });
  }

  findAll() {
    return this.prisma.tournamentMessage.findMany({
      include: { user: true, tournament: true },
    });
  }

  async findOne(id: string) {
    const msg = await this.prisma.tournamentMessage.findUnique({
      where: { id },
      include: { user: true, tournament: true },
    });
    if (!msg) throw new NotFoundException('Message not found');
    return msg;
  }

  update(id: string, updateTournamentMessageDto: UpdateTournamentMessageDto) {
    return this.prisma.tournamentMessage.update({
      where: { id },
      data: updateTournamentMessageDto,
      include: { user: true, tournament: true },
    });
  }

  remove(id: string) {
    return this.prisma.tournamentMessage.delete({ where: { id } });
  }
}
