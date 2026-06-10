import { Tournament } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Trophy, Users, Calendar, DollarSign } from 'lucide-react'
import { Link } from 'react-router-dom'

interface TournamentCardProps {
  tournament: Tournament
  className?: string
}

export function TournamentCard({ tournament, className }: TournamentCardProps) {
  const statusColors = {
    draft: 'bg-muted text-muted-foreground',
    registration: 'bg-primary/20 text-primary',
    in_progress: 'bg-red-500/20 text-red-400',
    completed: 'bg-success/20 text-success',
    cancelled: 'bg-destructive/20 text-destructive'
  }

  return (
    <Link
      to={`/tournament/${tournament.id}`}
      className={cn(
        'block rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 transition-all hover:border-border hover:shadow-lg',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Trophy className="h-6 w-6 text-white" />
        </div>
        <span className={cn(
          'px-3 py-1 rounded-full text-xs font-medium text-white uppercase',
          statusColors[tournament.status]
        )}>
          {/* tranformar os status em portugues */}
          {tournament.status === 'draft' && 'Rascunho'}
          {tournament.status === 'registration' && 'Em Inscrições'}
          {tournament.status === 'in_progress' && 'Em Andamento'}
          {tournament.status === 'completed' && 'Concluído'}
          {tournament.status === 'cancelled' && 'Cancelado'}
        </span>
      </div>

      <h3 className="font-bold text-lg text-foreground mb-2">{tournament.title}</h3>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{tournament.participants.length}/{tournament.maxPlayers} participantes</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Trophy className="h-4 w-4" />
          <span>{tournament.entryFee ? `${tournament.entryFee?.toLocaleString()} ${tournament.currency}` : 'Grátis'}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Trophy className="h-4 w-4" />
          <span>{tournament.prizePool ? `${tournament.prizePool?.toLocaleString()} ${tournament.currency}` : 'Grátis'}</span>
        </div>
      </div>
    </Link>
  )
}