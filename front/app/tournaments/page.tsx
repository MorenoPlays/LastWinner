"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { tournamentsApi, participantsApi, messagesApi } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";
import { useTournaments } from "@/features/tournaments/useTournaments";
import { useParticipants } from "@/features/tournaments/participants/useParticipants";
import { useMessages } from "@/features/tournaments/messages/useMessages";
import type { Tournament, User } from "@/lib/types";
import { Button } from "@/components/ui/Button";

const FORMAT_MAP: Record<string, string> = { SINGLE_ELIMINATION: "Eliminatória simples", DOUBLE_ELIMINATION: "Eliminatória dupla", ROUND_ROBIN: "Todos contra todos", SWISS: "Sistema suíço" };
const MODE_MAP: Record<string, string> = { ONLINE: "Online", PRESENTIAL: "Presencial" };
const STATUS_MAP: Record<string, string> = { DRAFT: "Rascunho", OPEN: "Aberto", ONGOING: "Em curso", FINISHED: "Terminado", CANCELED: "Cancelado" };
const STATUS_COLOR: Record<string, string> = { DRAFT: "bg-slate-700/60 text-zinc-300", OPEN: "bg-green-500/30 text-green-300", ONGOING: "bg-sky-500/30 text-sky-300", FINISHED: "bg-amber-500/30 text-amber-300", CANCELED: "bg-red-500/30 text-red-300" };
type Tab = "overview" | "participants" | "messages";

export default function TournamentsPage() {
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN" || user?.role === "ORGANIZER";
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
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-indigo-300">Torneios</h1>
        {canManage && <Link href="/tournaments/new"><Button>Novo Torneio</Button></Link>}
      </div>
      {error && <p className="mb-4 rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300 ring-1 ring-red-500/30">{error}</p>}
      {tournaments.length === 0 ? <p className="text-sky-400/60">Nenhum torneio encontrado.</p> :
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {tournaments.map((t) => (
            <div key={t.id} className="glass-card card-hover flex flex-col gap-3 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div><h2 className="text-lg font-semibold text-sky-300">{t.title}</h2><p className="text-xs text-zinc-400">Formato: {FORMAT_MAP[t.format] || t.format}</p></div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[t.status] || STATUS_COLOR.DRAFT}`}>{STATUS_MAP[t.status] || t.status}</span>
              </div>
              {t.description && <p className="text-sm text-zinc-400 line-clamp-2">{t.description}</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400"><span>Jogadores: {t.maxPlayers}</span><span>Inscrição: {t.entryFee > 0 ? `$${t.entryFee}` : "Grátis"}</span><span>Prémio: {t.prizePool > 0 ? `$${t.prizePool}` : "—"}</span><span>Modo: {t.mode === "ONLINE" ? "Online" : "Presencial"}</span></div>
              {t.bannerUrl && <img src={t.bannerUrl} alt={t.title} className="h-36 w-full rounded-lg object-cover" />}
              <div className="mt-auto flex items-center gap-2 pt-2">
                <Link href={`/tournaments/${t.id}`} className="flex-1 rounded-lg px-3 py-1.5 text-center text-sm font-semibold text-indigo-400 hover:bg-indigo-500/20 transition-colors">Ver Detalhes</Link>
                {canManage && <><Link href={`/tournaments/${t.id}/edit`} className="flex-1 rounded-lg px-3 py-1.5 text-center text-sm font-semibold text-zinc-400 hover:bg-zinc-500/20 transition-colors">Editar</Link><Button variant="danger" onClick={() => handleDelete(t.id)} className="rounded-lg">Eliminar</Button></>}
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
}
