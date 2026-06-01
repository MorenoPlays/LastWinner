import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClipService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ClipCreateInput) {
    return this.prisma.clip.create({ data });
  }

  async findAll() {
    return this.prisma.clip.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true, game: true },
    });
  }

  async findOne(id: string) {
    const clip = await this.prisma.clip.findUnique({
      where: { id },
      include: { user: true, game: true },
    });
    if (!clip) throw new NotFoundException('Clip not found');
    return clip;
  }

  async update(id: string, data: Partial<Prisma.ClipUpdateInput>) {
    await this.findOne(id);
    return this.prisma.clip.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.clip.delete({ where: { id } });
  }
}
