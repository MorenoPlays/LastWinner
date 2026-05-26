// Exemplos de uso dos novos endpoints para definir vencedor do torneio

import { tournamentsApi } from '@/lib/api';

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 1: Finalizar torneio automaticamente (baseado em matches)
// ═══════════════════════════════════════════════════════════════════════════

async function handleFinishTournament(tournamentId: string) {
  try {
    const result = await tournamentsApi.finishTournament(tournamentId);
    
    console.log('Torneio finalizado:', result);
    console.log('Vencedor:', result.participants[0].user.username);
    console.log('Status:', result.status); // 'FINISHED'
    
    // Atualizar UI para mostrar resultado
    return result;
  } catch (error) {
    console.error('Erro ao finalizar torneio:', error);
    // Mostrar toast/modal com o erro
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 2: Declarar vencedor manualmente
// ═══════════════════════════════════════════════════════════════════════════

async function handleDeclareWinner(tournamentId: string, winnerId: string) {
  try {
    const result = await tournamentsApi.declareWinner(tournamentId, winnerId);
    
    console.log('Vencedor declarado:', result.participants[0].user.username);
    console.log('Posição final:', result.participants[0].finalPosition); // 1
    console.log('Status do participante:', result.participants[0].status); // 'WINNER'
    
    return result;
  } catch (error) {
    console.error('Erro ao declarar vencedor:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 3: Hook customizado para gerenciar torneio
// ═══════════════════════════════════════════════════════════════════════════

'use client';

import { useState } from 'react';
import { tournamentsApi } from '@/lib/api';

export function useTournamentWinner() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finishTournament = async (tournamentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await tournamentsApi.finishTournament(tournamentId);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const declareWinner = async (tournamentId: string, winnerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await tournamentsApi.declareWinner(tournamentId, winnerId);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { finishTournament, declareWinner, loading, error };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 4: Componente para exibir resultado do torneio
// ═══════════════════════════════════════════════════════════════════════════

'use client';

import { useState, useEffect } from 'react';
import { tournamentsApi } from '@/lib/api';

interface TournamentResultsProps {
  tournamentId: string;
}

export function TournamentResults({ tournamentId }: TournamentResultsProps) {
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { finishTournament, declareWinner, loading: actionLoading } = useTournamentWinner();

  useEffect(() => {
    loadTournament();
  }, [tournamentId]);

  const loadTournament = async () => {
    try {
      const data = await tournamentsApi.getOne(tournamentId);
      setTournament(data);
    } catch (error) {
      console.error('Erro ao carregar torneio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    try {
      const result = await finishTournament(tournamentId);
      setTournament(result);
      // Mostrar toast de sucesso
    } catch (error) {
      // Mostrar toast de erro
    }
  };

  // Mostrar select para escolher vencedor manualmente
  const handleSelectWinner = async (winnerId: string) => {
    try {
      const result = await declareWinner(tournamentId, winnerId);
      setTournament(result);
    } catch (error) {
      // Mostrar toast de erro
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (!tournament) return <div>Torneio não encontrado</div>;

  const isFinished = tournament.status === 'FINISHED';
  const winner = tournament.participants?.[0];

  return (
    <div className="space-y-6">
      {isFinished ? (
        <div className="bg-green-100 border border-green-300 rounded p-4">
          <h2 className="font-bold text-lg">🏆 Vencedor: {winner?.user?.username}</h2>
          <p className="text-sm text-gray-600">
            Torneio finalizado em {new Date(tournament.endDate).toLocaleDateString('pt-BR')}
          </p>
        </div>
      ) : (
        <div className="bg-yellow-100 border border-yellow-300 rounded p-4">
          <p className="text-sm text-gray-600">Torneio em andamento - {tournament.status}</p>
          
          <div className="mt-4 space-y-2">
            <button
              onClick={handleFinish}
              disabled={actionLoading}
              className="block w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {actionLoading ? 'Processando...' : 'Finalizar Torneio Automaticamente'}
            </button>

            <select
              onChange={(e) => handleSelectWinner(e.target.value)}
              disabled={actionLoading}
              className="block w-full px-4 py-2 border rounded"
            >
              <option value="">Declarar Vencedor Manualmente...</option>
              {tournament.participants?.map((p: any) => (
                <option key={p.userId} value={p.userId}>
                  {p.user?.username}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Ranking Final */}
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-3">Ranking Final</h3>
        <div className="space-y-2">
          {tournament.participants?.map((p: any, index: number) => (
            <div
              key={p.id}
              className={`flex items-center justify-between p-3 rounded border ${
                p.status === 'WINNER' ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg w-8">#{p.finalPosition || index + 1}</span>
                <span className="font-medium">{p.user?.username}</span>
                {p.status === 'WINNER' && <span className="text-xl">🏆</span>}
              </div>
              <span className="text-sm text-gray-600">
                {p.status === 'WINNER' ? 'Vencedor' : 'Eliminado'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 5: Uso em uma página
// ═══════════════════════════════════════════════════════════════════════════

/*
'use client';

import { useParams } from 'next/navigation';
import { TournamentResults } from '@/components/TournamentResults';

export default function TournamentPage() {
  const { id } = useParams();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Resultados do Torneio</h1>
      <TournamentResults tournamentId={id as string} />
    </div>
  );
}
*/
