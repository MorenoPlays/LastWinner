import { IsEnum, IsOptional } from 'class-validator';
import { ParticipantStatus } from '@prisma/client';

export class CreateTournamentParticipantDto {
  tournamentId!: string;
  userId!: string;

  @IsOptional()
  @IsEnum(ParticipantStatus)
  status?: ParticipantStatus;

  @IsOptional()
  finalPosition?: number;
}
