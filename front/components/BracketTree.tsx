"use client";

import type { Match } from "@/lib/types";
import { useState } from "react";
import { tournamentsApi } from "@/lib/api";
import { MatchScoreModal } from "./MatchScoreModal";

interface BracketTreeProps {
  matches: Match[];
  wbRounds: number;
  tournamentId: string;
  canStart: boolean;
  refetch: () => Promise<void>;
}

function getPlayerName(p: { id: string; username: string } | null | undefined, fallback: string) {
  return p?.username || fallback;
}

function PlayerDisplay({ p, isWinner }: { p: { id: string; username: string; avatarUrl?: string } | null | undefined; isWinner: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-sm ${isWinner ? "text-green-400 font-semibold" : "text-zinc-300"}`}>
      {p?.avatarUrl ? (
        <img src={p.avatarUrl} alt={p.username || "Player"} className="w-6 h-6 rounded-full object-cover border border-violet-500/30" />
      ) : (
        <div className="w-6 h-6 rounded-full bg-indigo-500/30 flex items-center justify-center text-xs font-bold">
          {(p?.username || "T")[0]?.toUpperCase()}
        </div>
      )}
      <span className="truncate">{getPlayerName(p, "TBD")}</span>
    </div>
  );
}

const MatchNode = ({ 
  match, 
  isWinner = false,
  showConnector = false,
  isFinal = false,
  onClick
}: { 
  match: Match; 
  isWinner?: boolean;
  showConnector?: boolean; 
  isFinal?: boolean;
  onClick?: () => void;
}) => {
  const p1Win = match.winnerId === match.player1Id;
  const p2Win = match.winnerId === match.player2Id;

  return (
    <div 
      onClick={onClick}
      className={`relative ${isFinal ? "bg-gradient-to-r from-amber-500/20 to-amber-600/20" : "bg-slate-800/50"} rounded-xl p-3 border ${isFinal ? "border-amber-500/50" : isWinner ? "border-green-500/50" : "border-violet-500/30"} shadow-lg ${onClick ? 'cursor-pointer hover:shadow-xl hover:border-indigo-400 transition-all' : ''}`}
    >
      <div className="space-y-2">
        <PlayerDisplay p={match.player1} isWinner={p1Win} />
        <div className="h-px bg-zinc-600/50 my-1.5"></div>
        <PlayerDisplay p={match.player2} isWinner={p2Win} />
      </div>
      {showConnector && (
        <div className="absolute top-1/2 -right-4 w-4 h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" />
      )}
      {onClick && match.status !== 'FINISHED' && (
        <div className="mt-2 text-center">
          <span className="text-xs text-indigo-400 font-semibold">Clique para definir</span>
        </div>
      )}
      {match.status === 'FINISHED' && (
        <div className="mt-2 text-center">
          <span className="text-xs text-green-400 font-semibold">✓ Resultado</span>
        </div>
      )}
    </div>
  );
};

export function BracketTree({ 
  matches, 
  wbRounds,
  tournamentId = '',
  canStart = false,
  refetch = async () => {}
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
      await tournamentsApi.startTournament(tournamentId);
      await refetch();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erro ao iniciar o torneio');
    } finally {
      setLoading(false);
    }
  };

  if (matches.length === 0) return null;

  const wbMatches = matches.filter(m => m.roundNumber >= 1 && m.roundNumber <= wbRounds);
  const lbMatches = matches.filter(m => m.roundNumber > wbRounds && m.roundNumber < 999);
  const gfMatch = matches.find(m => m.roundNumber === 999);

  const wbByRound = wbMatches.reduce<Record<number, Match[]>>((acc, m) => {
    (acc[m.roundNumber] ||= []).push(m);
    return acc;
  }, {});

  const rounds = Object.keys(wbByRound).length || wbRounds;

  return (
    <div className="space-y-10">
      {/* Modal */}
      {selectedMatch && (
        <MatchScoreModal
          match={selectedMatch}
          isOpen={modalOpen}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Start Tournament Button */}
      {canStart && tournamentId && (
        <div className="mb-4">
          <button
            disabled={loading}
            className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50`}
            onClick={handleStartTournament}
          >
            {loading ? 'Iniciando...' : 'Iniciar Torneio'}
          </button>
        </div>
      )}
      
      {/* Winners Bracket */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-6 bg-gradient-to-b from-sky-400 to-indigo-500 rounded-full"></div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-sky-300 to-indigo-300 bg-clip-text text-transparent">
            Winners Bracket
          </h2>
        </div>
        
        <div className="flex items-start justify-center gap-8 overflow-x-auto pb-4">
          {Object.entries(wbByRound)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([roundNum, roundMatches], roundIndex) => (
              <div key={`wb-${roundNum}`} className="flex flex-col gap-4">
                <div className="text-center">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-3 py-1 rounded-full">
                    Round {roundNum}
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  {roundMatches.map((m, idx) => (
                    <div key={m.id} className="relative">
                      <MatchNode 
                        match={m} 
                        showConnector={roundIndex < (Object.keys(wbByRound).length - 1)}
                        onClick={() => handleMatchClick(m)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          
          {/* Grand Final */}
          {gfMatch && (
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-flex items-center gap-1">
                  🏆
                  Final
                </span>
              </div>
              <div onClick={() => handleMatchClick(gfMatch)}>
                <MatchNode match={gfMatch} isFinal={true} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

