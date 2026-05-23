import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ParticipantStatus } from '@prisma/client';
import { isSet } from 'util/types';

export class CreateTournamentParticipantDto {
  @IsString()
  tournamentId!: string;

  @IsString()
  userId!: string;

  @IsOptional()
  @IsEnum(ParticipantStatus)
  status?: ParticipantStatus;

  @IsOptional()
  @IsString()
  paymentProof?: string;

  @IsOptional()
  finalPosition?: number;
}
