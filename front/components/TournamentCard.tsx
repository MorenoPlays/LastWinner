"use client";

import Link from "next/link";
import { Trophy, Users, Calendar, Zap } from "lucide-react";

interface TournamentCardProps {
  tournament: any;
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const isFinished = tournament.status === "FINISHED";
  const isOngoing = tournament.status === "ONGOING";
  const isDraft = tournament.status === "DRAFT";
  const isOpen = tournament.status === "OPEN";

  const winner = tournament.participants?.[0];
  const participantCount = tournament.participants?.length || 0;

  const getStatusBadge = () => {
    switch (tournament.status) {
      case "FINISHED":
        return <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded-full">Finalizado</span>;
      case "ONGOING":
        return <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1"><Zap className="w-3 h-3" /> Ao vivo</span>;
      case "OPEN":
        return <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Inscrições</span>;
      case "DRAFT":
        return <span className="text-xs font-bold bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Rascunho</span>;
      default:
        return null;
    }
  };

  return (
    <Link href={`/tournaments/${tournament.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer overflow-hidden group">
        {/* Banner ou imagem */}
        {tournament.bannerUrl ? (
          <div className="relative h-40 overflow-hidden bg-gray-100">
            <img
              src={tournament.bannerUrl}
              alt={tournament.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        ) : (
          <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <Trophy className="w-12 h-12 text-white opacity-20" />
          </div>
        )}

        {/* Conteúdo */}
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                {tournament.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-1">
                {tournament.game?.name || "Jogo não especificado"}
              </p>
            </div>
            {getStatusBadge()}
          </div>

          {/* Descrição */}
          {tournament.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tournament.description}</p>
          )}

          {/* Vencedor (se finalizado) */}
          {isFinished && winner && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
              <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Vencedor
              </p>
              <p className="font-bold text-yellow-900">{winner.user?.username}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-gray-500" />
              <span>
                {participantCount}/{tournament.maxPlayers}
              </span>
            </div>

            {tournament.startDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{new Date(tournament.startDate).toLocaleDateString("pt-BR")}</span>
              </div>
            )}
          </div>

          {/* Prize Pool */}
          {tournament.prizePool > 0 && (
            <div className="text-sm font-medium text-green-600 mb-3">
              🏆 Prêmio: ${tournament.prizePool.toFixed(2)}
            </div>
          )}

          {/* CTA */}
          <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors">
            Ver Detalhes
          </button>
        </div>
      </div>
    </Link>
  );
}
