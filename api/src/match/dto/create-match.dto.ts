import { IsEnum, IsInt, IsOptional, IsDate, IsUUID } from 'class-validator';
import { MatchStatus } from '@prisma/client';

export class CreateMatchDto {
  bracketId!: string;

  @IsInt()
  roundNumber!: number;

  @IsInt()
  matchNumber!: number;

  @IsOptional()
  @IsUUID()
  player1Id?: string;

  @IsOptional()
  @IsUUID()
  player2Id?: string;

  @IsOptional()
  @IsUUID()
  winnerId?: string;

  @IsOptional()
  @IsUUID()
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

  @IsOptional()
  @IsUUID()
  nextMatchId?: string;

  @IsOptional()
  @IsUUID()
  loserMatchId?: string;
}
