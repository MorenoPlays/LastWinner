import { Clip } from '@/lib/types'
import { ClipCard } from './clip-card'
import { cn } from '@/lib/utils'

interface ClipsGridProps {
  clips: Clip[]
  title?: string
  variant?: 'default' | 'featured'
  loading?: boolean
  className?: string
}

export function ClipsGrid({ clips, title, variant = 'default', loading = false, className }: ClipsGridProps) {
  return (
    <div className={cn('', className)}>
      {title && (
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          {title}
        </h2>
      )}
      
      {loading ? (
        <div className="rounded-3xl border border-border/50 bg-card/50 p-12 text-center text-sm text-muted-foreground">
          Carregando clipes...
        </div>
      ) : clips.length === 0 ? (
        <div className="rounded-3xl border border-border/50 bg-card/50 p-12 text-center text-sm text-muted-foreground">
          Nenhum clipe disponível no momento.
        </div>
      ) : variant === 'featured' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clips.map(clip => (
            <ClipCard key={clip.id} clip={clip} variant="featured" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {clips.map(clip => (
            <ClipCard key={clip.id} clip={clip} />
          ))}
        </div>
      )}
    </div>
  )
}