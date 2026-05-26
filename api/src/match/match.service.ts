import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Injectable()
export class MatchService {
  constructor(private readonly prisma: PrismaService) {}

  create(createMatchDto: CreateMatchDto) {
    return this.prisma.match.create({ data: createMatchDto });
  }

  findAll() {
    return this.prisma.match.findMany({
      include: { player1: true, player2: true, bracket: true },
    });
  }

  async findOne(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: { player1: true, player2: true, bracket: true, nextMatch: true },
    });
    if (!match) throw new NotFoundException('Match not found');
    return match;
  }

  update(id: string, updateMatchDto: UpdateMatchDto) {
    return this.prisma.match.update({
      where: { id },
      data: updateMatchDto,
      include: { player1: true, player2: true, bracket: true },
    });
  }

async setWinner(id: string, winnerId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: { player1: true, player2: true, bracket: true },
    });
    if (!match) throw new NotFoundException('Match not found');
    if (winnerId !== match.player1Id && winnerId !== match.player2Id) {
      throw new BadRequestException('Winner must be one of the players');
    }
    const loserId =
      winnerId === match.player1Id ? match.player2Id : match.player1Id;

    // Update current match with winner
    await this.prisma.match.update({
      where: { id },
      data: {
        winnerId,
        loserId,
        status: 'FINISHED',
        finishedAt: new Date(),
      },
    });

    // Update loser participant status to ELIMINATED
    if (loserId) {
      const bracket = await this.prisma.bracket.findUnique({
        where: { id: match.bracketId },
        include: { tournament: true },
      });

      if (bracket?.tournament) {
        const finalRound = Math.log2(bracket.tournament.maxPlayers);
        const isFinalRound = match.roundNumber === finalRound;

        if (!isFinalRound) {
          await this.prisma.tournamentParticipant.updateMany({
            where: {
              tournamentId: bracket.tournamentId,
              userId: loserId,
            },
            data: { status: 'ELIMINATED' },
          });
        }
      }
    }

    // Advance winner to next match using nextMatchId
    if (match.nextMatchId) {
      const nextMatch = await this.prisma.match.findUnique({
        where: { id: match.nextMatchId },
      });

      if (nextMatch) {
        // Determine slot: fill player1 first, then player2
        const isFirstSlot = !nextMatch.player1Id;

        await this.prisma.match.update({
          where: { id: nextMatch.id },
          data: { [isFirstSlot ? 'player1Id' : 'player2Id']: winnerId },
        });
      }
    }

    return this.prisma.match.findUnique({
      where: { id },
      include: { player1: true, player2: true, bracket: true, nextMatch: true },
    });
  }

  remove(id: string) {
    return this.prisma.match.delete({ where: { id } });
  }
}
