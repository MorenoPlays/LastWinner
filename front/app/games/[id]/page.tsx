"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { gamesApi, tournamentsApi } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";
import type { Game, Tournament } from "@/lib/types";

const FORMAT_MAP: Record<string, string> = { SINGLE_ELIMINATION: "Eliminatória simples", DOUBLE_ELIMINATION: "Eliminatória dupla", ROUND_ROBIN: "Todos contra todos", SWISS: "Sistema suíço" };
const MODE_MAP: Record<string, string> = { ONLINE: "Online", PRESENTIAL: "Presencial" };
const STATUS_MAP: Record<string, string> = { DRAFT: "Rascunho", OPEN: "Aberto", ONGOING: "Em curso", FINISHED: "Terminado", CANCELED: "Cancelado" };
const STATUS_COLOR: Record<string, string> = { DRAFT: "bg-slate-700/60 text-zinc-300", OPEN: "bg-green-500/30 text-green-300", ONGOING: "bg-sky-500/30 text-sky-300", FINISHED: "bg-amber-500/30 text-amber-300", CANCELED: "bg-red-500/30 text-red-300" };

export default function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN" || user?.role === "ORGANIZER";
  const { id } = use(params);
  const [game, setGame] = useState<Game | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loadingGame, setLoadingGame] = useState(true);
  const [loadingT, setLoadingT] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoadingGame(true);
    setError("");
    gamesApi.getOne(id)
      .then((data: Game) => { setGame(data); })
      .catch((_err: unknown) => {
        const msg = _err instanceof Error ? _err.message : String(_err);
        if (msg.includes('Unexpected end') || msg.includes('Unexpected token')) {
          setError("Não foi possível carregar os dados do jogo. Tente novamente mais tarde.");
        } else {
          setError(msg);
        }
      })
      .finally(() => setLoadingGame(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoadingT(true);
    tournamentsApi.getByGame(id)
      .then(setTournaments)
      .catch(() => setTournaments([]))
      .finally(() => setLoadingT(false));
  }, [id]);

  if (loadingGame) return <p className="p-8 text-center">A carregar…</p>;
  if (error) return <p className="p-8 text-center text-red-400">{error}</p>;
  if (!game) return notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/games" className="mb-4 inline-block text-sm font-semibold text-violet-400 hover:text-violet-300 hover:underline">← Voltar aos jogos</Link>

      <div className="glass-card card-hover overflow-hidden rounded-2xl">
        {game.coverUrl ? <Image src={game.coverUrl} alt={game.name} width={800} height={400} className="h-56 w-full rounded-t-xl object-cover" unoptimized /> : <div className="flex h-56 items-center justify-center rounded-t-xl bg-slate-800"><span className="text-4xl font-extrabold text-slate-700">L</span></div>}
        <div className="space-y-4 p-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-sky-300">{game.name}</h1>
          <p className="text-sm text-zinc-400">Slug: <span className="font-mono text-zinc-300">{game.slug}</span></p>
          {game.coverUrl && <p className="text-sm text-zinc-400"><a href={game.coverUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Ver imagem</a></p>}
          <div className="flex gap-3 pt-2">
            <Link href="/games" className="rounded-lg border border-violet-500/30 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-violet-500/15 transition-colors">← Voltar</Link>
            {canManage && <Link href={`/games/${game.id}/edit`} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30">Editar</Link>}
          </div>
        </div>
      </div>

      {/* Tournaments for this game */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-extrabold tracking-tight text-indigo-300">Torneios deste jogo</h2>

        {loadingT ? (
          <p className="text-sm text-zinc-400">A carregar torneios…</p>
        ) : tournaments.length === 0 ? (
          <div className="glass-card card-hover rounded-xl p-6 text-center">
            <p className="text-sm text-zinc-400">Ainda não há torneios registados para este jogo.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tournaments.map((t) => (
              <div key={t.id} className="glass-card card-hover flex flex-col gap-3 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-sky-300">{t.title}</h3>
                    <p className="text-xs text-zinc-400">
                      Formato: {FORMAT_MAP[t.format] || t.format} · Modo: {MODE_MAP[t.mode] || t.mode}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[t.status] || STATUS_COLOR.DRAFT}`}>{STATUS_MAP[t.status] || t.status}</span>
                </div>
                {t.description && <p className="text-sm text-zinc-400 line-clamp-2">{t.description}</p>}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
                  <span>Jogadores: {t.maxPlayers}</span>
                  <span>Inscrição: {t.entryFee > 0 ? `$${t.entryFee}` : "Grátis"}</span>
                  <span>Prémio: {t.prizePool > 0 ? `$${t.prizePool}` : "—"}</span>
                </div>
                {t.bannerUrl && <img src={t.bannerUrl} alt={t.title} className="h-36 w-full rounded-lg object-cover" />}
                <div className="mt-auto pt-2">
                  <Link href={`/tournaments/${t.id}`} className="inline-block rounded-lg px-4 py-2 text-sm font-semibold text-indigo-400 hover:bg-indigo-500/20 transition-colors">Ver Detalhes</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
