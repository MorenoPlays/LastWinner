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
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-indigo-300">Jogos</h1>
        {canManage && <Link href="/games/new"><Button>Novo Jogo</Button></Link>}
      </div>
      {error && <p className="mb-4 rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300 ring-1 ring-red-500/30">{error}</p>}
      {games.length === 0 ? <p className="text-sky-400/60">Nenhum jogo encontrado.</p> :
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <div key={game.id} className="glass-card card-hover flex flex-col gap-3 rounded-xl p-5">
              {game.coverUrl ?
                <Image src={game.coverUrl} alt={game.name} width={400} height={200} className="h-36 w-full rounded-lg object-cover" unoptimized /> :
                <div className="flex h-36 items-center justify-center rounded-lg bg-slate-800/80">
                  <span className="text-2xl font-bold text-slate-600">L</span>
                </div>
              }
              <h2 className="text-lg font-semibold text-sky-300">{game.name}</h2>
              <p className="text-xs text-zinc-400">slug: {game.slug}</p>
              <div className="mt-auto flex items-center gap-2">
                <Link href={`/games/${game.id}`} className="flex-1 rounded-lg px-3 py-1.5 text-center text-sm font-semibold text-indigo-400 hover:bg-indigo-500/20 transition-colors">Ver</Link>
                {canManage && (
                  <>
                    <Link href={`/games/${game.id}/edit`} className="flex-1 rounded-lg px-3 py-1.5 text-center text-sm font-semibold text-zinc-400 hover:bg-zinc-500/20 transition-colors">Editar</Link>
                    <Button variant="danger" onClick={() => { if (confirm("Eliminar este jogo?")) { const token = localStorage.getItem("accessToken"); fetch(`${process.env.NEXT_PUBLIC_API || "http://localhost:3001"}/game/${game.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? window.location.reload() : alert("Erro.")); } }} className="rounded-lg">Eliminar</Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
}
