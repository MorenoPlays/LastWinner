'use client';

import type { Match } from '@/lib/types';
import { Play, Clock, CheckCircle2, AlertCircle, Trophy } from 'lucide-react';

function getStatusLabel(status: Match['status']) {
  switch (status) {
    case 'LIVE':
      return 'AO VIVO';
    case 'FINISHED':
      return 'CONCLUÍDA';
    case 'CANCELED':
      return 'CANCELADA';
    default:
      return 'PENDENTE';
  }
}

function getStatusStyles(status: Match['status']) {
  switch (status) {
    case 'LIVE':
      return 'bg-emerald-500/10 text-emerald-200 border-emerald-500/20';
    case 'FINISHED':
      return 'bg-slate-700/60 text-slate-100 border-slate-600/60';
    case 'CANCELED':
      return 'bg-red-500/10 text-red-300 border-red-500/20';
    default:
      return 'bg-slate-800/70 text-slate-300 border-slate-700/50';
  }
}

function getStatusIcon(status: Match['status']) {
  switch (status) {
    case 'LIVE':
      return <Play className="h-3.5 w-3.5" />;
    case 'FINISHED':
      return <CheckCircle2 className="h-3.5 w-3.5" />;
    case 'CANCELED':
      return <AlertCircle className="h-3.5 w-3.5" />;
    default:
      return <Clock className="h-3.5 w-3.5" />;
  }
}

interface MatchCardProps {
  match: Match;
  compact?: boolean;
  onClick?: () => void;
  className?: string;
}

export function MatchCard({ match, compact = false, onClick, className = '' }: MatchCardProps) {
  const p1Winner = match.winnerId && match.player1Id && match.winnerId === match.player1Id;
  const p2Winner = match.winnerId && match.player2Id && match.winnerId === match.player2Id;
  const statusLabel = getStatusLabel(match.status);
  const statusStyles = getStatusStyles(match.status);
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={`relative overflow-hidden rounded-3xl border ${statusStyles} bg-slate-900/70 p-4 text-left transition-all ${isClickable ? 'cursor-pointer hover:-translate-y-0.5 hover:border-indigo-400/50' : ''} ${className}`}
    >
      <div className="flex items-center justify-between gap-3 pb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Round {match.roundNumber}</p>
          <p className="text-sm font-semibold text-slate-100">Partida {match.matchNumber}</p>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${statusStyles}`}>
          {getStatusIcon(match.status)}
          {statusLabel}
        </span>
      </div>

      <div className="space-y-2">
        <div className={`rounded-2xl border p-3 ${p1Winner ? 'border-emerald-400/20 bg-emerald-500/10' : 'border-slate-700/50 bg-slate-950/50'}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-semibold text-indigo-200">
              {match.player1?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-semibold ${p1Winner ? 'text-emerald-200' : 'text-slate-100'}`}>
                {match.player1?.username || 'TBD'}
              </p>
              <p className="text-[11px] text-zinc-500">Jogador 1</p>
            </div>
            <span className={`text-sm font-semibold ${p1Winner ? 'text-emerald-200' : 'text-slate-300'}`}>
              {match.winnerId ? (p1Winner ? 'V' : '-') : '-'}
            </span>
          </div>
        </div>

        <div className={`rounded-2xl border p-3 ${p2Winner ? 'border-emerald-400/20 bg-emerald-500/10' : 'border-slate-700/50 bg-slate-950/50'}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-semibold text-indigo-200">
              {match.player2?.username?.[0]?.toUpperCase() || 'B'}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-semibold ${p2Winner ? 'text-emerald-200' : 'text-slate-100'}`}>
                {match.player2?.username || 'TBD'}
              </p>
              <p className="text-[11px] text-zinc-500">Jogador 2</p>
            </div>
            <span className={`text-sm font-semibold ${p2Winner ? 'text-emerald-200' : 'text-slate-300'}`}>
              {match.winnerId ? (p2Winner ? 'V' : '-') : '-'}
            </span>
          </div>
        </div>
      </div>

      {!compact && (
        <div className="mt-4 flex items-center justify-between gap-2 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/80 px-2 py-1">
            <Trophy className="h-3 w-3 text-amber-400" />
            {match.winner?.username ? `Vencedor: ${match.winner.username}` : 'Sem vencedor ainda'}
          </span>
          <span className="text-zinc-400">{match.status === 'LIVE' ? 'Em progresso' : match.status === 'FINISHED' ? 'Finalizada' : match.status === 'PENDING' ? 'A aguardar' : 'Cancelada'}</span>
        </div>
      )}
    </div>
  );
}
