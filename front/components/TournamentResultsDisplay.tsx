"use client";

import { useState } from "react";
import { Trophy, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface TournamentResultsDisplayProps {
  tournament: any;
  isOrganizer: boolean;
  onFinish?: () => Promise<void>;
  onDeclareWinner?: (winnerId: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export function TournamentResultsDisplay({
  tournament,
  isOrganizer,
  onFinish,
  onDeclareWinner,
  loading = false,
  error = null,
}: TournamentResultsDisplayProps) {
  const [selectedWinnerId, setSelectedWinnerId] = useState<string>("");
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  const isFinished = tournament.status === "FINISHED";
  const participants = tournament.participants || [];
  const winner = participants[0];
  const rewards = tournament.rewards || [];

  const handleDeclareWinner = async () => {
    if (!selectedWinnerId || !onDeclareWinner) return;
    try {
      await onDeclareWinner(selectedWinnerId);
      setShowWinnerModal(false);
      setSelectedWinnerId("");
    } catch (error) {
      console.error("Error declaring winner:", error);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Status Banner */}
      <div
        className={`p-6 rounded-lg border-2 ${
          isFinished
            ? "bg-green-50 border-green-300"
            : "bg-blue-50 border-blue-300"
        }`}
      >
        {isFinished ? (
          <>
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold">
                Vencedor: <span className="text-green-600">{winner?.user?.username}</span>
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              Torneio finalizado em{" "}
              {tournament.endDate
                ? new Date(tournament.endDate).toLocaleDateString("pt-BR")
                : "N/A"}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-blue-800 mb-4">
              Status: {tournament.status} • {participants.length} jogadores
            </p>

            {isOrganizer && (
              <div className="space-y-3">
                <button
                  onClick={onFinish}
                  disabled={loading || !onFinish}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Finalizar Torneio Automaticamente
                </button>

                <button
                  onClick={() => setShowWinnerModal(true)}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Declarar Vencedor Manualmente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal para declarar vencedor manualmente */}
      {showWinnerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Declarar Vencedor</h3>

            <select
              value={selectedWinnerId}
              onChange={(e) => setSelectedWinnerId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione um vencedor...</option>
              {participants.map((p: any) => (
                <option key={p.userId} value={p.userId}>
                  {p.user?.username}
                </option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowWinnerModal(false);
                  setSelectedWinnerId("");
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeclareWinner}
                disabled={!selectedWinnerId || loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ranking Final */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h3 className="text-lg font-bold">Ranking Final</h3>
        </div>

        <div className="divide-y">
          {participants.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Nenhum participante
            </div>
          ) : (
            participants.map((p: any, index: number) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-4 md:p-6 ${
                  p.status === "WINNER" ? "bg-yellow-50" : ""
                }`}
              >
                <div className="flex items-center gap-3 md:gap-4 flex-1">
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-white ${
                      p.finalPosition === 1
                        ? "bg-yellow-500"
                        : p.finalPosition === 2
                          ? "bg-gray-400"
                          : p.finalPosition === 3
                            ? "bg-orange-600"
                            : "bg-blue-500"
                    }`}
                  >
                    {p.finalPosition || index + 1}
                  </div>

                  <div>
                    <p className="font-bold text-gray-900">{p.user?.username}</p>
                    <p className="text-xs md:text-sm text-gray-500">
                      {p.status === "WINNER" ? "🏆 Campeão" : "Eliminado"}
                    </p>
                  </div>
                </div>

                {p.status === "WINNER" && (
                  <Trophy className="w-5 h-5 text-yellow-500" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Prêmios */}
      {rewards.length > 0 && isFinished && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h3 className="text-lg font-bold">Prêmios Distribuídos</h3>
          </div>

          <div className="divide-y">
            {rewards.map((reward: any) => (
              <div key={reward.id} className="flex items-center justify-between p-4 md:p-6">
                <div>
                  <p className="font-medium text-gray-900">
                    {reward.rewardTitle || `${reward.position}º lugar`}
                  </p>
                  <p className="text-sm text-gray-500">Posição {reward.position}</p>
                </div>
                <p className="font-bold text-lg text-green-600">
                  ${reward.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estatísticas do Torneio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Data de Início</p>
          <p className="font-bold">
            {tournament.startDate
              ? new Date(tournament.startDate).toLocaleDateString("pt-BR")
              : "Não iniciado"}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Total de Participantes</p>
          <p className="font-bold">{participants.length}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Prêmio Total</p>
          <p className="font-bold text-green-600">${tournament.prizePool?.toFixed(2) || "0.00"}</p>
        </div>
      </div>
    </div>
  );
}
