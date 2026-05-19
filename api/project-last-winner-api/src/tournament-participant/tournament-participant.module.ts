import { Module } from '@nestjs/common';
import { TournamentParticipantService } from './tournament-participant.service';
import { TournamentParticipantController } from './tournament-participant.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [TournamentParticipantController],
  providers: [TournamentParticipantService],
  imports: [PrismaModule],
})
export class TournamentParticipantModule {}
