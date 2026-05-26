'use client';

import type { Tournament } from '@/lib/types';

interface TournamentResultsProps {
  tournament: Tournament;
}

export function TournamentResults({ tournament }: TournamentResultsProps) {
  if (tournament.status !== 'FINISHED') {
    return null;
  }

  const winner = tournament.participants?.[0];
  const sortedParticipants = [...(tournament.participants || [])].sort(
    (a, b) => (a.finalPosition || 999) - (b.finalPosition || 999)
  );

  return (
    <div className="space-y-4">
      {/* Winner Banner */}
      {winner && winner.status === 'WINNER' && (
        <div className="glass-card rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 p-6">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🏆</span>
            <div>
              <h2 className="text-lg font-bold text-yellow-300">Vencedor</h2>
              <p className="text-2xl font-extrabold text-white">{winner.user?.username || winner.userId}</p>
              {tournament.endDate && (
                <p className="text-xs text-zinc-400">
                  Finalizado em {new Date(tournament.endDate).toLocaleDateString('pt-PT')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rankings */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-indigo-300">Ranking Final</h3>
        <div className="space-y-2">
          {sortedParticipants.map((participant, index) => {
            const position = participant.finalPosition || index + 1;
            const isWinner = participant.status === 'WINNER';
            const medals = ['🥇', '🥈', '🥉'];
            const medal = medals[position - 1] || '•';

            return (
              <div
                key={participant.id}
                className={`glass-card card-hover flex items-center justify-between rounded-xl px-4 py-3 transition-all ${
                  isWinner
                    ? 'border border-yellow-500/30 bg-yellow-500/10'
                    : index < 3
                      ? 'border border-violet-500/20'
                      : 'border border-violet-500/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{medal}</span>
                  <div>
                    <p className={`font-bold ${isWinner ? 'text-yellow-300' : 'text-zinc-200'}`}>
                      #{position} - {participant.user?.username || participant.userId}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Status: {participant.status === 'WINNER' ? 'Vencedor' : 'Eliminado'}
                    </p>
                  </div>
                </div>
                {isWinner && (
                  <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-300">
                    Campeão
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* End Date */}
      {tournament.endDate && (
        <div className="glass-card rounded-xl border border-violet-500/20 p-4 text-center">
          <p className="text-xs text-zinc-500">
            Este torneio foi finalizado em{' '}
            <strong className="text-zinc-300">
              {new Date(tournament.endDate).toLocaleDateString('pt-PT', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </strong>
          </p>
        </div>
      )}
    </div>
  );
}
