import { Injectable, NotFoundException } from '@nestjs/common';
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
      include: { player1: true, player2: true, bracket: true },
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

  remove(id: string) {
    return this.prisma.match.delete({ where: { id } });
  }
}
