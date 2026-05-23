"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/useAuth";
import { useGames } from "@/features/games/useGames";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

export default function GamesPage() {
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN";
  const { games, loading, error, load } = useGames();

  useEffect(() => { load(); }, [load]);

  if (loading) return <p className="p-8 text-center text-zinc-400">A carregar…</p>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="mb-10 flex flex-col items-center text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-indigo-300 sm:text-5xl">Jogos</h1>
        <p className="mt-2 text-sm text-zinc-400 sm:text-base">Todos os jogos disponíveis. Escolhe o teu e entra na arena.</p>
        <span className="mt-5 block h-1.5 w-24 rounded-full bg-violet-500/80 shadow-lg shadow-violet-500/40" />
      </div>

      {error && <p className="mb-6 rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300 ring-1 ring-red-500/30">{error}</p>}

      {games.length === 0
        ? <div className="glass-card card-hover rounded-2xl p-10 text-center"><p className="text-lg font-semibold text-zinc-300 mb-1">Nenhum jogo registado ainda.</p><p className="text-sm text-zinc-400">Adicione um jogo para começar a criar torneios.</p></div>
        : <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {games.map((game) => (
              <Link key={game.id} href={`/games/${game.id}`} className="glass-card card-hover flex flex-col overflow-hidden rounded-2xl transition-transform hover:-translate-y-1">
                {game.coverUrl ?
                  <Image src={game.coverUrl} alt={game.name} width={400} height={200} className="h-44 w-full object-cover" unoptimized /> :
                  <div className="flex h-44 items-center justify-center bg-slate-800/80"><span className="text-4xl font-extrabold text-slate-700">L</span></div>
                }
                <div className="p-4">
                  <h2 className="text-base font-bold text-zinc-100">{game.name}</h2>
                  <p className="mt-0.5 text-xs font-mono text-zinc-500">{game.slug}</p>
                </div>
              </Link>
            ))}
          </div>
      }
    </div>
  );
}
