"use client";

import { useState } from "react";
import { useTournaments } from "./useTournaments";

export interface UseTournamentWinnerReturn {
  finishTournamentAuto: (id: string) => Promise<void>;
  declareWinnerManually: (id: string, winnerId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useTournamentWinner(): UseTournamentWinnerReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { finishTournament, declareWinner } = useTournaments();

  const finishTournamentAuto = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await finishTournament(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao finalizar torneio";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const declareWinnerManually = async (id: string, winnerId: string) => {
    setLoading(true);
    setError(null);
    try {
      await declareWinner(id, winnerId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao declarar vencedor";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    finishTournamentAuto,
    declareWinnerManually,
    loading,
    error,
    clearError,
  };
}
