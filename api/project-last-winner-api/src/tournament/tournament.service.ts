import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';

@Injectable()
export class TournamentService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTournamentDto: CreateTournamentDto) {
    return this.prisma.tournament.create({
      data: createTournamentDto,
    });
  }

  findAll() {
    return this.prisma.tournament.findMany();
  }

  findOne(id: string) {
    return this.prisma.tournament.findUnique({
      where: { id },
      include:{
        participants:true
      }
    });
  }

  update(id: string, updateTournamentDto: UpdateTournamentDto) {
    return this.prisma.tournament.update({
      where: { id },
      data: updateTournamentDto,
    });
  }

  remove(id: string) {
    return this.prisma.tournament.delete({
      where: { id },
    });
  }
}
