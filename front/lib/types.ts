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

export type CurrencyType = "KZ" | "USD" | "EUR" | "BRL";

export type CurrencySymbol = {
  symbol: string;
  label: string;
};

export const CURRENCY_MAP: Record<CurrencyType, CurrencySymbol> = {
  KZ:  { symbol: "Kz",    label: "Kwanza"  },
  USD: { symbol: "$",     label: "Dólar"   },
  EUR: { symbol: "€",     label: "Euro"    },
  BRL: { symbol: "R$",    label: "Real"    },
};

export function formatCurrency(
  value: number,
  currency: CurrencyType,
  options?: { locale?: string; minimumFractionDigits?: number; maximumFractionDigits?: number }
): string;
export function formatCurrency(
  value: number,
  currency: CurrencyType | undefined,
  options?: { locale?: string; minimumFractionDigits?: number; maximumFractionDigits?: number }
): string;
export function formatCurrency(
  value: number,
  currency: CurrencyType | undefined,
  options?: { locale?: string; minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  const isoCurrency = currency === 'KZ' ? 'AOA' : currency ?? 'USD';
  return Intl.NumberFormat(options?.locale ?? 'pt-PT', {
    style: 'currency',
    currency: isoCurrency,
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(value).replace('AOA', CURRENCY_MAP.KZ.symbol);
}

export type ParticipantStatus = "REGISTERED" | "PENDING" | "CHECKED_IN" | "ELIMINATED" | "WINNER";

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
  currency: CurrencyType;
  prizePool: number;
  startDate?: string;
  endDate?: string;
  bannerUrl?: string;
  createdAt: string;
  updatedAt: string;
  participants?: TournamentParticipant[];
}

export interface TournamentParticipant {
  id: string;
  tournamentId: string;
  tournament?: Tournament;
  userId: string;
  user?: User;
  status: ParticipantStatus;
  paymentProof?: string;
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
  player1Id?: string;
  player1?: User;
  player2Id?: string;
  player2?: User;
  winnerId?: string;
  winner?: User;
  loserId?: string;
  loser?: User;
  status: MatchStatus;
  scheduledAt?: string;
  finishedAt?: string;
  nextMatchId?: string;
  nextMatch?: Match;
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