"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { tournamentsApi, participantsApi, messagesApi } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";
import { useTournaments } from "@/features/tournaments/useTournaments";
import { useParticipants } from "@/features/tournaments/participants/useParticipants";
import { useMessages } from "@/features/tournaments/messages/useMessages";
import type { Tournament, User } from "@/lib/types";
import { CURRENCY_MAP, formatCurrency } from "@/lib/types";
import { Button } from "@/components/ui/Button";

const FORMAT_MAP: Record<string, string> = { SINGLE_ELIMINATION: "Eliminatória simples", DOUBLE_ELIMINATION: "Eliminatória dupla", ROUND_ROBIN: "Todos contra todos", SWISS: "Sistema suíço" };
const MODE_MAP: Record<string, string> = { ONLINE: "Online", PRESENTIAL: "Presencial" };
const STATUS_MAP: Record<string, string> = { DRAFT: "Rascunho", OPEN: "Aberto", ONGOING: "Em curso", FINISHED: "Terminado", CANCELED: "Cancelado" };
const STATUS_COLOR: Record<string, string> = { DRAFT: "bg-slate-700/60 text-zinc-300", OPEN: "bg-green-500/30 text-green-300", ONGOING: "bg-sky-500/30 text-sky-300", FINISHED: "bg-amber-500/30 text-amber-300", CANCELED: "bg-red-500/30 text-red-300" };
type Tab = "overview" | "participants" | "messages";

export default function TournamentsPage() {
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN" || user?.role === "ORGANIZER";
  const isOwnerOrAdmin = (t: Tournament) =>
    user?.role === "ADMIN" || user?.id === t.organizerId;
  const { tournaments, loading, error, loadAll } = useTournaments();

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar este torneio?")) return;
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API || "http://localhost:3001"}/tournament/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) window.location.reload(); else alert("Erro ao eliminar.");
  };

  if (loading) return <p className="p-8 text-center text-zinc-400">A carregar…</p>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="mb-10 flex flex-col items-center text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-indigo-300 sm:text-5xl">Torneios</h1>
        <p className="mt-2 text-sm text-zinc-400 sm:text-base">Todos os torneios disponíveis. Escolhe o teu e entra na competição.</p>
        <span className="mt-5 block h-1.5 w-24 rounded-full bg-violet-500/80 shadow-lg shadow-violet-500/40" />
      </div>

      {error && <p className="mb-6 rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300 ring-1 ring-red-500/30">{error}</p>}

      {tournaments.length === 0
        ? <div className="glass-card card-hover rounded-2xl p-10 text-center"><p className="text-lg font-semibold text-zinc-300 mb-1">Nenhum torneio criado ainda.</p><p className="text-sm text-zinc-400">Crie um torneio para começar a competir.</p></div>
        : <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((t) => {
              const inscritosCount = (t as any).participants?.filter((p: any) => p.status !== 'PENDING' && p.status !== 'ELIMINATED').length || 0;
              const progress = t.maxPlayers > 0 ? (inscritosCount / t.maxPlayers) * 100 : 0;
              const progressColor = progress >= 100 ? 'bg-red-500' : progress >= 75 ? 'bg-amber-500' : 'bg-green-500';
              return (
              <div key={t.id} className="glass-card card-hover flex flex-col overflow-hidden rounded-2xl transition-transform hover:-translate-y-1">
                <Link href={`/tournaments/${t.id}`} className="block">
                  {t.bannerUrl && <img src={t.bannerUrl} alt={t.title} className="h-44 w-full object-cover" />}
                  <div className="flex flex-col gap-2.5 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-lg font-bold text-sky-300">{t.title}</h2>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${STATUS_COLOR[t.status] || STATUS_COLOR.DRAFT}`}>{STATUS_MAP[t.status] || t.status}</span>
                    </div>
                    {t.description && <p className="line-clamp-2 text-sm text-zinc-400">{t.description}</p>}
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                      <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-indigo-300">{FORMAT_MAP[t.format] || t.format}</span>
                      <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-sky-300">{t.prizePool > 0 ? formatCurrency(t.prizePool, (t as any).currency || 'USD') : 'Sem prémio'}</span>
                      <span className={`rounded-full px-2.5 py-1 font-bold ${t.entryFee > 0 ? 'bg-amber-500/10 text-amber-300' : 'bg-green-500/10 text-green-300'}`}>{t.entryFee > 0 ? formatCurrency(t.entryFee, (t as any).currency || 'USD') : 'Grátis'}</span>
                    </div>
                    <div className="mt-0.5">
                      <div className="mb-1 flex items-center justify-between text-[11px]">
                        <span className="text-zinc-500">Jogadores</span>
                        <span className={"font-semibold " + (progress >= 100 ? "text-red-400" : "text-green-400")}>{inscritosCount}/{t.maxPlayers}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-700/60">
                        <div className={`h-full ${progressColor} transition-all`} style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="mt-2 flex items-center gap-2 border-t border-violet-500/15 px-5 py-3">
                  <Link href={`/tournaments/${t.id}`} className="flex-1 rounded-lg px-3 py-1.5 text-center text-sm font-semibold text-indigo-400 hover:bg-indigo-500/20 transition-colors">Ver Detalhes</Link>
                  {(t as any).organizer?.username && <span className="text-[11px] text-zinc-500 hidden sm:inline">Por <span className="text-indigo-400 font-medium">{(t as any).organizer.username}</span></span>}
                  {isOwnerOrAdmin(t) && <><Link href={`/tournaments/${t.id}/edit`} className="flex-1 rounded-lg px-3 py-1.5 text-center text-sm font-semibold text-zinc-400 hover:bg-zinc-500/20 transition-colors">Editar</Link><Button variant="danger" onClick={() => handleDelete(t.id)} className="rounded-lg">Eliminar</Button></>}
                </div>
              </div>
            );
            })}
          </div>
      }
    </div>
  );
}
