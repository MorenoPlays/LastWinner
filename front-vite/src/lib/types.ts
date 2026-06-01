export type TournamentFormat = 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss' | 'custom'
export type TournamentStatus = 'draft' | 'registration' | 'in_progress' | 'completed' | 'cancelled'
export type MatchStatus = 'pending' | 'in_progress' | 'completed' | 'disputed' | 'bye'
export type ParticipantStatus = 'pending' | 'accepted' | 'checked_in' | 'eliminated' | 'winner'
// bannerUrl
// : 
// "https://fanatical.imgix.net/product/original/68310a3e-4b93-45dc-b195-643a7ff53d51.jpeg"
// createdAt
// : 
// "2026-05-27T22:10:52.127Z"
// currency
// : 
// "KZ"
// description
// : 
// "TESTE"
// endDate
// : 
// null
// entryFee
// : 
// 5000
// format
// : 
// "DOUBLE_ELIMINATION"
// gameId
// : 
// "51f5e4ef-bed8-46a6-b44c-1dec805f7816"
// id
// : 
// "b71a3b26-ed0b-4508-9b51-1608aa2ebe2d"
// maxPlayers
// : 
// 8
// mode
// : 
// "PRESENTIAL"
// organizerId
// : 
// "3c8f6823-ff44-4465-8be8-fe1f626e48e0"
// participants
// : 
// (4) [{…}, {…}, {…}, {…}]
// prizePool
// : 
// 25000
// startDate
// : 
// null
// status
// : 
// "OPEN"
// title
// : 
// "Torre do Zango"
// updatedAt
// : 
// "2026-05-31T15:18:45.567Z"


export interface User {
   id: string
   username: string
   display_name: string
   avatar_url: string | null
   email?: string
   role?: string
   elo?: number
   wins?: number
   losses?: number
   isVerified?: boolean
   phoneNumber?: string | null
   country?: string | null
   bio?: string | null
   createdAt?: string
   updatedAt?: string
   avatarUrl?: string | null
 }

export interface Team {
  id: string
  name: string
  tag: string
  logo_url: string | null
  captain: User
  members: User[]
}

export interface Game {
  id: string
  name: string
  slug: string
  icon_url: string | null
  banner_url: string | null
}

export interface Tournament {
  id: string
  title: string
  slug: string
  description: string
  game: Game
  format: TournamentFormat
  status: TournamentStatus
  maxPlayers: number
participants: any[]
  team_size: number
  prizePool: number | null
  currency: string
  registration_start: string
  registration_end: string
  startDate: string
  endDate: string | null
  rules: string
  bannerUrl: string | null
  organizer: User
  stream_url: string | null
  is_featured: boolean
}

export interface Participant {
  id: string
  tournament_id: string
  user: User | null
  team: Team | null
  seed: number | null
  status: ParticipantStatus
  checked_in_at: string | null
  wins: number
  losses: number
  is_team: boolean
}

export interface Match {
  id: string
  tournament_id: string
  round: number
  match_number: number
  bracket_position: string
  participant1: Participant | null
  participant2: Participant | null
  winner: Participant | null
  score1: number | null
  score2: number | null
  status: MatchStatus
  scheduled_time: string | null
  started_at: string | null
  completed_at: string | null
  stream_url: string | null
  vod_url: string | null
  next_match_id: string | null
  is_losers_bracket: boolean
}

export interface MatchStats {
  id: string
  match_id: string
  participant: Participant
  kills: number
  deaths: number
  assists: number
  score: number
  custom_stats: Record<string, number>
}

export interface BracketRound {
  round: number
  name: string
  matches: Match[]
  isLosers?: boolean
}

export interface BracketData {
  format: TournamentFormat
  rounds: BracketRound[]
  losersRounds?: BracketRound[]
  grandFinal?: Match
}

export type PostType = 'text' | 'image' | 'video' | 'clip' | 'tournament_share' | 'match_share'
export type ClipStatus = 'processing' | 'ready' | 'failed'

export interface Post {
  id: string
  author: User
  content: string
  type: PostType
  media_urls: string[]
  thumbnail_url: string | null
  tournament: Tournament | null
  match: Match | null
  likes_count: number
  comments_count: number
  shares_count: number
  is_liked: boolean
  is_bookmarked: boolean
  is_promoted?: boolean
  created_at: string
  updated_at: string
}

export interface Clip {
  id: string
  author: User
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  duration: number
  game: Game
  tournament: Tournament | null
  match: Match | null
  views_count: number
  likes_count: number
  comments_count: number
  is_liked: boolean
  is_bookmarked: boolean
  status: ClipStatus
  tags: string[]
  created_at: string
}

export interface Comment {
  id: string
  author: User
  content: string
  likes_count: number
  is_liked: boolean
  replies: Comment[]
  created_at: string
}

export interface FeedItem {
  id: string
  type: 'post' | 'clip'
  data: Post | Clip
  created_at: string
}