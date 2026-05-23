import { CurrencyType, TournamentFormat, TournamentStatus, TournamentMode } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
export class CreateTournamentDto {
  @IsString()
  organizerId!: string

  @IsString()
  title!: string;

  @IsString()
  description?: string;

  @IsString()
  format!: TournamentFormat;

  @IsString()
  mode!: TournamentMode;

  @IsString()
  @IsOptional()
  status?: TournamentStatus;

  @IsNumber()
  maxPlayers!: number;

  @IsNumber()
  @IsOptional()
  entryFee?: number;

  @IsString()
  @IsOptional()
  currency?: CurrencyType;

  @IsNumber()
  @IsOptional()
  prizePool?: number;

  @IsString()
  @IsOptional()
  startDate?: Date;

  @IsString()
  @IsOptional()
  endDate?: Date;

  @IsString()
  @IsOptional()
  bannerUrl?: string;
  
  @IsString()
  gameId!: string;
}
