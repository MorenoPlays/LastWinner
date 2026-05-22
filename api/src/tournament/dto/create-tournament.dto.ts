import { TournamentFormat,TournamentMode } from '@prisma/client';


export class CreateTournamentDto {
  organizerId!: string
  title!: string;
  description?: string;
  format!: TournamentFormat;
  mode!: TournamentMode;
  maxPlayers!: number;
  entryFee?: number;
  prizePool?: number;
  startDate?: Date;
  endDate?: Date;
  bannerUrl?: string;
  gameId!: string;
}
