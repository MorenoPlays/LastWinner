import { User, Clip, Tournament } from '@/lib/types'
import { UserAvatar } from './user-avatar'
import { ClipCard } from './clip-card'
import { cn } from '@/lib/utils'
import { Trophy, TrendingUp, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

interface TrendingUsersProps {
  users: User[]
  className?: string
}

export function TrendingUsers({ users, className }: TrendingUsersProps) {
  return (
    <div className={cn('rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4', className)}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-foreground">Trending Players</h3>
      </div>

      <div className="space-y-3">
        {users.slice(0, 5).map((user, i) => (
          <Link 
            key={user.id}
            to={`/user/${user.id}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <span className="text-sm font-bold text-muted-foreground w-4">
              {i + 1}
            </span>
            <UserAvatar user={user} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">
                {user.display_name}
              </p>
              <p className="text-xs text-muted-foreground">
                @{user.username}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <button className="w-full mt-3 py-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
        View all players
      </button>
    </div>
  )
}

interface TrendingClipsProps {
  clips: Clip[]
  className?: string
}

export function TrendingClips({ clips, className }: TrendingClipsProps) {
  return (
    <div className={cn('rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-foreground">Top Clips</h3>
      </div>

      <div className="space-y-3">
        {clips.slice(0, 4).map(clip => (
          <ClipCard key={clip.id} clip={clip} variant="compact" />
        ))}
      </div>

      <Link 
        to="/clips"
        className="block w-full mt-3 py-2 text-sm text-primary hover:text-primary/80 font-medium text-center transition-colors"
      >
        View all clips
      </Link>
    </div>
  )
}

interface LiveTournamentsProps {
  tournaments?: Tournament[]
  className?: string
}

export function LiveTournaments({ tournaments, className }: LiveTournamentsProps) {
  // Only show tournaments that have an active stream link
  const liveTournaments = tournaments?.filter(
    (tournament) => tournament.status === 'in_progress' && Boolean((tournament as any).stream_url)
  ) ?? []
  const displayed = liveTournaments.slice(0, 3)

  return (
    <div className={cn('rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4', className)}>
      <div className="flex items-center gap-2 mb-4">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        <h3 className="font-bold text-foreground">Live Now</h3>
      </div>

      <div className="space-y-3">
        {displayed.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-card/50 p-4 text-sm text-muted-foreground">
            Nenhum torneio ao vivo no momento.
          </div>
        ) : (
          displayed.map((tournament) => (
            <Link
              key={tournament.id}
              to={`/tournaments/${tournament.id}`}
              className="block p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground text-sm">{(tournament as Tournament).title ?? tournament.name}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                  {tournament.status === 'in_progress' ? 'LIVE' : 'OPEN'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {tournament.description ?? 'Partidas ao vivo'}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{tournament.status === 'in_progress' ? 'Ao vivo agora' : 'Aberto para inscrição'}</span>
              </div>
            </Link>
          ))
        )}
      </div>

      <Link
        to="/tournaments"
        className="block w-full mt-3 py-2 text-sm text-primary hover:text-primary/80 font-medium text-center transition-colors"
      >
        Ver torneios
      </Link>
    </div>
  )
}
