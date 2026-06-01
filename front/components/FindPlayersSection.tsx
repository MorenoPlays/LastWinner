/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminUsersApi } from "@/lib/api";
import type { User } from "@/lib/types";

export function FindPlayersSection() {
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [minElo, setMinElo] = useState(0);
  const [maxElo, setMaxElo] = useState(5000);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await adminUsersApi.getAll();
        setPlayers(data);
      } catch (error) {
        console.error("Failed to load players:", error);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const filteredPlayers = players.filter((p) => {
    const matchesSearch =
      p.username.toLowerCase().includes(search.toLowerCase()) ||
      (p.bio && p.bio.toLowerCase().includes(search.toLowerCase()));
    const matchesElo = p.elo >= minElo && p.elo <= maxElo;
    return matchesSearch && matchesElo;
  });

  return (
    <section className="mb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold tracking-tight text-indigo-300 mb-4">
          🎮 Encontra Outros Jogadores
        </h2>

        {/* Filtros */}
        <div className="glass-card rounded-xl p-4 border border-violet-500/20 space-y-3 sm:space-y-0 sm:flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-sky-300 mb-1">Procurar</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Procura por username…"
              className="w-full rounded-lg border border-violet-500/30 bg-slate-900/60 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40"
            />
          </div>
          <div className="flex gap-2">
            <div>
              <label className="block text-xs font-semibold text-sky-300 mb-1">Min ELO</label>
              <input
                type="number"
                value={minElo}
                onChange={(e) => setMinElo(parseInt(e.target.value) || 0)}
                min={0}
                max={5000}
                className="w-20 rounded-lg border border-violet-500/30 bg-slate-900/60 px-2 py-2 text-sm text-zinc-100 outline-none focus:border-violet-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-sky-300 mb-1">Max ELO</label>
              <input
                type="number"
                value={maxElo}
                onChange={(e) => setMaxElo(parseInt(e.target.value) || 5000)}
                min={0}
                max={5000}
                className="w-20 rounded-lg border border-violet-500/30 bg-slate-900/60 px-2 py-2 text-sm text-zinc-100 outline-none focus:border-violet-400"
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="glass-card card-hover rounded-2xl p-10 text-center">
          <p className="text-sm text-zinc-400">A carregar jogadores…</p>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="glass-card card-hover rounded-2xl p-10 text-center">
          <p className="text-lg font-semibold text-zinc-300 mb-1">Nenhum jogador encontrado.</p>
          <p className="text-sm text-zinc-400">Tente ajustar os filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredPlayers.map((player) => (
            <Link
              key={player.id}
              href={`/profile/${player.id}`}
              className="glass-card card-hover flex flex-col rounded-xl border border-violet-500/30 p-4 transition-all hover:border-indigo-400/50"
            >
              {/* Avatar */}
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={player.avatarUrl || `https://ui-avatars.com/api/?name=${player.username}`}
                  alt={player.username}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-indigo-500/30"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-100 truncate">{player.username}</p>
                  {player.country && (
                    <p className="text-xs text-zinc-400">{player.country}</p>
                  )}
                </div>
              </div>

              {/* Bio */}
              {player.bio && (
                <p className="text-xs text-zinc-400 mb-3 line-clamp-2">{player.bio}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-amber-500/10 p-2">
                  <p className="text-xl font-bold text-amber-300">{player.elo}</p>
                  <p className="text-xs text-amber-400">ELO</p>
                </div>
                <div className="rounded-lg bg-green-500/10 p-2">
                  <p className="text-xl font-bold text-green-300">{player.wins}</p>
                  <p className="text-xs text-green-400">Vitórias</p>
                </div>
                <div className="rounded-lg bg-red-500/10 p-2">
                  <p className="text-xl font-bold text-red-300">{player.losses}</p>
                  <p className="text-xs text-red-400">Derrotas</p>
                </div>
              </div>

              {/* Win Rate */}
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-zinc-400">
                  Win Rate:{" "}
                  <span className="font-semibold text-zinc-200">
                    {(
                      (player.wins / (player.wins + player.losses)) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </span>
              </div>

              {/* Ver Perfil Button */}
              <button className="mt-3 w-full rounded-lg border border-violet-500/30 py-2 text-sm font-semibold text-violet-300 transition-colors hover:bg-violet-500/15">
                Ver Perfil →
              </button>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
