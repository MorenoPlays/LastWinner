import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'
import type { Clip, Game, User } from '@/lib/types'

interface ApiClip {
  id: string
  userId: string
  gameId: string
  title: string
  description?: string | null
  videoUrl: string
  thumbnail?: string | null
  views: number
  likes: number
  createdAt: string
  user?: {
    id: string
    username: string
    avatarUrl?: string | null
    country?: string | null
  }
  game?: Game
}

function mapAuthor(user?: ApiClip['user']): User {
  return {
    id: user?.id ?? 'unknown',
    username: user?.username ?? 'unknown',
    display_name: user?.username ?? 'Unknown',
    avatar_url: user?.avatarUrl ?? null,
    country_code: user?.country ?? null,
  }
}

function mapClip(apiClip: ApiClip): Clip {
  return {
    id: apiClip.id,
    author: mapAuthor(apiClip.user),
    title: apiClip.title,
    description: apiClip.description ?? '',
    video_url: apiClip.videoUrl,
    thumbnail_url: apiClip.thumbnail ?? '',
    duration: 0,
    game: apiClip.game ?? { id: apiClip.gameId, name: 'Unknown', slug: 'unknown', icon_url: null, banner_url: null },
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
  }
}

export function useClips() {
  const [clips, setClips] = useState<Clip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token') || undefined

    apiGet<ApiClip[]>('/clip', token)
      .then((response) => {
        setClips(response.map(mapClip))
      })
      .catch((err) => {
        console.error('Failed to load clips:', err)
        setError('Não foi possível carregar os clipes no momento.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return { clips, loading, error }
}

export function useClip(id?: string) {
  const [clip, setClip] = useState<Clip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setError('Clip inválido')
      return
    }

    const token = localStorage.getItem('token') || undefined

    apiGet<ApiClip>(`/clip/${id}`, token)
      .then((response) => setClip(mapClip(response)))
      .catch((err) => {
        console.error('Failed to load clip:', err)
        setError('Não foi possível carregar o clip.')
      })
      .finally(() => setLoading(false))
  }, [id])

  return { clip, loading, error }
}
