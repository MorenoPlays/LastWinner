import { useState } from 'react'
import { ClipCard } from '../../components/social/clip-card'
import { MainNav } from '../../components/main-nav'
import { cn } from '@/lib/utils'
import { Grid, List } from 'lucide-react'
import { useClips } from '@/hooks/useClips'

export function ClipsPage() {
  const { clips, loading, error } = useClips()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <div className="min-h-[100dvh] bg-background">
      <MainNav />

      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Clips</h1>
            <p className="text-muted-foreground">Watch the best gaming moments</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'
              )}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'
              )}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-border/50 bg-card/50 p-6 text-center text-slate-400">
            Carregando clipes...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-center text-destructive-foreground">
            {error}
          </div>
        )}

        {!loading && !error && clips.length === 0 && (
          <div className="rounded-2xl border border-border/50 bg-card/50 p-6 text-center text-slate-400">
            Nenhum clipe encontrado.
          </div>
        )}

        {!loading && !error && clips.length > 0 && (
          <div className={cn(
            viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'
          )}>
            {clips.map((clip) => (
              <ClipCard
                key={clip.id}
                clip={clip}
                variant={viewMode === 'list' ? 'compact' : 'default'}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
