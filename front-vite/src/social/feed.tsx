import { useState } from 'react'
import { FeedItem, Post, Clip } from '@/lib/types'
import { PostCard } from './post-card'
import { ClipCard } from './clip-card'
import { cn } from '@/lib/utils'
import { Flame, Clock, TrendingUp, Filter } from 'lucide-react'

interface FeedProps {
  items: FeedItem[]
  className?: string
}

type SortOption = 'hot' | 'new' | 'top'

export function Feed({ items, className }: FeedProps) {
  const [sortBy, setSortBy] = useState<SortOption>('hot')
  const [filterType, setFilterType] = useState<'all' | 'posts' | 'clips'>('all')

  const filteredItems = items.filter(item => {
    if (filterType === 'all') return true
    return item.type === filterType.slice(0, -1)
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'new') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    if (sortBy === 'top') {
      const aLikes = a.type === 'post' ? (a.data as Post).likes_count : (a.data as Clip).likes_count
      const bLikes = b.type === 'post' ? (b.data as Post).likes_count : (b.data as Clip).likes_count
      return bLikes - aLikes
    }
    const getScore = (item: FeedItem) => {
      const likes = item.type === 'post' ? (item.data as Post).likes_count : (item.data as Clip).likes_count
      const ageHours = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60)
      return likes / Math.pow(ageHours + 2, 1.5)
    }
    return getScore(b) - getScore(a)
  })

  return (
    <div className={cn('', className)}>
      <div className="flex items-center justify-between mb-6 p-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSortBy('hot')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              sortBy === 'hot'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <Flame className="h-4 w-4" />
            Em alta
          </button>
          <button
            onClick={() => setSortBy('new')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              sortBy === 'new'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <Clock className="h-4 w-4" />
            Novo
          </button>
          <button
            onClick={() => setSortBy('top')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              sortBy === 'top'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <TrendingUp className="h-4 w-4" />
            Top
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            className="bg-transparent text-sm text-foreground border-none focus:outline-none cursor-pointer"
          >
            <option value="all">Todas</option>
            <option value="posts">Publicações</option>
            <option value="clips">Clipes</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {sortedItems.map(item => (
          item.type === 'post' ? (
            <PostCard key={item.id} post={item.data as Post} />
          ) : (
            <ClipCard key={item.id} clip={item.data as Clip} />
          )
        ))}
      </div>

      {sortedItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum conteúdo encontrado</p>
        </div>
      )}
    </div>
  )
}