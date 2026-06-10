import React, { useEffect, useState } from 'react'
import { apiDelete, apiPost } from '@/lib/api'
import { Post } from '@/lib/types'
import { UserAvatar } from './user-avatar'
import { CommentsModal } from './comments-modal'
import { cn } from '@/lib/utils'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Trophy,
  ExternalLink
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface PostCardProps {
  post: Post
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

function PostCardComponent({ post, className }: PostCardProps) {
  const [liked, setLiked] = useState(post.is_liked)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [bookmarked, setBookmarked] = useState(post.is_bookmarked)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)

  useEffect(() => {
    setLiked(post.is_liked)
    setLikesCount(post.likes_count)
    setBookmarked(post.is_bookmarked)
  }, [post])

  const handleLike = async () => {
    const nextLiked = !liked
    const token = localStorage.getItem('token')

    if (!token) {
      setLiked(nextLiked)
      setLikesCount(prev => nextLiked ? prev + 1 : Math.max(0, prev - 1))
      return
    }

    setIsLikeLoading(true)

    try {
      let response
      
      if (post.type === 'tournament_share') {
        const endpoint = `/tournament/${post.tournament?.id}/like`
        response = nextLiked
          ? await apiPost<any>(endpoint, {}, token)
          : await apiDelete<any>(endpoint, token)
      } else {
        const endpoint = `/post/${post.id}/like`
        response = nextLiked
          ? await apiPost<any>(endpoint, {}, token)
          : await apiDelete<any>(endpoint, token)
      }

      setLiked(nextLiked)
      // response should have 'likes' array
      const newCount = response?.likes?.length ?? (nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1))
      setLikesCount(newCount)
    } catch (error) {
      console.error('Failed to update like status for post', error)
      // Revert on error
      setLiked(!nextLiked)
    } finally {
      setIsLikeLoading(false)
    }
  }

  const handleBookmark = () => {
    setBookmarked(!bookmarked)
  }

  return (
    <article 
      className={cn(
        'rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 transition-all hover:border-border',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <UserAvatar user={post.author} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {post.author.display_name}
              </span>
              {post.is_promoted && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300">Anúncio</span>
              )}
              <span className="text-muted-foreground">
                @{post.author.username}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatTimeAgo(post.created_at)}
            </span>
          </div>
        </div>
        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <p className="text-foreground mb-4 whitespace-pre-wrap leading-relaxed">
        {post.content}
      </p>

      {post.type === 'tournament_share' && post.tournament && (
        <Link 
          to={`/tournament/${post.tournament.id}`}
          className="block mb-4 rounded-lg border border-border/50 bg-muted/30 p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                {post.tournament.title}
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </h4>
              <p className="text-sm text-muted-foreground">
                {post.tournament.game.name} - {post.tournament.format.replace('_', ' ')}
              </p>
            </div>
            {post.tournament.status === 'in_progress' && (
              <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </span>
            )}
          </div>
        </Link>
      )}

      {post.media_urls.length > 0 && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img 
            src={post.media_urls[0]} 
            alt="Post media"
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div className="flex items-center gap-1">
          <button
            onClick={handleLike}
            disabled={isLikeLoading}
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
          
            {/* onClick={() => setIsCommentsModalOpen(true)} */}
          
          <button 
            onClick={() => setIsCommentsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-primary bg-primary/10 hover:bg-primary/20 transition-all"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{formatNumber(post.comments_count)}</span>
          </button>
          
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-green-500 hover:bg-green-500/10 transition-all">
            <Share2 className="h-5 w-5" />
            <span className="text-sm font-medium">{formatNumber(post.shares_count)}</span>
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

      <CommentsModal
        post={post}
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
      />
    </article>
  )
}

export const PostCard = React.memo(PostCardComponent)
