"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/useAuth";
import { useTournaments } from "@/features/tournaments/useTournaments";
import { useTournamentWinner } from "@/features/tournaments/useTournamentWinner";
import { TournamentResultsDisplay } from "@/components/TournamentResultsDisplay";
import { Loader2 } from "lucide-react";

export default function TournamentPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { currentTournament, loadOne, loading: tournamentLoading } = useTournaments();
  const { finishTournamentAuto, declareWinnerManually, loading: actionLoading, error } = useTournamentWinner();
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    if (id) {
      loadOne(id as string);
    }
  }, [id, loadOne]);

  useEffect(() => {
    if (currentTournament && user) {
      setIsOrganizer(currentTournament.organizerId === user.id || user.role === "ADMIN");
    }
  }, [currentTournament, user]);

  if (tournamentLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[100dvh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-gray-600">Carregando torneio...</p>
        </div>
      </div>
    );
  }

  if (!currentTournament) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-xl font-bold text-red-800">Torneio não encontrado</h1>
          <p className="text-red-700">Verifique o ID do torneio e tente novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 pb-12">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">{currentTournament.title}</h1>
        {currentTournament.description && (
          <p className="text-gray-600">{currentTournament.description}</p>
        )}
      </div>

      {currentTournament.bannerUrl && (
        <div className="relative w-full h-60 md:h-80 mb-6 rounded-lg overflow-hidden">
          <img
            src={currentTournament.bannerUrl}
            alt={currentTournament.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <TournamentResultsDisplay
        tournament={currentTournament}
        isOrganizer={isOrganizer}
        onFinish={
          isOrganizer
            ? async () => {
                try {
                  await finishTournamentAuto(id as string);
                } catch (error) {
                  console.error("Error finishing tournament:", error);
                }
              }
            : undefined
        }
        onDeclareWinner={
          isOrganizer
            ? async (winnerId: string) => {
                try {
                  await declareWinnerManually(id as string, winnerId);
                } catch (error) {
                  console.error("Error declaring winner:", error);
                }
              }
            : undefined
        }
        loading={actionLoading}
        error={error}
      />

      {/* Bracket */}
      {currentTournament.brackets && currentTournament.brackets.length > 0 && (
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold mb-6">Bracket</h2>
          
          {currentTournament.brackets.map((bracket: any) => (
            <div key={bracket.id} className="space-y-4">
              <h3 className="font-bold text-lg">Tipo: {bracket.type}</h3>

              {bracket.matches && bracket.matches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bracket.matches.map((match: any) => (
                    <div
                      key={match.id}
                      className={`border rounded-lg p-4 ${
                        match.status === "FINISHED"
                          ? "bg-green-50 border-green-300"
                          : match.status === "LIVE"
                            ? "bg-blue-50 border-blue-300"
                            : "bg-gray-50"
                      }`}
                    >
                      <p className="text-sm text-gray-600 mb-2">
                        Rodada {match.roundNumber} • Match {match.matchNumber}
                      </p>

                      <div className="space-y-2 mb-3">
                        <div className={`p-2 rounded ${match.winnerId === match.player1Id ? "bg-yellow-100 font-bold" : ""}`}>
                          {match.player1?.username || "TBD"}
                        </div>
                        <div className="text-center text-xs text-gray-500">vs</div>
                        <div className={`p-2 rounded ${match.winnerId === match.player2Id ? "bg-yellow-100 font-bold" : ""}`}>
                          {match.player2?.username || "TBD"}
                        </div>
                      </div>

                      <p className="text-xs text-gray-600">
                        Status:{" "}
                        <span className="font-medium">
                          {match.status === "FINISHED"
                            ? "✓ Finalizado"
                            : match.status === "LIVE"
                              ? "● Ao vivo"
                              : "○ Pendente"}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhum match no bracket</p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
