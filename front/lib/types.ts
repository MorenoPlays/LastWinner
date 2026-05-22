export type Role = "USER" | "ADMIN" | "ORGANIZER";

export type TournamentStatus =
  | "DRAFT"
  | "OPEN"
  | "ONGOING"
  | "FINISHED"
  | "CANCELED";

export type TournamentFormat =
  | "SINGLE_ELIMINATION"
  | "DOUBLE_ELIMINATION"
  | "ROUND_ROBIN"
  | "SWISS";

export type TournamentMode = "ONLINE" | "PRESENTIAL";

export type ParticipantStatus = "REGISTERED" | "CHECKED_IN" | "ELIMINATED" | "WINNER";

export type MatchStatus = "PENDING" | "LIVE" | "FINISHED" | "CANCELED";

export type TeamRole = "OWNER" | "CAPTAIN" | "PLAYER";

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  country?: string;
  role: Role;
  elo: number;
  wins: number;
  losses: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  id: string;
  name: string;
  slug: string;
  coverUrl?: string;
}

export interface Tournament {
  id: string;
  organizerId: string;
  organizer?: User;
  gameId: string;
  game?: Game;
  title: string;
  description?: string;
  format: TournamentFormat;
  mode: TournamentMode;
  status: TournamentStatus;
  maxPlayers: number;
  entryFee: number;
  prizePool: number;
  startDate?: string;
  endDate?: string;
  bannerUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TournamentParticipant {
  id: string;
  tournamentId: string;
  tournament?: Tournament;
  userId: string;
  user?: User;
  status: ParticipantStatus;
  finalPosition?: number;
  joinedAt: string;
}

export interface Bracket {
  id: string;
  tournamentId: string;
  tournament?: Tournament;
  type: TournamentFormat;
  createdAt: string;
}

export interface Match {
  id: string;
  bracketId: string;
  bracket?: Bracket;
  roundNumber: number;
  matchNumber: number;
  player1Id: string;
  player1?: User;
  player2Id: string;
  player2?: User;
  winnerId?: string;
  winner?: User;
  loserId?: string;
  loser?: User;
  status: MatchStatus;
  scheduledAt?: string;
  finishedAt?: string;
}

export interface TournamentMessage {
  id: string;
  tournamentId: string;
  userId: string;
  user?: User;
  message: string;
  createdAt: string;
}

export interface AuthResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  accessToken: string;
}
