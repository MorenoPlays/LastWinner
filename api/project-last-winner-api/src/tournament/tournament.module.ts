import { Module } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { TournamentController } from './tournament.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [TournamentController],
  providers: [TournamentService],
  imports: [PrismaModule],
})
export class TournamentModule {}
