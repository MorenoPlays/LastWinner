import type { Tournament, Participant, Match, BracketData, User, Team, Game, Post, Clip, Comment, FeedItem } from './types'

const valorant: Game = {
  id: 'game-1',
  name: 'VALORANT',
  slug: 'valorant',
  icon_url: null,
  banner_url: null,
}

export const mockUsers: User[] = [
  { id: 'u1', username: 'shadowstrike', display_name: 'ShadowStrike', avatar_url: null, country_code: 'US' },
  { id: 'u2', username: 'neonblade', display_name: 'NeonBlade', avatar_url: null, country_code: 'KR' },
  { id: 'u3', username: 'frostbyte', display_name: 'FrostByte', avatar_url: null, country_code: 'DE' },
  { id: 'u4', username: 'blazerunner', display_name: 'BlazeRunner', avatar_url: null, country_code: 'BR' },
  { id: 'u5', username: 'voidwalker', display_name: 'VoidWalker', avatar_url: null, country_code: 'JP' },
  { id: 'u6', username: 'thunderclap', display_name: 'ThunderClap', avatar_url: null, country_code: 'SE' },
  { id: 'u7', username: 'ironwill', display_name: 'IronWill', avatar_url: null, country_code: 'CA' },
  { id: 'u8', username: 'phantomace', display_name: 'PhantomAce', avatar_url: null, country_code: 'UK' },
  { id: 'u9', username: 'stormchaser', display_name: 'StormChaser', avatar_url: null, country_code: 'AU' },
  { id: 'u10', username: 'nighthawk', display_name: 'NightHawk', avatar_url: null, country_code: 'FR' },
  { id: 'u11', username: 'silentfury', display_name: 'SilentFury', avatar_url: null, country_code: 'ES' },
  { id: 'u12', username: 'darkphoenix', display_name: 'DarkPhoenix', avatar_url: null, country_code: 'IT' },
  { id: 'u13', username: 'coldsnap', display_name: 'ColdSnap', avatar_url: null, country_code: 'RU' },
  { id: 'u14', username: 'swiftbolt', display_name: 'SwiftBolt', avatar_url: null, country_code: 'PL' },
  { id: 'u15', username: 'crimsontide', display_name: 'CrimsonTide', avatar_url: null, country_code: 'NL' },
  { id: 'u16', username: 'emeraldshard', display_name: 'EmeraldShard', avatar_url: null, country_code: 'MX' },
]

const mockTeams: Team[] = mockUsers.map((user, i) => ({
  id: `team-${i + 1}`,
  name: `Team ${user.display_name}`,
  tag: user.display_name.substring(0, 3).toUpperCase(),
  logo_url: null,
  captain: user,
  members: [user],
}))

const mockParticipants: Participant[] = mockTeams.map((team, i) => ({
  id: `p${i + 1}`,
  tournament_id: 'tournament-1',
  user: null,
  team,
  seed: i + 1,
  status: i < 2 ? 'winner' : i < 8 ? 'eliminated' : 'checked_in',
  checked_in_at: new Date().toISOString(),
  wins: i === 0 ? 4 : i === 1 ? 3 : Math.floor(Math.random() * 3),
  losses: i === 0 ? 0 : i === 1 ? 1 : Math.floor(Math.random() * 3) + 1,
  is_team: true,
}))

export const mockTournament: Tournament = {
  id: 'tournament-1',
  name: 'VALORANT Champions Cup',
  slug: 'valorant-champions-cup',
  description: 'The ultimate VALORANT competition featuring the best teams from around the world. Battle through single elimination brackets to claim the championship title and the $50,000 prize pool.',
  game: valorant,
  format: 'single_elimination',
  status: 'in_progress',
  max_participants: 16,
  current_participants: 16,
  team_size: 5,
  prize_pool: 50000,
  currency: 'USD',
  registration_start: '2024-01-01T00:00:00Z',
  registration_end: '2024-01-15T23:59:59Z',
  start_date: '2024-01-20T18:00:00Z',
  end_date: '2024-01-22T23:00:00Z',
  rules: `# Tournament Rules

## General Rules
1. All matches will be played on the latest patch
2. Teams must check in 30 minutes before their scheduled match
3. No-shows will result in automatic forfeit after 10 minutes

## Match Format
- All matches are Best of 3 (Bo3)
- Finals are Best of 5 (Bo5)
- Map pool: All competitive maps

## Code of Conduct
- Respectful behavior is mandatory
- Cheating or exploiting will result in immediate disqualification
- All decisions by tournament admins are final

## Prizes
- 1st Place: $25,000
- 2nd Place: $15,000
- 3rd-4th Place: $5,000 each`,
  banner_url: null,
  organizer: mockUsers[0],
  stream_url: 'https://twitch.tv/valorant',
  is_featured: true,
}

const createMatch = (
  id: string,
  round: number,
  matchNumber: number,
  p1: Participant | null,
  p2: Participant | null,
  winner: Participant | null,
  score1: number | null,
  score2: number | null,
  status: Match['status'],
  nextMatchId: string | null
): Match => ({
  id,
  tournament_id: 'tournament-1',
  round,
  match_number: matchNumber,
  bracket_position: `R${round}M${matchNumber}`,
  participant1: p1,
  participant2: p2,
  winner,
  score1,
  score2,
  status,
  scheduled_time: new Date(Date.now() + (round - 1) * 86400000).toISOString(),
  started_at: status !== 'pending' ? new Date().toISOString() : null,
  completed_at: status === 'completed' ? new Date().toISOString() : null,
  stream_url: round >= 3 ? 'https://twitch.tv/valorant' : null,
  vod_url: status === 'completed' ? 'https://youtube.com/watch?v=example' : null,
  next_match_id: nextMatchId,
  is_losers_bracket: false,
})

const r1m1 = createMatch('m1', 1, 1, mockParticipants[0], mockParticipants[15], mockParticipants[0], 2, 0, 'completed', 'm9')
const r1m2 = createMatch('m2', 1, 2, mockParticipants[7], mockParticipants[8], mockParticipants[7], 2, 1, 'completed', 'm9')
const r1m3 = createMatch('m3', 1, 3, mockParticipants[3], mockParticipants[12], mockParticipants[3], 2, 0, 'completed', 'm10')
const r1m4 = createMatch('m4', 1, 4, mockParticipants[4], mockParticipants[11], mockParticipants[4], 2, 1, 'completed', 'm10')
const r1m5 = createMatch('m5', 1, 5, mockParticipants[1], mockParticipants[14], mockParticipants[1], 2, 0, 'completed', 'm11')
const r1m6 = createMatch('m6', 1, 6, mockParticipants[6], mockParticipants[9], mockParticipants[6], 2, 1, 'completed', 'm11')
const r1m7 = createMatch('m7', 1, 7, mockParticipants[2], mockParticipants[13], mockParticipants[2], 2, 0, 'completed', 'm12')
const r1m8 = createMatch('m8', 1, 8, mockParticipants[5], mockParticipants[10], mockParticipants[5], 2, 1, 'completed', 'm12')

const r2m1 = createMatch('m9', 2, 1, mockParticipants[0], mockParticipants[7], mockParticipants[0], 2, 1, 'completed', 'm13')
const r2m2 = createMatch('m10', 2, 2, mockParticipants[3], mockParticipants[4], mockParticipants[3], 2, 0, 'completed', 'm13')
const r2m3 = createMatch('m11', 2, 3, mockParticipants[1], mockParticipants[6], mockParticipants[1], 2, 1, 'completed', 'm14')
const r2m4 = createMatch('m12', 2, 4, mockParticipants[2], mockParticipants[5], mockParticipants[2], 2, 1, 'completed', 'm14')

const r3m1 = createMatch('m13', 3, 1, mockParticipants[0], mockParticipants[3], mockParticipants[0], 2, 1, 'completed', 'm15')
const r3m2 = createMatch('m14', 3, 2, mockParticipants[1], mockParticipants[2], null, 1, 1, 'in_progress', 'm15')

const r4m1 = createMatch('m15', 4, 1, mockParticipants[0], null, null, null, null, 'pending', null)

export const mockMatches: Match[] = [
  r1m1, r1m2, r1m3, r1m4, r1m5, r1m6, r1m7, r1m8,
  r2m1, r2m2, r2m3, r2m4,
  r3m1, r3m2,
  r4m1,
]

export const mockBracketData: BracketData = {
  format: 'single_elimination',
  rounds: [
    { round: 1, name: 'Round of 16', matches: [r1m1, r1m2, r1m3, r1m4, r1m5, r1m6, r1m7, r1m8] },
    { round: 2, name: 'Quarterfinals', matches: [r2m1, r2m2, r2m3, r2m4] },
    { round: 3, name: 'Semifinals', matches: [r3m1, r3m2] },
    { round: 4, name: 'Finals', matches: [r4m1] },
  ],
}

export const mockParticipantsList: Participant[] = mockParticipants

export function getParticipantName(participant: Participant | null): string {
  if (!participant) return 'TBD'
  if (participant.team) return participant.team.name
  if (participant.user) return participant.user.display_name
  return 'Unknown'
}

export function getParticipantTag(participant: Participant | null): string {
  if (!participant) return '---'
  if (participant.team) return participant.team.tag
  if (participant.user) return participant.user.username.substring(0, 3).toUpperCase()
  return '???'
}
  
  export const mockPosts: Post[] = [
  {
    id: 'post-1',
    author: mockUsers[0],
    content: 'Just secured our spot in the semifinals! The team played absolutely incredible today. GG to Team PhantomAce, they pushed us to the limit. Finals here we come! 🔥',
    type: 'text',
    media_urls: [],
    thumbnail_url: null,
    tournament: mockTournament,
    match: null,
    likes_count: 342,
    comments_count: 47,
    shares_count: 23,
    is_liked: true,
    is_bookmarked: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'post-2',
    author: mockUsers[1],
    content: 'Currently LIVE in the semifinals! Come support us as we fight for a spot in the finals. Stream link in bio!',
    type: 'tournament_share',
    media_urls: [],
    thumbnail_url: null,
    tournament: mockTournament,
    match: null,
    likes_count: 189,
    comments_count: 28,
    shares_count: 45,
    is_liked: false,
    is_bookmarked: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'post-3',
    author: mockUsers[4],
    content: 'That clutch in round 12 was absolutely insane. Sometimes you just have to trust your instincts and go for it. Never give up!',
    type: 'text',
    media_urls: [],
    thumbnail_url: null,
    tournament: null,
    match: null,
    likes_count: 567,
    comments_count: 89,
    shares_count: 34,
    is_liked: true,
    is_bookmarked: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'post-4',
    author: mockUsers[2],
    content: 'Looking for a team to compete in upcoming tournaments. Diamond 3 player, main Jett/Reyna. DM if interested!',
    type: 'text',
    media_urls: [],
    thumbnail_url: null,
    tournament: null,
    match: null,
    likes_count: 78,
    comments_count: 34,
    shares_count: 12,
    is_liked: false,
    is_bookmarked: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
]

export const mockClips: Clip[] = [
  {
    id: 'clip-1',
    author: mockUsers[0],
    title: 'INSANE 1v5 ACE CLUTCH',
    description: 'Down 12-11, had to clutch this round to stay in the game. One of my best plays ever!',
    video_url: 'https://example.com/clips/ace-clutch.mp4',
    thumbnail_url: '/clips/thumbnail-1.jpg',
    duration: 45,
    game: valorant,
    tournament: mockTournament,
    match: null,
    views_count: 15420,
    likes_count: 2341,
    comments_count: 187,
    is_liked: true,
    is_bookmarked: true,
    status: 'ready',
    tags: ['ace', 'clutch', '1v5', 'valorant', 'insane'],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'clip-2',
    author: mockUsers[1],
    title: 'Perfect Flash into 4K',
    description: 'Clean flash setup leading to a quick 4K. Communication is key!',
    video_url: 'https://example.com/clips/flash-4k.mp4',
    thumbnail_url: '/clips/thumbnail-2.jpg',
    duration: 28,
    game: valorant,
    tournament: mockTournament,
    match: null,
    views_count: 8932,
    likes_count: 1256,
    comments_count: 94,
    is_liked: false,
    is_bookmarked: false,
    status: 'ready',
    tags: ['flash', '4k', 'teamwork', 'valorant'],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: 'clip-3',
    author: mockUsers[5],
    title: 'Operator Flick of the Year',
    description: 'Hit this insane flick during ranked. Still cant believe it connected.',
    video_url: 'https://example.com/clips/op-flick.mp4',
    thumbnail_url: '/clips/thumbnail-3.jpg',
    duration: 15,
    game: valorant,
    tournament: null,
    match: null,
    views_count: 45670,
    likes_count: 5678,
    comments_count: 432,
    is_liked: true,
    is_bookmarked: false,
    status: 'ready',
    tags: ['operator', 'flick', 'insane', 'aim', 'valorant'],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'clip-4',
    author: mockUsers[3],
    title: 'Ninja Defuse in Pro Match',
    description: 'Pulled off a ninja defuse in our quarterfinal match. The crowd went wild!',
    video_url: 'https://example.com/clips/ninja-defuse.mp4',
    thumbnail_url: '/clips/thumbnail-4.jpg',
    duration: 32,
    game: valorant,
    tournament: mockTournament,
    match: null,
    views_count: 23456,
    likes_count: 3421,
    comments_count: 256,
    is_liked: false,
    is_bookmarked: true,
    status: 'ready',
    tags: ['ninja', 'defuse', 'pro', 'tournament', 'valorant'],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'clip-5',
    author: mockUsers[7],
    title: 'Movement God - Insane Juke',
    description: 'Sometimes you just gotta trust the movement',
    video_url: 'https://example.com/clips/movement.mp4',
    thumbnail_url: '/clips/thumbnail-5.jpg',
    duration: 22,
    game: valorant,
    tournament: null,
    match: null,
    views_count: 12345,
    likes_count: 1890,
    comments_count: 143,
    is_liked: false,
    is_bookmarked: false,
    status: 'ready',
    tags: ['movement', 'juke', 'skills', 'valorant'],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: 'clip-6',
    author: mockUsers[9],
    title: 'Spray Transfer Triple Kill',
    description: 'Vandal spray control on point today',
    video_url: 'https://example.com/clips/spray-transfer.mp4',
    thumbnail_url: '/clips/thumbnail-6.jpg',
    duration: 18,
    game: valorant,
    tournament: null,
    match: null,
    views_count: 7823,
    likes_count: 923,
    comments_count: 67,
    is_liked: true,
    is_bookmarked: false,
    status: 'ready',
    tags: ['spray', 'transfer', 'vandal', 'aim', 'valorant'],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
]

export const mockComments: Comment[] = [
  {
    id: 'comment-1',
    author: mockUsers[2],
    content: 'Absolutely insane play! How do you stay so calm under pressure?',
    likes_count: 45,
    is_liked: false,
    replies: [
      {
        id: 'reply-1',
        author: mockUsers[0],
        content: 'Thanks! Honestly just lots of practice and trusting my aim',
        likes_count: 23,
        is_liked: true,
        replies: [],
        created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      }
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
  },
  {
    id: 'comment-2',
    author: mockUsers[5],
    content: 'This is why youre the best! GG',
    likes_count: 32,
    is_liked: true,
    replies: [],
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'comment-3',
    author: mockUsers[8],
    content: 'Bro that crosshair placement is chef kiss',
    likes_count: 18,
    is_liked: false,
    replies: [],
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'comment-4',
    author: mockUsers[11],
    content: 'What sens and DPI do you use?',
    likes_count: 8,
    is_liked: false,
    replies: [
      {
        id: 'reply-2',
        author: mockUsers[0],
        content: '800 DPI, 0.3 sens. Pretty standard but feels good',
        likes_count: 15,
        is_liked: false,
        replies: [],
        created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
      }
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
  },
]

export const mockFeed: FeedItem[] = [
   { id: 'feed-1', type: 'clip' as const, data: mockClips[0], created_at: mockClips[0].created_at },
   { id: 'feed-2', type: 'post' as const, data: mockPosts[0], created_at: mockPosts[0].created_at },
   { id: 'feed-3', type: 'post' as const, data: mockPosts[1], created_at: mockPosts[1].created_at },
   { id: 'feed-4', type: 'clip' as const, data: mockClips[1], created_at: mockClips[1].created_at },
   { id: 'feed-5', type: 'post' as const, data: mockPosts[2], created_at: mockPosts[2].created_at },
   { id: 'feed-6', type: 'clip' as const, data: mockClips[2], created_at: mockClips[2].created_at },
   { id: 'feed-7', type: 'post' as const, data: mockPosts[3], created_at: mockPosts[3].created_at },
   { id: 'feed-8', type: 'clip' as const, data: mockClips[3], created_at: mockClips[3].created_at },
   { id: 'feed-9', type: 'clip' as const, data: mockClips[4], created_at: mockClips[4].created_at },
   { id: 'feed-10', type: 'clip' as const, data: mockClips[5], created_at: mockClips[5].created_at },
 ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())