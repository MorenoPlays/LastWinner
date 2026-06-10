import { useState } from 'react'
import { Clip } from '@/lib/types'
import { UserAvatar } from './user-avatar'
import { cn } from '@/lib/utils'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  Play,
  Eye,
  Clock,
  Trophy,
  MoreHorizontal
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface ClipCardProps {
  clip: Clip
  variant?: 'default' | 'compact' | 'featured'
  className?: string
}

function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'Agora mesmo'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m atrás`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d atrás`
  return date.toLocaleDateString()
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function ClipCard({ clip, variant = 'default', className }: ClipCardProps) {
  const [liked, setLiked] = useState(clip.is_liked)
  const [likesCount, setLikesCount] = useState(clip.likes_count)
  const [bookmarked, setBookmarked] = useState(clip.is_bookmarked)

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLiked(!liked)
    setLikesCount(prev => liked ? prev - 1 : prev + 1)
  }

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setBookmarked(!bookmarked)
  }

  if (variant === 'compact') {
    return (
      <Link 
        to={`/clips/${clip.id}`}
        className={cn(
          'group flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors',
          className
        )}
      >
        <div className="relative w-32 aspect-video rounded-lg overflow-hidden bg-muted flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Play className="h-6 w-6 text-white/80" />
          </div>
          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-xs text-white">
            {formatDuration(clip.duration)}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {clip.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {clip.author.display_name}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatNumber(clip.views_count)}
            </span>
            <span>{formatTimeAgo(clip.created_at)}</span>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <Link 
        to={`/clips/${clip.id}`}
        className={cn(
          'group relative block rounded-xl overflow-hidden',
          className
        )}
      >
        <div className="relative aspect-video bg-muted">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="h-8 w-8 text-white fill-white" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/80 text-sm text-white font-medium">
            {formatDuration(clip.duration)}
          </div>
          {clip.tournament && (
            <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-primary/90 text-xs text-white font-medium flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              Tournament Clip
            </div>
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {clip.title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserAvatar user={clip.author} size="sm" />
              <span className="text-white/90 text-sm">{clip.author.display_name}</span>
            </div>
            <div className="flex items-center gap-3 text-white/70 text-sm">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {formatNumber(clip.views_count)}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {formatNumber(clip.likes_count)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <article 
      className={cn(
        'rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden transition-all hover:border-border',
        className
      )}
    >
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <UserAvatar user={clip.author} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {clip.author.display_name}
              </span>
              <span className="text-muted-foreground">
                @{clip.author.username}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatTimeAgo(clip.created_at)}
            </span>
          </div>
        </div>
        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <Link to={`/clips/${clip.id}`} className="group relative block aspect-video bg-muted">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="h-7 w-7 text-white fill-white" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/80 text-sm text-white font-medium flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDuration(clip.duration)}
        </div>
        <div className="absolute top-2 left-2 flex items-center gap-2">
          {clip.tournament && (
            <span className="px-2 py-1 rounded-md bg-primary/90 text-xs text-white font-medium flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              Torneio
            </span>
          )}
        </div>
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/80 text-xs text-white flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {formatNumber(clip.views_count)} visualizações
        </div>
      </Link>

      <div className="p-4 pt-3">
        <Link to={`/clips/${clip.id}`}>
          <h3 className="font-bold text-foreground text-lg mb-1 hover:text-primary transition-colors">
            {clip.title}
          </h3>
        </Link>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
          {clip.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {clip.tags.slice(0, 4).map(tag => (
            <span 
              key={tag}
              className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground hover:bg-muted/80 cursor-pointer transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-1">
            <button
              onClick={handleLike}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
                liked 
                  ? 'text-red-500 bg-red-500/10' 
                  : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'
              )}
            >
              <Heart className={cn('h-5 w-5', liked && 'fill-current')} />
              <span className="text-sm font-medium">{formatNumber(likesCount)}</span>
            </button>
            
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{formatNumber(clip.comments_count)}</span>
            </button>
            
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-green-500 hover:bg-green-500/10 transition-all">
              <Share2 className="h-5 w-5" />
            </button>
          </div>

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
    </article>
  )
}