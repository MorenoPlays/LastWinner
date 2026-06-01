import { Game } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { Gamepad2, Trophy } from 'lucide-react'

interface GameCardProps {
  game: Game
  className?: string
}

export function GameCard({ game, className }: GameCardProps) {
  return (
    <Link
      to={`/games/${game.slug}`}
      className={cn(
        'block rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 transition-all hover:border-border hover:shadow-lg',
        className
      )}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Gamepad2 className="h-7 w-7 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-foreground">{game.name}</h3>
          <p className="text-sm text-muted-foreground">Competitivo</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Trophy className="h-4 w-4" />
        <span>Tournaments available</span>
      </div>
    </Link>
  )
}