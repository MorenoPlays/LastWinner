import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBracketDto } from './dto/create-bracket.dto';
import { UpdateBracketDto } from './dto/update-bracket.dto';

@Injectable()
export class BracketService {
  constructor(private readonly prisma: PrismaService) {}

  create(createBracketDto: CreateBracketDto) {
    return this.prisma.bracket.create({ data: createBracketDto });
  }

  findAll() {
    return this.prisma.bracket.findMany();
  }

  async findOne(id: string) {
    const bracket = await this.prisma.bracket.findUnique({ where: { id } });
    if (!bracket) throw new NotFoundException('Bracket not found');
    return bracket;
  }

  update(id: string, updateBracketDto: UpdateBracketDto) {
    return this.prisma.bracket.update({ where: { id }, data: updateBracketDto });
  }

  remove(id: string) {
    return this.prisma.bracket.delete({ where: { id } });
  }
}
