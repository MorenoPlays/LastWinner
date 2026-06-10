import { Tournament } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Trophy, Users, Calendar, DollarSign } from 'lucide-react'

interface TournamentHeaderProps {
  tournament: Tournament
  className?: string
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatPrizePool(amount: number, currency: string): string {
  if (currency === 'KZ' || currency === 'AOA') {
    return `${amount.toLocaleString()} ${currency}`
  }
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: ['USD', 'EUR', 'GBP', 'JPY', 'BRL'].includes(currency) ? currency : 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  } catch {
    return `${amount} ${currency}`
  }
}

export function TournamentHeader({ tournament, className }: TournamentHeaderProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Header background imagem do torneio */}
      <div className="relative h-64 rounded-b-3xl overflow-hidden" style={{ 
        backgroundImage: `url(${tournament.bannerUrl || '/default-tournament-banner.jpg'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0d0d14, transparent)' }}></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ 
              background: "black",
            }}>
              {/*  avatar do organizador */}
              <Trophy className="h-10 w-10 text-white" />
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#f0f0ff' }}>{tournament.title}</h1>
              <p className="max-w-2xl mb-4" style={{ color: '#a6a6c0' }}>{tournament.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: '#a6a6c0' }}>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" style={{ color: '#3dd1f7' }} />
                  <span>{tournament.game.name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{tournament.participants.length}/{tournament.maxPlayers} participantes</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(tournament.startDate)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span>{formatPrizePool(tournament.prizePool || 0, tournament.currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}