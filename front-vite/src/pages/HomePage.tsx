
import { useState } from 'react'
import { apiPost } from '@/lib/api'
import { useTournaments, useUsers, useFeed } from '@/hooks/useApi'
import { useClips } from '@/hooks/useClips'
import { Feed } from '../social/feed'
import { CreatePost } from '../social/create-post'
import { ClipsGrid } from '../social/clips-grid'
import { TrendingUsers, TrendingClips, LiveTournaments } from '../social/sidebar-widgets'
import { TournamentStories } from '../social/tournament-stories'
import { MainNav } from '../components/main-nav'
import { useAuth } from '@/hooks/useAuth'
import type { FeedItem, Post, User } from '@/lib/types'

interface ApiPost {
  id: string
  content: string
  imageUrl?: string | null
  videoUrl?: string | null
  tournamentId?: string | null
  matchId?: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    username: string
    avatarUrl?: string | null
  }
  likes?: Array<{ id: string; userId: string }>
  comments?: Array<{ id: string }>
}

function mapApiPostToFeedItem(apiPost: ApiPost, currentUserId?: string): FeedItem {
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
        id: apiPost.user.id,
        username: apiPost.user.username,
        display_name: apiPost.user.username,
        avatar_url: apiPost.user.avatarUrl ?? null,
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
    } as Post,
  }
}

export function HomePage() {
  const { user } = useAuth()
  const [localPosts, setLocalPosts] = useState<FeedItem[]>([])
  const { tournaments = [], loading: tournamentsLoading, error: tournamentsError } = useTournaments()
  const { users = [], loading: usersLoading, error: usersError } = useUsers()
  const { clips = [], loading: clipsLoading, error: clipsError } = useClips()
  const { items: feedItems = [], loading: feedLoading, error: feedError } = useFeed(user?.id)

  const featuredClips = clips.slice(0, 4)
  const trendingClips = clips.slice(0, 4)
  const isLoading = tournamentsLoading || usersLoading || clipsLoading || feedLoading
  const hasError = Boolean(tournamentsError || usersError || clipsError || feedError)

  const handleNewPost = async (content: string, attachments: string[]) => {
    if (!user) return
    const token = localStorage.getItem('token')
    if (!token) return

    const imageAttachment = attachments.find((item) => item.endsWith('.png') || item.endsWith('.jpg') || item.endsWith('.jpeg') || item.endsWith('.webp'))
    const videoAttachment = attachments.find((item) => item.endsWith('.mp4') || item.endsWith('.mov') || item.endsWith('.webm'))

    const createData: Record<string, unknown> = {
      userId: user.id,
      content,
    }

    if (imageAttachment) {
      createData.imageUrl = imageAttachment
    }
    if (videoAttachment) {
      createData.videoUrl = videoAttachment
    }

    try {
      const createdPost = await apiPost<ApiPost>('/post', createData, token)
      setLocalPosts((prev) => [mapApiPostToFeedItem(createdPost, user.id), ...prev])
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }

  const combinedFeedItems = [...localPosts, ...feedItems]

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 py-6">
        {
            user ? (
              <CreatePost className="mb-6" onPost={handleNewPost} />
            ) : (
              <div className="mb-6 rounded-2xl border border-border/50 bg-card/50 p-6 text-center text-sm text-muted-foreground">
                <p className="mb-2">Faça login para criar posts e interagir com a comunidade!</p>
                <a href="/login" className="inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                  Entrar
                </a>
              </div>
            )

          }
        <div className="flex gap-6">
          <div className="flex-1 max-w-2xl">
            <section className="mb-8">
              <ClipsGrid
                clips={featuredClips}
                title="Clipes em destaque"
                variant="featured"
                loading={clipsLoading}
              />
            </section>
          
            {/* <CreatePost className="mb-6" /> */}

            {/* <TournamentStories tournaments={tournaments} loading={tournamentsLoading} /> */}

            <Feed items={combinedFeedItems} />

            {isLoading && (
              <div className="mt-4 rounded-2xl border border-border/50 bg-card/50 p-4 text-sm text-muted-foreground">
                Carregando conteúdo...
              </div>
            )}

            {hasError && !isLoading && (
              <div className="mt-4 rounded-2xl border border-border/50 bg-card/50 p-4 text-sm text-muted-foreground space-y-2">
                {clipsError && <p>Erro ao carregar clipes: {clipsError}</p>}
                {feedError && <p>Erro ao carregar o feed: {feedError}</p>}
                {usersError && <p>Erro ao carregar usuários: {usersError}</p>}
                {tournamentsError && <p>Erro ao carregar torneios: {tournamentsError}</p>}
              </div>
            )}
          </div>

          <aside className="hidden xl:block w-96 space-y-4">
            <LiveTournaments tournaments={tournaments} />
            <TrendingClips clips={trendingClips} />
            <TrendingUsers users={users} />
          </aside>
        </div>
      </main>
    </div>
  )
}