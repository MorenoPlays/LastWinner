import { Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  create(createGameDto: CreateGameDto) {
    const game = this.prisma.game.create({
      data: createGameDto,
    });
    return game;
  }

  findAll() {
    return this.prisma.game.findMany();
  }

  findOne(id: string) {
    return this.prisma.game.findMany({
      where: {
        id: id,
      },
    });
  }

  update(id: string, updateGameDto: UpdateGameDto) {
    return this.prisma.game.update({
      where: {
        id: id,
      },
      data: updateGameDto,
    });
  }

  remove(id: string) {
    return this.prisma.game.delete({
      where: {
        id: id,
      },
    });
  }
}
