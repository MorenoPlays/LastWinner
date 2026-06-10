import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'
import type { User, Tournament, Game, Post, Clip, FeedItem } from '@/lib/types'

interface ApiUser {
  id: string
  username: string
  email: string
  role: string
  avatarUrl?: string | null
  country?: string | null
  wins?: number
  losses?: number
}

interface ApiGame {
  id: string
  name: string
  slug: string
  coverUrl?: string | null
  iconUrl?: string | null
  bannerUrl?: string | null
}

interface ApiPost {
  id: string
  content: string
  imageUrl?: string | null
  videoUrl?: string | null
  tournamentId?: string | null
  matchId?: string | null
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    username: string
    avatarUrl?: string | null
  }
  likes?: Array<{ id: string; userId: string }>
  comments?: Array<{ id: string }>
}

interface ApiClip {
  id: string
  title: string
  description?: string | null
  videoUrl: string
  thumbnail?: string | null
  duration?: number
  views: number
  likes: number
  createdAt: string
  user?: {
    id: string
    username: string
    avatarUrl?: string | null
    country?: string | null
  }
  game?: ApiGame
}

function mapFeedPost(apiPost: ApiPost, currentUserId?: string): FeedItem {
  const likedByCurrentUser = currentUserId
    ? apiPost.likes?.some((like) => like.userId === currentUserId) ?? false
    : false

  return {
    id: `post-${apiPost.id}`,
    type: 'post',
    created_at: apiPost.createdAt,
    data: {
      id: apiPost.id,
      author: {
        id: apiPost.user?.id ?? 'unknown',
        username: apiPost.user?.username ?? 'unknown',
        display_name: apiPost.user?.username ?? 'Unknown',
        avatar_url: apiPost.user?.avatarUrl ?? null,
        country_code: null,
      },
      content: apiPost.content,
      type: 'text',
      media_urls: apiPost.videoUrl ? [apiPost.videoUrl] : apiPost.imageUrl ? [apiPost.imageUrl] : [],
      thumbnail_url: apiPost.imageUrl ?? null,
      tournament: null,
      match: null,
      likes_count: apiPost.likes?.length ?? 0,
      comments_count: apiPost.comments?.length ?? 0,
      shares_count: 0,
      is_liked: likedByCurrentUser,
      is_bookmarked: false,
      created_at: apiPost.createdAt,
      updated_at: apiPost.updatedAt,
    },
  }
}

function mapFeedClip(apiClip: ApiClip): FeedItem {
  return {
    id: `clip-${apiClip.id}`,
    type: 'clip',
    created_at: apiClip.createdAt,
    data: {
      id: apiClip.id,
      author: {
        id: apiClip.user?.id ?? 'unknown',
        username: apiClip.user?.username ?? 'unknown',
        display_name: apiClip.user?.username ?? 'Unknown',
        avatar_url: apiClip.user?.avatarUrl ?? null,
        country_code: apiClip.user?.country ?? null,
      },
      title: apiClip.title,
      description: apiClip.description ?? '',
      video_url: apiClip.videoUrl,
      thumbnail_url: apiClip.thumbnail ?? '',
      duration: apiClip.duration ?? 0,
      game: {
        id: apiClip.game?.id ?? 'unknown',
        name: apiClip.game?.name ?? 'Unknown',
        slug: apiClip.game?.slug ?? 'unknown',
        icon_url: apiClip.game?.iconUrl ?? null,
        banner_url: apiClip.game?.bannerUrl ?? null,
      },
      tournament: null,
      match: null,
      views_count: apiClip.views ?? 0,
      likes_count: apiClip.likes ?? 0,
      comments_count: 0,
      is_liked: false,
      is_bookmarked: false,
      status: 'ready',
      tags: [],
      created_at: apiClip.createdAt,
    },
  }
}

function mapTournamentToFeedItem(t: ApiTournament, currentUserId?: string): FeedItem {
  const likesCount = t.likes?.length ?? 0
  const commentsCount = t.messages?.length ?? 0
  const isLiked = currentUserId ? t.likes?.some((like) => like.userId === currentUserId) ?? false : false

  const tournament: Tournament = {
    id: t.id,
    title: t.title || 'Tournament',
    name: t.title || 'Tournament',
    slug: t.title?.toLowerCase().replace(/\s+/g, '-') || 'tournament',
    description: t.description || '',
    game: {
      id: t.gameId || 'g1',
      name: 'Game',
      slug: 'game',
      icon_url: null,
      banner_url: t.bannerUrl || null,
    },
    format: mapTournamentFormat(t.format),
    status: mapTournamentStatus(t.status),
    maxPlayers: t.maxPlayers || 16,
    participants: t.participants || [],
    team_size: t.teamSize || 5,
    prizePool: t.prizePool || null,
    currency: t.currency || 'USD',
    registration_start: '',
    registration_end: '',
    startDate: t.startDate || new Date().toISOString(),
    endDate: t.endDate || null,
    rules: '',
    bannerUrl: t.bannerUrl || null,
    organizer: mapUser(t.organizer || { id: 'u1', username: 'admin', email: '', role: 'USER' }),
    stream_url: t.streamUrl || null,
    is_featured: t.isFeatured || false,
  }

  const post: Post = {
    id: `tournament-${t.id}`,
    author: tournament.organizer,
    content: t.title || 'Tournament',
    type: 'tournament_share',
    media_urls: tournament.bannerUrl ? [tournament.bannerUrl] : [],
    thumbnail_url: tournament.bannerUrl ?? null,
    tournament,
    match: null,
    likes_count: likesCount,
    comments_count: commentsCount,
    shares_count: 0,
    is_liked: isLiked,
    is_bookmarked: false,
    created_at: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
    updated_at: t.updatedAt ? new Date(t.updatedAt).toISOString() : new Date().toISOString(),
  }

  return {
    id: `tournament-${t.id}`,
    type: 'post' as const,
    data: post,
    created_at: post.created_at,
  }
}


interface ApiTournament {
  id: string
  title: string
  description?: string
  gameId: string
  format?: string
  status?: string
  maxPlayers?: number
  teamSize?: number
  prizePool?: number
  currency?: string
  entryFee?: number
  registrationStart?: string
  registrationEnd?: string
  startDate?: string
  endDate?: string
  createdAt?: string
  updatedAt?: string
  bannerUrl?: string | null
  organizer?: ApiUser
  streamUrl?: string | null
  isFeatured?: boolean
  likes?: Array<{ id: string; userId: string }>
  messages?: Array<{ id: string }>
  participants?: Array<{ id: string }>
}

function mapUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    username: apiUser.username || 'unknown',
    display_name: apiUser.username || 'Unknown',
    avatar_url: apiUser.avatarUrl || null,
    country_code: apiUser.country || null,
  }
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    apiGet<ApiUser[]>('/users')
      .then(apiUsers => {
        const mapped: User[] = apiUsers.map(mapUser)
        setUsers(mapped)
      })
      .catch(e => {
        console.warn('API users error:', e.message)
        setError(e.message)
        setUsers([])
      })
      .finally(() => setLoading(false))
  }, [])

  return { users, loading, error }
}
export function useFeed(currentUserId?: string) {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)

    Promise.allSettled([apiGet<ApiPost[]>('/post'), apiGet<ApiClip[]>('/clip'), apiGet<ApiTournament[]>('/tournament')])
      .then((results) => {
        const feedItems: FeedItem[] = []

        if (results[0].status === 'fulfilled') {
          feedItems.push(...results[0].value.map((post) => mapFeedPost(post, currentUserId)))
        }

        if (results[1].status === 'fulfilled') {
          feedItems.push(...results[1].value.map(mapFeedClip))
        }

        // Add tournaments without stream links to the feed (as shared posts)
        if (results[2].status === 'fulfilled') {
          const tournaments = results[2].value
          const tournamentsToShow = tournaments.filter(t => !t.streamUrl)
          feedItems.push(...tournamentsToShow.map((t) => mapTournamentToFeedItem(t, currentUserId)))
        }

        if (feedItems.length === 0) {
          setError('Nenhum conteúdo disponível no feed no momento.')
          setItems([])
          return
        }

        feedItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setItems(feedItems)
      })
      .catch((e) => {
        console.warn('Feed load error:', e.message)
        setError('Não foi possível carregar o feed.')
        setItems([])
      })
      .finally(() => setLoading(false))
  }, [currentUserId])

  return { items, loading, error }
}
function mapTournamentFormat(format?: string): Tournament['format'] {
  const formatMap: Record<string, Tournament['format']> = {
    'SINGLE_ELIMINATION': 'single_elimination',
    'DOUBLE_ELIMINATION': 'double_elimination',
    'ROUND_ROBIN': 'round_robin',
    'SWISS': 'swiss',
    'single_elimination': 'single_elimination',
    'double_elimination': 'double_elimination',
    'round_robin': 'round_robin',
    'swiss': 'swiss',
  }
  return formatMap[format?.toUpperCase() || ''] || 'single_elimination'
}

export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    apiGet<ApiTournament[]>('/tournament')
      .then(apiTournaments => {
        const mapped: Tournament[] = apiTournaments.map(t => ({
          id: t.id,
          title: t.title || 'Tournament',
          slug: t.title?.toLowerCase().replace(/\s+/g, '-') || 'tournament',
          description: t.description || '',
          game: {
            id: t.gameId || 'g1',
            name: 'Game',
            slug: 'game',
            icon_url: null,
            banner_url: null,
          },
          format: mapTournamentFormat(t.format),
          status: mapTournamentStatus(t.status),
          
          maxPlayers: t.maxPlayers || 16,
          participants: t.participants || [],
          team_size: t.teamSize || 5,
          entryFee: t.entryFee || null,
          prizePool: t.prizePool || null,
          currency: t.currency || 'USD',
          registration_start: '',
          registration_end: '',
          startDate: t.startDate || new Date().toISOString(),
          endDate: t.endDate || null,
          rules: '',
          bannerUrl: t.bannerUrl || null,
          organizer: mapUser(t.organizer || { id: 'u1', username: 'admin', email: '', role: 'USER' }),
          stream_url: t.streamUrl || null,
          is_featured: t.isFeatured || false,
        }))
        setTournaments(mapped)
      })
      .catch(e => {
        console.warn('API tournament error:', e.message)
        setError(e.message)
        setTournaments([])
      })
      .finally(() => setLoading(false))
  }, [])

  return { tournaments, loading, error }
}

function mapTournamentStatus(status?: string): Tournament['status'] {
  const statusMap: Record<string, Tournament['status']> = {
    'draft': 'draft',
    'open': 'registration',
    'ongoing': 'in_progress',
    'finished': 'completed',
    'canceled': 'cancelled',
    'registration': 'registration',
    'in_progress': 'in_progress',
    'completed': 'completed',
    'cancelled': 'cancelled',
  }
  return statusMap[status?.toLowerCase() || ''] || 'draft'
}

export function useGames() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    apiGet<ApiGame[]>('/game')
      .then(apiGames => {
        const mapped: Game[] = apiGames.map(g => ({
          id: g.id,
          name: g.name || 'Game',
          slug: g.slug || g.name?.toLowerCase().replace(/\s+/g, '-') || 'game',
          icon_url: g.iconUrl || g.coverUrl || null,
          banner_url: g.bannerUrl || null,
        }))
        setGames(mapped)
      })
      .catch(e => {
        console.warn('API games error:', e.message)
        setError(e.message)
        setGames([])
      })
      .finally(() => setLoading(false))
  }, [])

  return { games, loading, error }
}