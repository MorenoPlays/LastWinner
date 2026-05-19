import { Module } from '@nestjs/common';
import { TournamentMessageService } from './tournament-message.service';
import { TournamentMessageController } from './tournament-message.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [TournamentMessageController],
  providers: [TournamentMessageService],
  imports: [PrismaModule],
})
export class TournamentMessageModule {}
