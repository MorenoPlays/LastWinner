import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTournamentParticipantDto } from './dto/create-tournament-participant.dto';
import { UpdateTournamentParticipantDto } from './dto/update-tournament-participant.dto';

@Injectable()
export class TournamentParticipantService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTournamentParticipantDto: CreateTournamentParticipantDto) {
    return this.createInternal(createTournamentParticipantDto);
  }

  private async createInternal(createTournamentParticipantDto: CreateTournamentParticipantDto) {
    const { tournamentId, userId, paymentProof } = createTournamentParticipantDto;

    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { entryFee: true },
    });
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    // Inscriptions with entryFee > 0 are always PENDING, payment proof is optional
    // Users may register without proof and later send it, or contact organizer directly

    return this.prisma.tournamentParticipant.create({
      data: {
        tournamentId,
        userId,
        status: tournament.entryFee > 0 ? 'PENDING' : 'REGISTERED',
        paymentProof: paymentProof || undefined,
      },
    });
  }

  findAll() {
    return this.prisma.tournamentParticipant.findMany({
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
    });
  }

  async findPendingByTournament(tournamentId: string) {
    return this.prisma.tournamentParticipant.findMany({
      where: {
        tournamentId,
        status: 'PENDING',
      },
      include: {
        user: { select: { id: true, username: true, email: true } },
        tournament: { select: { id: true, title: true, entryFee: true, currency: true } },
      },
    });
  }

  async approvePending(participantId: string, organizerId: string) {
    const participant = await this.prisma.tournamentParticipant.findUnique({
      where: { id: participantId },
      include: {
        tournament: { select: { organizerId: true } },
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    const isOrganizer = participant.tournament.organizerId === organizerId;
    if (!isOrganizer) {
      throw new ForbiddenException(
        'Apenas o organizador do torneio pode aprovar inscrições pendentes.',
      );
    }

    return this.prisma.tournamentParticipant.update({
      where: { id: participantId },
      data: { status: 'REGISTERED', paymentProof: null },
    });
  }

  async findOne(id: string) {
    const participant = await this.prisma.tournamentParticipant.findUnique({ where: { id } });
    if (!participant) throw new NotFoundException('Participant not found');
    return participant;
  }

  update(id: string, updateTournamentParticipantDto: UpdateTournamentParticipantDto) {
    return this.prisma.tournamentParticipant.update({ where: { id }, data: updateTournamentParticipantDto });
  }

  remove(id: string) {
    return this.prisma.tournamentParticipant.delete({ where: { id } });
  }
}
