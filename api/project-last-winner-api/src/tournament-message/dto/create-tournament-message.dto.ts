import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTournamentMessageDto {
  @IsNotEmpty()
  tournamentId!: string;

  @IsNotEmpty()
  userId!: string;

  @IsNotEmpty()
  @IsString()
  message!: string;
}
