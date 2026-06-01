import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TournamentLikeService {
  constructor(private readonly prisma: PrismaService) {}

  async likeTournament(tournamentId: string, userId: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    const existing = await this.prisma.tournamentLike.findUnique({
      where: { tournamentId_userId: { tournamentId, userId } },
    });

    // If already liked, don't create duplicate
    if (!existing) {
      await this.prisma.tournamentLike.create({
        data: { tournamentId, userId },
      });
    }

    return this.getTournamentWithLikes(tournamentId);
  }

  async unlikeTournament(tournamentId: string, userId: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    await this.prisma.tournamentLike.delete({
      where: { tournamentId_userId: { tournamentId, userId } },
    }).catch(() => null);

    return this.getTournamentWithLikes(tournamentId);
  }

  private async getTournamentWithLikes(tournamentId: string) {
    return this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        likes: true,
        organizer: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
  }
}
