'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { Match } from '@/lib/types'
import { MatchCard } from './match-card'

interface MatchListProps {
  matches: Match[]
  className?: string
}

function groupMatchesByStatus(matches: Match[]) {
  const live = matches.filter(match => match.status === 'in_progress')
  const upcoming = matches.filter(match => match.status === 'pending')
  const completed = matches.filter(match => match.status === 'completed')

  return { live, upcoming, completed }
}

function StatusBadge({
  tone,
  children,
}: {
  tone: 'rose' | 'secondary' | 'emerald'
  children: React.ReactNode
}) {
  const toneClasses = {
    rose: 'bg-rose-500/10 text-rose-500',
    secondary: 'bg-secondary/10 text-secondary',
    emerald: 'bg-emerald-500/10 text-emerald-500',
  }

  return (
    <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]', toneClasses[tone])}>
      {children}
    </span>
  )
}

export function MatchList({ matches, className }: MatchListProps) {
  const { live, upcoming, completed } = groupMatchesByStatus(matches)

  return (
    <div className={cn('space-y-6', className)}>
      {live.length > 0 && (
        <section>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <StatusBadge tone="rose">
              <span className="text-xs font-semibold">Live Now</span>
            </StatusBadge>
            <span className="text-sm text-muted-foreground">
              {live.length} {live.length === 1 ? 'match' : 'matches'}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {live.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <StatusBadge tone="secondary">
              <span className="text-xs font-semibold">Upcoming</span>
            </StatusBadge>
            <span className="text-sm text-muted-foreground">
              {upcoming.length} {upcoming.length === 1 ? 'match' : 'matches'}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <StatusBadge tone="emerald">
              <span className="text-xs font-semibold">Completed</span>
            </StatusBadge>
            <span className="text-sm text-muted-foreground">
              {completed.length} {completed.length === 1 ? 'match' : 'matches'}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {matches.length === 0 && (
        <div className="rounded-[1.75rem] border border-border/50 bg-card/70 p-10 text-center text-muted-foreground">
          No matches scheduled yet
        </div>
      )}
    </div>
  )
}
