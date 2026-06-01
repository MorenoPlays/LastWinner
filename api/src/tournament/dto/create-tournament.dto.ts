import {
  CurrencyType,
  TournamentFormat,
  TournamentStatus,
  TournamentMode,
} from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
export class CreateTournamentDto {
  @IsOptional()
  @IsString()
  organizerId?: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TournamentFormat)
  format!: TournamentFormat;

  @IsEnum(TournamentMode)
  mode!: TournamentMode;

  @IsOptional()
  @IsEnum(TournamentStatus)
  status?: TournamentStatus;

  @IsNumber()
  maxPlayers!: number;

  @IsOptional()
  @IsNumber()
  entryFee?: number;

  @IsOptional()
  @IsEnum(CurrencyType)
  currency?: CurrencyType;

  @IsOptional()
  @IsNumber()
  prizePool?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @IsString()
  gameId!: string;
}
