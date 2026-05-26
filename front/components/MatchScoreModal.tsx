'use client';

import { useState } from 'react';
import type { Match } from '@/lib/types';
import { matchesApi } from '@/lib/api';

interface MatchScoreModalProps {
  match: Match;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MatchScoreModal({ match, isOpen, onClose, onSuccess }: MatchScoreModalProps) {
  const [selectedWinnerId, setSelectedWinnerId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSetWinner = async () => {
    if (!selectedWinnerId) {
      alert('Selecione um vencedor');
      return;
    }

    setLoading(true);
    try {
      await matchesApi.setWinner(match.id, selectedWinnerId);
      onSuccess();
      onClose();
      setSelectedWinnerId('');
    } catch (err: any) {
      alert(err.message || 'Erro ao definir vencedor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="glass-card max-w-md rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-semibold text-indigo-300">Definir Resultado</h2>

        <div className="mb-6 space-y-3">
          {/* Match Info */}
          <div className="rounded-lg bg-slate-800/50 p-3 text-center">
            <p className="text-sm font-semibold text-zinc-300">
              {match.player1?.username || 'TBD'} vs {match.player2?.username || 'TBD'}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Round {match.roundNumber} - Match {match.matchNumber}
            </p>
          </div>

          <div className="border-t border-violet-500/20"></div>

          {/* Winner Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400">Selecione o vencedor:</label>

            {/* Player 1 Button */}
            <button
              type="button"
              onClick={() => setSelectedWinnerId(match.player1Id || '')}
              disabled={!match.player1Id}
              className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                selectedWinnerId === match.player1Id
                  ? 'bg-green-600 text-white'
                  : 'border border-violet-500/30 text-zinc-300 hover:bg-violet-500/15'
              } disabled:opacity-50`}
            >
              🏆 {match.player1?.username || 'Jogador 1'} (Player 1)
            </button>

            {/* Player 2 Button */}
            <button
              type="button"
              onClick={() => setSelectedWinnerId(match.player2Id || '')}
              disabled={!match.player2Id}
              className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                selectedWinnerId === match.player2Id
                  ? 'bg-green-600 text-white'
                  : 'border border-violet-500/30 text-zinc-300 hover:bg-violet-500/15'
              } disabled:opacity-50`}
            >
              🏆 {match.player2?.username || 'Jogador 2'} (Player 2)
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSetWinner}
            disabled={loading || !selectedWinnerId}
            className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'A guardar...' : 'Confirmar'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-violet-500/30 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-violet-500/15 transition-colors"
          >
            Cancelar
          </button>
        </div>

        {/* Info */}
        <p className="mt-4 text-xs text-zinc-500">
          💡 Clique em um jogador para marcar como vencedor desta partida.
        </p>
      </div>
    </div>
  );
}
