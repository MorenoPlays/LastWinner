'use client';

import { useState } from 'react';
import type { Tournament } from '@/lib/types';
import { useTournamentWinner } from '@/features/tournaments/useTournamentWinner';
import { Button } from '@/components/ui/Button';

interface TournamentWinnerActionsProps {
  tournament: Tournament;
  onSuccess: (result: any) => void;
}

export function TournamentWinnerActions({ tournament, onSuccess }: TournamentWinnerActionsProps) {
  const { finishTournamentAuto, declareWinnerManually, loading, error, clearError } = useTournamentWinner();
  const [showDeclareModal, setShowDeclareModal] = useState(false);
  const [selectedWinnerId, setSelectedWinnerId] = useState('');

  if (tournament.status !== 'ONGOING') {
    return null;
  }

  const handleFinish = async () => {
    if (!window.confirm('Tem certeza que deseja finalizar o torneio? Os resultados serão baseados nos matches concluídos.')) {
      return;
    }
    try {
      const result = await finishTournamentAuto(tournament.id);
      onSuccess(result);
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const handleDeclareWinner = async () => {
    if (!selectedWinnerId) {
      alert('Selecione um participante como vencedor');
      return;
    }
    if (!window.confirm('Tem certeza que deseja declarar este participante como vencedor?')) {
      return;
    }
    try {
      const result = await declareWinnerManually(tournament.id, selectedWinnerId);
      onSuccess(result);
      setShowDeclareModal(false);
      setSelectedWinnerId('');
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="glass-card rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={clearError}
            className="mt-2 text-xs text-red-400 hover:text-red-300"
          >
            Descartar
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={handleFinish}
          disabled={loading}
          variant="outline"
          className="flex-1"
        >
          🏁 {loading ? 'A processar...' : 'Finalizar Torneio (Auto)'}
        </Button>

        <button
          onClick={() => setShowDeclareModal(true)}
          disabled={loading}
          className="flex-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-400 hover:bg-amber-500/20 disabled:opacity-50 transition-colors"
        >
          👑 {loading ? 'A processar...' : 'Declarar Vencedor (Manual)'}
        </button>
      </div>

      {showDeclareModal && (
        <div className="glass-card rounded-xl border border-violet-500/30 p-4">
          <h3 className="mb-3 text-sm font-semibold text-indigo-300">Declarar Vencedor Manualmente</h3>
          <select
            value={selectedWinnerId}
            onChange={(e) => setSelectedWinnerId(e.target.value)}
            className="mb-3 w-full rounded-lg border border-violet-500/30 bg-slate-900/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-400"
          >
            <option value="">Seleciona um participante...</option>
            {tournament.participants?.map((p) => (
              <option key={p.userId} value={p.userId}>
                {p.user?.username || p.userId}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={handleDeclareWinner}
              disabled={loading || !selectedWinnerId}
              className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'A processar...' : 'Confirmar'}
            </button>
            <button
              onClick={() => {
                setShowDeclareModal(false);
                setSelectedWinnerId('');
              }}
              className="rounded-lg border border-violet-500/30 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-violet-500/15 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
