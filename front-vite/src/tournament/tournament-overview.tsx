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
    day: 'numeric'
  })
}

export function TournamentOverview({ tournament, className }: TournamentOverviewProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border/50 bg-card/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-opacity-20 flex items-center justify-center" style={{ backgroundColor: 'rgba(61, 209, 247, 0.2)' }}>
              <Trophy className="h-5 w-5" style={{ color: '#3dd1f7' }} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prize Pool</p>
              <p className="text-xl font-bold text-foreground">
                {tournament.prizePool ? `${tournament.prizePool?.toLocaleString()} ${tournament.currency}` : 'Free'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-xl border border-border/50 bg-card/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-opacity-20 flex items-center justify-center" style={{ backgroundColor: 'rgba(188, 77, 255, 0.2)' }}>
              <Users className="h-5 w-5" style={{ color: '#bc4dff' }} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Participants</p>
              <p className="text-xl font-bold text-foreground">{tournament.participants.length} </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-xl border border-border/50 bg-card/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-opacity-20 flex items-center justify-center" style={{ backgroundColor: 'rgba(77, 204, 112, 0.2)' }}>
              <Calendar className="h-5 w-5" style={{ color: '#4dcc70' }} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="text-xl font-bold text-foreground">{formatDate(tournament.startDate)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}