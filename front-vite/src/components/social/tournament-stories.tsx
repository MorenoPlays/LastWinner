import { Tournament } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  tournaments?: Tournament[]
  loading?: boolean
}

export function TournamentStories({ tournaments = [], loading = false }: Props) {
  const items = tournaments.slice(0, 8)

  return (
    <section className={cn('mb-6 rounded-2xl border border-border/50 bg-card/50 p-4', '')}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Tournaments</h3>
        <p className="text-xs text-muted-foreground">Stories</p>
      </div>

      {loading ? (
        <div className="py-6 text-center text-sm text-muted-foreground">Carregando torneios...</div>
      ) : items.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">Nenhum torneio disponível</div>
      ) : (
        <div className="flex gap-3 overflow-x-auto py-2">
          {items.map((t) => (
            <Link
              key={t.id}
              to={`/tournaments/${t.id}`}
              className="shrink-0 w-40 rounded-xl overflow-hidden bg-slate-800/50 hover:scale-105 transition-transform"
            >
              <div
                className="h-24 bg-cover bg-center"
                style={{ backgroundImage: t.bannerUrl ? `url(${t.bannerUrl})` : undefined, backgroundColor: t.bannerUrl ? undefined : '#0f172a' }}
              />
              <div className="p-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground truncate">{t.title}</p>
                  {t.stream_url ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">LIVE</span>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-1">{t.description || 'Tournament'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
