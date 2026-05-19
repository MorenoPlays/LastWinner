import { Module } from '@nestjs/common';
import { BracketService } from './bracket.service';
import { BracketController } from './bracket.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [BracketController],
  providers: [BracketService],
  imports: [PrismaModule],
})
export class BracketModule {}
