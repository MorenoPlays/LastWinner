import { IsEnum, IsInt, IsOptional, IsDate } from 'class-validator';
import { MatchStatus } from '@prisma/client';

export class CreateMatchDto {
  bracketId!: string;

  @IsInt()
  roundNumber!: number;

  @IsInt()
  matchNumber!: number;

  player1Id!: string;
  player2Id!: string;

  @IsOptional()
  winnerId?: string;

  @IsOptional()
  loserId?: string;

  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @IsOptional()
  @IsDate()
  scheduledAt?: Date;

  @IsOptional()
  @IsDate()
  finishedAt?: Date;
}
