import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MainNav } from '../components/main-nav'
import { mockComments } from '../lib/mock-data'
import { Heart, MessageCircle, Share2, Bookmark, Play, Eye, Clock } from 'lucide-react'
import { cn } from '../lib/utils'
import { UserAvatar } from '../social/user-avatar'
import { useClip } from '@/hooks/useClips'

export function ClipDetailPage() {
  const { id } = useParams()
  const { clip, loading, error } = useClip(id)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    if (clip) {
      setLiked(clip.is_liked)
      setLikesCount(clip.likes_count)
      setBookmarked(clip.is_bookmarked)
    }
  }, [clip])

  const handleLike = () => {
    setLiked(!liked)
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1))
  }

  const handleBookmark = () => {
    setBookmarked(!bookmarked)
  }

  function formatTimeAgo(dateString: string): string {
    const now = new Date()
    const date = new Date(dateString)
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'Agora mesmo'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m atrás`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`
    return `${Math.floor(seconds / 86400)}d atrás`
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-background">
        <MainNav />
        <main className="container mx-auto px-4 py-6">
          <div className="rounded-2xl border border-border/50 bg-card/50 p-6 text-center text-slate-400">
            Carregando clip...
          </div>
        </main>
      </div>
    )
  }

  if (error || !clip) {
    return (
      <div className="min-h-[100dvh] bg-background">
        <MainNav />
        <main className="container mx-auto px-4 py-6">
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-center text-destructive-foreground">
            {error ?? 'Clip não encontrado.'}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <MainNav />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          <div className="rounded-xl overflow-hidden bg-muted aspect-video">
            <div className="relative inset-0 bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center h-full">
              <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Play className="h-10 w-10 text-white fill-white" />
              </div>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{clip.title}</h1>
              <p className="text-muted-foreground">{clip.description}</p>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{likesCount.toLocaleString()}</span>
              <Clock className="h-4 w-4 ml-2" />
              <span>{formatDuration(clip.duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-border/50">
            <UserAvatar user={clip.author} size="lg" showName showUsername />

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleLike}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                  liked
                    ? 'text-red-500 bg-red-500/10'
                    : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'
                )}
              >
                <Heart className={cn('h-5 w-5', liked && 'fill-current')} />
                <span>{likesCount}</span>
              </button>

              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                <MessageCircle className="h-5 w-5" />
                <span>{clip.comments_count}</span>
              </button>

              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-green-500 hover:bg-green-500/10 transition-all">
                <Share2 className="h-5 w-5" />
              </button>

              <button
                onClick={handleBookmark}
                className={cn(
                  'p-2 rounded-lg transition-all',
                  bookmarked
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                )}
              >
                <Bookmark className={cn('h-5 w-5', bookmarked && 'fill-current')} />
              </button>
            </div>
          </div>

          <div className="pt-6">
            <h2 className="font-semibold text-foreground mb-4">Comments ({mockComments.length})</h2>

            <div className="space-y-4">
              {mockComments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <UserAvatar user={comment.author} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground text-sm">
                        {comment.author.display_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{comment.content}</p>

                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 ml-4 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-2">
                            <UserAvatar user={reply.author} size="sm" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-foreground text-sm">
                                  {reply.author.display_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatTimeAgo(reply.created_at)}
                                </span>
                              </div>
                              <p className="text-sm text-foreground">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
