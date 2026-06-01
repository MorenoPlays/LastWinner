'use client';

import { useState } from 'react';
import type { Match } from '@/lib/types';
import { apiPost } from '@/lib/api';
import { MatchScoreModal } from './MatchScoreModal';
import { MatchCard } from './MatchCard';

interface BracketTreeProps {
  matches: Match[];
  wbRounds: number;
  tournamentId: string;
  canStart: boolean;
  refetch: () => Promise<void>;
}

export function BracketTree({
  matches,
  wbRounds,
  tournamentId = '',
  canStart = false,
  refetch = async () => {},
}: BracketTreeProps) {
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedMatch(null);
  };

  const handleModalSuccess = async () => {
    await refetch();
    handleModalClose();
  };

  const handleStartTournament = async () => {
    if (!tournamentId) return;
    setLoading(true);
    try {
      await apiPost(`/tournament/${tournamentId}/start`);
      await refetch();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erro ao iniciar o torneio');
    } finally {
      setLoading(false);
    }
  };

  if (matches.length === 0) return null;

  const wbMatches = matches.filter((m) => m.round >= 1 && m.round <= wbRounds);
  const gfMatch = matches.find((m) => m.round === 999);

  const wbByRound = wbMatches.reduce<Record<number, Match[]>>((acc, m) => {
    (acc[m.round] ||= []).push(m);
    return acc;
  }, {});

  const roundEntries = Object.entries(wbByRound).sort(([a], [b]) => Number(a) - Number(b));

  return (
    <div className="space-y-8">
      {selectedMatch && (
        <MatchScoreModal
          match={selectedMatch}
          isOpen={modalOpen}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}

      {canStart && tournamentId && (
        <div className="mb-4">
          <button
            disabled={loading}
            className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            onClick={handleStartTournament}
          >
            {loading ? 'Iniciando...' : 'Iniciar Torneio'}
          </button>
        </div>
      )}

      <div className="glass-card rounded-[2rem] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-sky-400 to-indigo-500" />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Bracket</p>
            <h2 className="text-2xl font-semibold text-slate-100">Winners Bracket</h2>
          </div>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="inline-flex items-start gap-8 min-w-[780px]">
            {roundEntries.map(([roundNumber, roundMatches], roundIndex) => (
              <div key={`round-${roundNumber}`} className="flex min-w-[18rem] flex-col gap-4">
                <div className="text-center">
                  <span className="inline-flex rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">
                    Round {roundNumber}
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  {roundMatches.map((match) => (
                    <div key={match.id} className="relative">
                      <MatchCard match={match} onClick={() => handleMatchClick(match)} />
                      {roundIndex < roundEntries.length - 1 && (
                        <div className="pointer-events-none absolute right-[-1.5rem] top-1/2 h-px w-10 -translate-y-1/2 rounded-full bg-gradient-to-r from-violet-500 to-sky-400 opacity-70" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {gfMatch && (
              <div className="flex min-w-[18rem] flex-col gap-4">
                <div className="text-center">
                  <span className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
                    🏆 Final
                  </span>
                </div>
                <MatchCard match={gfMatch} onClick={() => handleMatchClick(gfMatch)} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}