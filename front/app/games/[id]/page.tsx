"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { gamesApi, tournamentsApi } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";
import type { Game, Tournament } from "@/lib/types";
import { CURRENCY_MAP, formatCurrency } from "@/lib/types";

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
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="mb-10 flex flex-col items-center text-center">
        {game.coverUrl ? <Image src={game.coverUrl} alt={game.name} width={800} height={400} className="mb-5 h-56 w-full rounded-2xl object-cover sm:h-64" unoptimized /> : null}
        <h1 className="text-3xl font-extrabold tracking-tight text-sky-300 sm:text-5xl">{game.name}</h1>
        <p className="mt-2 text-sm font-mono text-zinc-500 sm:text-base">{game.slug}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-300">{tournaments.length} torneio{tournaments.length !== 1 ? 's' : ''}</span>
          {game.coverUrl && <a href={game.coverUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-300 hover:bg-violet-500/20 transition-colors">Ver imagem original</a>}
        </div>
        <span className="mt-5 block h-1.5 w-24 rounded-full bg-violet-500/80 shadow-lg shadow-violet-500/40" />
      </div>

      {/* Back / Edit */}
      <div className="mb-8 flex items-center gap-3">
        <Link href="/games" className="rounded-lg border border-violet-500/30 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-violet-500/15 transition-colors">← Voltar aos jogos</Link>
        {canManage && <Link href={`/games/${game.id}/edit`} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30">Editar jogo</Link>}
      </div>

      {/* Tournaments for this game */}
      <div className="mt-2">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight text-indigo-300">Torneios deste jogo</h2>
          {canManage && <Link href="/tournaments/new" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-shadow">Novo Torneio</Link>}
        </div>

        {loadingT ? (
          <p className="text-sm text-zinc-400">A carregar torneios…</p>
        ) : tournaments.length === 0 ? (
          <div className="glass-card card-hover rounded-2xl p-10 text-center">
            <p className="text-sm text-zinc-400">Ainda não há torneios registados para este jogo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {tournaments.map((t) => {
              const inscritosCount = (t as any).participants?.filter((p: any) => p.status !== 'PENDING' && p.status !== 'ELIMINATED').length || 0;
              const progress = t.maxPlayers > 0 ? (inscritosCount / t.maxPlayers) * 100 : 0;
              const progressColor = progress >= 100 ? 'bg-red-500' : progress >= 75 ? 'bg-amber-500' : 'bg-green-500';
              return (
              <Link key={t.id} href={`/tournaments/${t.id}`} className="glass-card card-hover flex flex-col overflow-hidden rounded-2xl transition-transform hover:-translate-y-1">
                {t.bannerUrl && <img src={t.bannerUrl} alt={t.title} className="h-40 w-full object-cover" />}
                <div className="flex flex-col gap-2.5 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-sky-300">{t.title}</h3>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${STATUS_COLOR[t.status] || STATUS_COLOR.DRAFT}`}>{STATUS_MAP[t.status] || t.status}</span>
                  </div>
                  {t.description && <p className="line-clamp-2 text-xs text-zinc-400">{t.description}</p>}
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-zinc-400">
                    <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-indigo-300">{FORMAT_MAP[t.format] || t.format}</span>
                    <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-sky-300">{MODE_MAP[t.mode] || t.mode}</span>
                    <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-amber-300">{t.entryFee > 0 ? formatCurrency(t.entryFee, (t as any).currency || 'USD') : 'Grátis'}</span>
                  </div>
                  {/* Players bar */}
                  <div className="mt-0.5">
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Jogadores</span>
                      <span className={"font-semibold " + (progress >= 100 ? "text-red-400" : "text-green-400")}>{inscritosCount}/{t.maxPlayers}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-700/60">
                      <div className={`h-full ${progressColor} transition-all`} style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-between border-t border-violet-500/15 pt-2.5">
                    {(t as any).organizer?.username && <span className="text-[11px] text-zinc-500">Por <span className="text-indigo-400 font-medium">{(t as any).organizer.username}</span></span>}
                    <span className="ml-auto inline-block rounded-lg px-4 py-1.5 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/20 transition-colors">Ver Detalhes →</span>
                  </div>
                </div>
              </Link>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
