'use client';

import { cn } from '@/lib/utils';
import type { Match, Participant } from '@/lib/types';
import { getParticipantName, getParticipantTag } from '@/lib/mock-data';
import { Play, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  compact?: boolean;
  className?: string;
}

type MatchBadgeTone = 'rose' | 'emerald' | 'amber' | 'muted' | 'secondary';

function getStatusMeta(status: Match['status']): { label: string; tone: MatchBadgeTone; icon: typeof Play } {
  switch (status) {
    case 'in_progress':
      return { label: 'Live', tone: 'rose', icon: Play };
    case 'completed':
      return { label: 'Completed', tone: 'emerald', icon: CheckCircle2 };
    case 'disputed':
      return { label: 'Disputed', tone: 'amber', icon: AlertTriangle };
    case 'bye':
      return { label: 'Bye', tone: 'muted', icon: Clock };
    default:
      return { label: 'Upcoming', tone: 'secondary', icon: Clock };
  }
}

function StatusBadge({ status }: { status: Match['status'] }) {
  const meta = getStatusMeta(status);
  const toneClasses: Record<MatchBadgeTone, string> = {
    rose: 'bg-rose-500/10 text-rose-500 border border-rose-500/10',
    emerald: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10',
    amber: 'bg-amber-500/10 text-amber-500 border border-amber-500/10',
    muted: 'bg-muted/10 text-muted-foreground border border-border/50',
    secondary: 'bg-secondary/10 text-secondary border border-secondary/10',
  };

  const Icon = meta.icon;

  return (
    <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]', toneClasses[meta.tone])}>
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

function ParticipantRow({
  participant,
  score,
  isWinner,
}: {
  participant: Participant | null;
  score: number | null;
  isWinner: boolean;
}) {
  const name = getParticipantName(participant);
  const tag = getParticipantTag(participant);

  return (
    <div className={cn('flex items-center justify-between gap-3 px-3 py-3 transition-colors', isWinner && 'bg-primary/10')}>
      <div className="flex min-w-0 items-center gap-3">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-semibold', isWinner ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
          {participant?.seed ?? '-'}
        </div>
        <div className="min-w-0">
          <p className={cn('truncate text-sm font-semibold', isWinner && 'text-primary')}>
            {name}
          </p>
          <p className="text-xs text-muted-foreground truncate">{tag}</p>
        </div>
      </div>
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold', isWinner ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground')}>
        {score ?? '-'}
      </div>
    </div>
  );
}

export function MatchCard({ match, compact = false, className }: MatchCardProps) {
  const isLive = match.status === 'in_progress';
  const p1Winner = match.winner?.id === match.participant1?.id;
  const p2Winner = match.winner?.id === match.participant2?.id;

  return (
    <article className={cn('group overflow-hidden rounded-[1.75rem] border border-border bg-card/80 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md', compact ? 'p-4' : 'p-5', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground truncate">{match.bracket_position ?? `Round ${match.round}`}</p>
          <h3 className="text-base font-semibold text-foreground truncate">Match {match.match_number}</h3>
        </div>

        <StatusBadge status={match.status} />
      </div>

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
    </article>
  );
}