import { Module } from '@nestjs/common';
import { ClipService } from './clip.service';
import { ClipController } from './clip.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClipController],
  providers: [ClipService],
})
export class ClipModule {}
