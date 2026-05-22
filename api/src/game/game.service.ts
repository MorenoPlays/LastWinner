import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  create(createGameDto: CreateGameDto) {
    return this.prisma.game.create({ data: createGameDto });
  }

  findAll() {
    return this.prisma.game.findMany();
  }

  async findOne(id: string) {
    const game = await this.prisma.game.findUnique({ where: { id } });
    if (!game) throw new NotFoundException('Game not found');
    return game;
  }

  async findBySlug(slug: string) {
    const game = await this.prisma.game.findUnique({ where: { slug } });
    if (!game) throw new NotFoundException('Game not found');
    return game;
  }

  update(id: string, updateGameDto: UpdateGameDto) {
    return this.prisma.game.update({ where: { id }, data: updateGameDto });
  }

  remove(id: string) {
    return this.prisma.game.delete({ where: { id } });
  }
}
