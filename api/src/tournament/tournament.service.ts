import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
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
        game: true,
        brackets: {
          include: {
            matches: {
              include: {
                player1: true,
                player2: true,
              },
            },
          },
        },
      },
    });
    if (!tournament) throw new NotFoundException('Tournament not found');
    return tournament;
  }

  async update(
    id: string,
    updateTournamentDto: UpdateTournamentDto,
    user: RequestUser,
  ) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
    });
    if (!tournament) throw new NotFoundException('Tournament not found');
    if (user.role !== 'ADMIN' && tournament.organizerId !== user.id) {
      throw new ForbiddenException(
        'Only the tournament organizer or an admin can update this tournament',
      );
    }
    return this.prisma.tournament.update({
      where: { id },
      data: updateTournamentDto,
    });
  }

  async remove(id: string, user: RequestUser) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
    });
    if (!tournament) throw new NotFoundException('Tournament not found');
    if (user.role !== 'ADMIN' && tournament.organizerId !== user.id) {
      throw new ForbiddenException(
        'Only the tournament organizer or an admin can delete this tournament',
      );
    }
    return this.prisma.tournament.delete({ where: { id } });
  }

  async startTournament(id: string, user: RequestUser) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });
    if (!tournament) throw new NotFoundException('Tournament not found');
    if (user.role !== 'ADMIN' && tournament.organizerId !== user.id) {
      throw new ForbiddenException(
        'Only the tournament organizer or an admin can start this tournament',
      );
    }
    if (tournament.status !== 'OPEN') {
      throw new BadRequestException(
        'Tournament must be in OPEN status to start',
      );
    }

    const participants = tournament.participants
      .filter((p) => p.status === 'REGISTERED' || p.status === 'CHECKED_IN')
      .map((p) => p.user);

    if (participants.length < 2) {
      throw new BadRequestException(
        'Need at least 2 participants to start tournament',
      );
    }

    const isPowerOfTwo = (n: number) => (n & (n - 1)) === 0 && n !== 0;
    if (!isPowerOfTwo(participants.length)) {
      throw new BadRequestException(
        'Number of participants must be a power of 2 (2, 4, 8, 16, ...) for bracket generation',
      );
    }

    const bracket = await this.prisma.bracket.create({
      data: {
        tournamentId: id,
        type: tournament.format,
      },
    });

    const wbRounds = Math.log2(participants.length) as number;
    const allMatches: { id: string; roundNumber: number; matchNumber: number }[] = [];

    // Generate all matches
    for (let round = 1; round <= wbRounds; round++) {
      const matchesInRound = participants.length / Math.pow(2, round);
      for (let i = 0; i < matchesInRound; i++) {
        const match = await this.prisma.match.create({
          data: {
            bracketId: bracket.id,
            roundNumber: round,
            matchNumber: i + 1,
            player1Id: null,
            player2Id: null,
            status: 'PENDING',
          },
        });
        allMatches.push({ id: match.id, roundNumber: round, matchNumber: i + 1 });
      }
    }

    // Link matches: winner of current match advances to next match
    for (let round = 1; round < wbRounds; round++) {
      const currentRoundMatches = allMatches.filter(
        (m) => m.roundNumber === round,
      );
      const nextRoundMatches = allMatches.filter(
        (m) => m.roundNumber === round + 1,
      );

      for (let i = 0; i < currentRoundMatches.length; i += 2) {
        const nextMatchIdx = Math.floor(i / 2);
        if (nextRoundMatches[nextMatchIdx]) {
          await this.prisma.match.update({
            where: { id: currentRoundMatches[i].id },
            data: { nextMatchId: nextRoundMatches[nextMatchIdx].id },
          });
          if (currentRoundMatches[i + 1]) {
            await this.prisma.match.update({
              where: { id: currentRoundMatches[i + 1].id },
              data: { nextMatchId: nextRoundMatches[nextMatchIdx].id },
            });
          }
        }
      }
    }

    // Shuffle participants for random seeding
    const shuffledParticipants = [...participants];
    for (let i = shuffledParticipants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledParticipants[i], shuffledParticipants[j]] = [
        shuffledParticipants[j],
        shuffledParticipants[i],
      ];
    }

    // Assign participants to first round matches
    const firstRoundMatches = allMatches.filter((m) => m.roundNumber === 1);
    for (let i = 0; i < shuffledParticipants.length; i += 2) {
      const match = firstRoundMatches[i / 2];
      await this.prisma.match.update({
        where: { id: match.id },
        data: {
          player1Id: shuffledParticipants[i].id,
          player2Id: shuffledParticipants[i + 1].id,
        },
      });
    }

    await this.prisma.tournamentParticipant.updateMany({
      where: {
        tournamentId: id,
        status: 'REGISTERED',
      },
      data: { status: 'CHECKED_IN' },
    });

    // Return tournament with all data including the newly created matches
    return this.prisma.tournament.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true, email: true } },
          },
        },
        game: true,
        brackets: {
          include: {
            matches: {
              include: {
                player1: true,
                player2: true,
              },
            },
          },
        },
      },
    });
  }

  async finishTournament(id: string, user: RequestUser) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
      include: {
        brackets: {
          include: {
            matches: true,
          },
        },
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!tournament) throw new NotFoundException('Tournament not found');
    if (user.role !== 'ADMIN' && tournament.organizerId !== user.id) {
      throw new ForbiddenException(
        'Only the tournament organizer or an admin can finish this tournament',
      );
    }
    if (tournament.status !== 'ONGOING') {
      throw new BadRequestException(
        'Tournament must be in ONGOING status to finish',
      );
    }

    const bracket = tournament.brackets[0];
    if (!bracket) {
      throw new BadRequestException('Tournament has no bracket');
    }

    const finishedMatches = bracket.matches.filter(
      (m) => m.status === 'FINISHED' && m.winnerId,
    );

    if (finishedMatches.length === 0) {
      throw new BadRequestException('No finished matches found in tournament');
    }

    const participantStats = new Map<
      string,
      { wins: number; losses: number; position?: number }
    >();

    tournament.participants.forEach((p) => {
      participantStats.set(p.userId, { wins: 0, losses: 0 });
    });

    finishedMatches.forEach((match) => {
      if (match.winnerId) {
        const current = participantStats.get(match.winnerId);
        if (current) {
          current.wins++;
          participantStats.set(match.winnerId, current);
        }
      }
      if (match.loserId) {
        const current = participantStats.get(match.loserId);
        if (current) {
          current.losses++;
          participantStats.set(match.loserId, current);
        }
      }
    });

    const finalMatch = bracket.matches.reduce((max, match) =>
      match.roundNumber > max.roundNumber ? match : max,
    );

    if (!finalMatch.winnerId) {
      throw new BadRequestException('Final match has not been concluded yet');
    }

    const rankings = Array.from(participantStats.entries()).sort((a, b) => {
      const winsA = a[1].wins;
      const winsB = b[1].wins;
      if (winsA !== winsB) return winsB - winsA;
      return b[1].losses - a[1].losses;
    });

    const updatePromises = rankings.map((entry, index) => {
      const userId = entry[0];
      const position = index + 1;
      const isWinner = finalMatch.winnerId === userId;

      return this.prisma.tournamentParticipant.updateMany({
        where: {
          tournamentId: id,
          userId: userId,
        },
        data: {
          status: isWinner ? 'WINNER' : 'ELIMINATED',
          finalPosition: position,
        },
      });
    });

    const allParticipantIds = tournament.participants.map((p) => p.userId);
    const userStatsUpdates = allParticipantIds.map((userId) => {
      return this.prisma.user.update({
        where: { id: userId },
        data: {
          losses: { increment: userId === finalMatch.winnerId ? 0 : 1 },
          wins: { increment: userId === finalMatch.winnerId ? 1 : 0 },
        },
      });
    });

    await Promise.all([...updatePromises, ...userStatsUpdates]);

    await this.distributeRewards(id, tournament.participants, rankings);
    await this.sendTournamentFinishedNotifications(
      id,
      tournament.participants,
      finalMatch.winnerId,
    );

    return this.prisma.tournament.update({
      where: { id },
      data: {
        status: 'FINISHED',
        endDate: new Date(),
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true } },
          },
          orderBy: { finalPosition: 'asc' },
        },
        rewards: true,
      },
    });
  }

  async declareWinner(id: string, winnerId: string, user: RequestUser) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
      include: {
        brackets: {
          include: {
            matches: true,
          },
        },
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!tournament) throw new NotFoundException('Tournament not found');
    if (user.role !== 'ADMIN' && tournament.organizerId !== user.id) {
      throw new ForbiddenException(
        'Only the tournament organizer or an admin can declare the winner',
      );
    }
    if (tournament.status !== 'ONGOING') {
      throw new BadRequestException(
        'Tournament must be in ONGOING status to declare a winner',
      );
    }

    const winnerParticipant = tournament.participants.find(
      (p) => p.userId === winnerId,
    );
    if (!winnerParticipant) {
      throw new BadRequestException('Winner must be a tournament participant');
    }

    const updatePromises = tournament.participants.map((participant) => {
      const isWinner = participant.userId === winnerId;
      return this.prisma.tournamentParticipant.update({
        where: { id: participant.id },
        data: {
          status: isWinner ? 'WINNER' : 'ELIMINATED',
          finalPosition: isWinner ? 1 : 2,
        },
      });
    });

    const updateUserStatsPromises = tournament.participants.map(
      (participant) => {
        const isWinner = participant.userId === winnerId;
        return this.prisma.user.update({
          where: { id: participant.userId },
          data: {
            wins: { increment: isWinner ? 1 : 0 },
            losses: { increment: isWinner ? 0 : 1 },
          },
        });
      },
    );

    await Promise.all([...updatePromises, ...updateUserStatsPromises]);

    const rankings = tournament.participants
      .map((p) => [p.userId, {}])
      .sort((a, b) => {
        const posA =
          tournament.participants.find((x) => x.userId === a[0])
            ?.finalPosition || 999;
        const posB =
          tournament.participants.find((x) => x.userId === b[0])
            ?.finalPosition || 999;
        return posA - posB;
      });

    await this.distributeRewards(id, tournament.participants, rankings as any);
    await this.sendTournamentFinishedNotifications(
      id,
      tournament.participants,
      winnerId,
    );

    return this.prisma.tournament.update({
      where: { id },
      data: {
        status: 'FINISHED',
        endDate: new Date(),
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true } },
          },
          orderBy: { finalPosition: 'asc' },
        },
        rewards: true,
      },
    });
  }

  private async distributeRewards(
    tournamentId: string,
    participants: any[],
    rankings: Array<[string, any]>,
  ) {
    const rewards = await this.prisma.tournamentReward.findMany({
      where: { tournamentId },
    });

    if (rewards.length === 0) return;

    for (const reward of rewards) {
      const rankedParticipant = rankings[reward.position - 1];
      if (rankedParticipant) {
        const userId = rankedParticipant[0];
        console.log(
          `Reward distributed: ${reward.rewardTitle} (${reward.amount}) to user ${userId}`,
        );
      }
    }
  }

  private async sendTournamentFinishedNotifications(
    tournamentId: string,
    participants: any[],
    winnerId: string,
  ) {
    const notifications = participants.map((participant) => {
      const isWinner = participant.userId === winnerId;
      return {
        userId: participant.userId,
        title: 'Torneio Finalizado',
        content: isWinner
          ? `Parabéns! Você venceu o torneio!`
          : `O torneio foi finalizado. Confira sua posição final.`,
        isRead: false,
        createdAt: new Date(),
      };
    });

    await this.prisma.notification.createMany({
      data: notifications,
    });
  }
}