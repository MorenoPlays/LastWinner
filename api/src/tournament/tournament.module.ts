import { Module } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { TournamentController } from './tournament.controller';
import { TournamentLikeService } from './tournament-like.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [TournamentController],
  providers: [TournamentService, TournamentLikeService],
  imports: [PrismaModule],
})
export class TournamentModule {}
