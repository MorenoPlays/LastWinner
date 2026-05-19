import { IsEnum, IsNotEmpty } from 'class-validator';
import { TournamentFormat } from '@prisma/client';

export class CreateBracketDto {
  @IsNotEmpty()
  tournamentId!: string;

  @IsNotEmpty()
  @IsEnum(TournamentFormat)
  type!: TournamentFormat;
}
