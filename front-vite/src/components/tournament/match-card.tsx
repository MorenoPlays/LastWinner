'use client'

import { cn } from '@/lib/utils'
import type { Match, Participant } from '@/lib/types'
import { getParticipantName, getParticipantTag } from '@/lib/mock-data'

interface MatchCardProps {
  match: Match
  compact?: boolean
  className?: string
  onClick?: () => void
}

function ParticipantRow({
  participant,
  score,
  isWinner,
}: {
  participant: Participant | null
  score: number | null
  isWinner: boolean
}) {
  const name = getParticipantName(participant)
  const tag = getParticipantTag(participant)

  return (
    <div className={cn('flex items-center justify-between gap-3 px-3 py-3 transition-colors', isWinner && 'bg-primary/10')}>
      <div className="flex min-w-0 items-center gap-3">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-semibold', isWinner ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
          {participant?.seed ?? '-'}
        </div>
        <div className="min-w-0">
          <p className={cn(' text-white truncate text-sm font-semibold', isWinner && 'text-primary')}>
            {name}
          </p>
          <p className="text-xs text-muted-foreground truncate">{tag}</p>
        </div>
      </div>
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold', isWinner ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground')}>
        {score ?? '-'}
      </div>
    </div>
  )
}

export function MatchCard({ match, compact = false, className, onClick }: MatchCardProps) {
  const p1Winner = match.winner?.id === match.participant1?.id
  const p2Winner = match.winner?.id === match.participant2?.id

  return (
    <div onClick={onClick} className={cn('group cursor-pointer', className)}>
      <div className={cn('overflow-hidden rounded-[1rem] border border-border bg-card/80 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md', compact ? 'p-4' : 'p-5')}>
        <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-border/70 bg-background/70">
          <ParticipantRow participant={match.participant1} score={match.score1} isWinner={p1Winner} />
          <div className="h-px bg-border/70" />
          <ParticipantRow participant={match.participant2} score={match.score2} isWinner={p2Winner} />
        </div>

        {!compact && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <div className="space-y-1 min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{match.scheduled_time ? 'Scheduled' : 'TBD'}</p>
              <p className="text-sm text-foreground truncate">
                {match.scheduled_time ? new Date(match.scheduled_time).toLocaleString() : 'Match details coming soon'}
              </p>
            </div>
            <div className="rounded-full bg-muted/10 px-3 py-1 text-xs font-semibold text-muted-foreground">
              {match.score1 !== null && match.score2 !== null ? `${match.score1} — ${match.score2}` : 'No score yet'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}