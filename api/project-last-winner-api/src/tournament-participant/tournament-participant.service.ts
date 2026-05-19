import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTournamentParticipantDto } from './dto/create-tournament-participant.dto';
import { UpdateTournamentParticipantDto } from './dto/update-tournament-participant.dto';

@Injectable()
export class TournamentParticipantService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTournamentParticipantDto: CreateTournamentParticipantDto) {
    return this.prisma.tournamentParticipant.create({
      data: createTournamentParticipantDto,
    });
  }

  findAll() {
    return this.prisma.tournamentParticipant.findMany();
  }

  findOne(id: string) {
    return this.prisma.tournamentParticipant.findUnique({
      where: { id },
    });
  }

  update(id: string, updateTournamentParticipantDto: UpdateTournamentParticipantDto) {
    return this.prisma.tournamentParticipant.update({
      where: { id },
      data: updateTournamentParticipantDto,
    });
  }

  remove(id: string) {
    return this.prisma.tournamentParticipant.delete({
      where: { id },
    });
  }
}
