import { Tournament } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Trophy, Users, Calendar } from 'lucide-react'

interface TournamentOverviewProps {
  tournament: Tournament
  className?: string
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function TournamentOverview({
  tournament,
  className,
}: TournamentOverviewProps) {
  console.log('TournamentOverview renderizado com:', tournament)
  return (
    <div className={cn('space-y-6', className)}>
      {/* GRID RESPONSIVO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* PRIZE POOL */}
        <div className="p-3 sm:p-4 rounded-xl border border-border/50 bg-card/50">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(61, 209, 247, 0.2)' }}
            >
              <Trophy className="h-5 w-5" style={{ color: '#3dd1f7' }} />
            </div>

            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                prêmio
              </p>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {tournament.prizePool
                  ? `${tournament.prizePool.toLocaleString()} ${tournament.currency}`
                  : 'Free'}
              </p>
            </div>
          </div>
        </div>

        {/* preco de inscricao */}
        <div className="p-3 sm:p-4 rounded-xl border border-border/50 bg-card/50">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(77, 204, 112, 0.2)' }}
            >
              <Trophy className="h-5 w-5" style={{ color: '#4dcc70' }} />
            </div>

            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Preço de Inscrição
              </p>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {(tournament.entryFee ? tournament.entryFee.toLocaleString() + ' ' + tournament.currency : 'Grátis')}
              </p>
            </div>
          </div>
        </div>

        {/* PARTICIPANTS */}
        <div className="p-3 sm:p-4 rounded-xl border border-border/50 bg-card/50">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(188, 77, 255, 0.2)' }}
            >
              <Users className="h-5 w-5" style={{ color: '#bc4dff' }} />
            </div>

            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Participantes
              </p>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {tournament.participants.length}
              </p>
            </div>
          </div>
        </div>

        {/* START DATE */}
        <div className="p-3 sm:p-4 rounded-xl border border-border/50 bg-card/50">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(77, 204, 112, 0.2)' }}
            >
              <Calendar className="h-5 w-5" style={{ color: '#4dcc70' }} />
            </div>

            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Data de Início
              </p>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {formatDate(tournament.startDate)}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}