"use client";

import { useState, useEffect, use as reactUse } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { tournamentsApi, gamesApi } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";
import { useTournaments } from "@/features/tournaments/useTournaments";
import type { Tournament } from "@/lib/types";
import { Button } from "@/components/ui/Button";

const FORMAT_OPTIONS = [{ value: "SINGLE_ELIMINATION", label: "Eliminatória simples" }, { value: "DOUBLE_ELIMINATION", label: "Eliminatória dupla" }, { value: "ROUND_ROBIN", label: "Todos contra todos" }, { value: "SWISS", label: "Sistema suíço" }];
const MODE_OPTIONS = [{ value: "ONLINE", label: "Online" }, { value: "PRESENTIAL", label: "Presencial" }];

const inputCls = "w-full rounded-lg border border-violet-500/30 bg-slate-900/60 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40";
const selectCls = inputCls;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-sky-300">{label}</label>
      {children}
    </div>
  );
}

export default function EditTournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const router = useRouter();
  const canManage = user?.role === "ADMIN" || user?.role === "ORGANIZER";
  const { update } = useTournaments();
  const id = reactUse(params);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [gameId, setGameId] = useState("");
  const [format, setFormat] = useState("");
  const [mode, setMode] = useState("");
  const [status, setStatus] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(16);
  const [entryFee, setEntryFee] = useState(0);
  const [prizePool, setPrizePool] = useState(0);
  const [bannerUrl, setBannerUrl] = useState("");
  const [games, setGames] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoadingState] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [t, g] = await Promise.all([tournamentsApi.getOne(id), gamesApi.getAll()]);
        setTournament(t); setTitle(t.title); setDescription(t.description || ""); setGameId(t.gameId); setFormat(t.format); setMode(t.mode); setStatus(t.status); setMaxPlayers(t.maxPlayers); setEntryFee(t.entryFee); setPrizePool(t.prizePool); setBannerUrl(t.bannerUrl || ""); setGames(g);
      } catch (err) { setError(err instanceof Error ? err.message : "Erro."); }
      finally { setFetching(false); }
    })();
  }, [id]);

  if (!canManage) return <p className="p-8 text-center text-red-400">Sem permissão.</p>;
  if (fetching) return <p className="p-8 text-center text-zinc-400">A carregar…</p>;
  if (!tournament) return <p className="p-8 text-center text-zinc-400">Torneio não encontrado.</p>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingState(true); setError("");
    try {
      await update(id, { title, description: description || undefined, gameId, format, mode, status, maxPlayers, entryFee: entryFee || undefined, prizePool: prizePool || undefined, bannerUrl: bannerUrl || undefined });
      router.push("/tournaments");
    } catch (err) { setError(err instanceof Error ? err.message || "Erro ao atualizar." : "Erro ao atualizar."); }
    finally { setLoadingState(false); }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href={`/tournaments/${id}`} className="mb-4 inline-block text-sm font-semibold text-violet-400 hover:text-violet-300 hover:underline">← Voltar aos detalhes</Link>
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-indigo-300">Editar Torneio</h1>
      {error && <p className="mb-4 rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300 ring-1 ring-red-500/30">{error}</p>}
      <form onSubmit={handleSubmit} className="glass-card card-hover space-y-4 rounded-2xl p-6">
        <Field label="Título"><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputCls} /></Field>
        <Field label="Descrição"><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputCls} /></Field>
        <Field label="Jogo"><select value={gameId} onChange={(e) => setGameId(e.target.value)} required className={selectCls}>{games.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Formato"><select value={format} onChange={(e) => setFormat(e.target.value)} className={selectCls}>{FORMAT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>
          <Field label="Modo"><select value={mode} onChange={(e) => setMode(e.target.value)} className={selectCls}>{MODE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>
          <Field label="Estado"><select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}><option value="DRAFT">Rascunho</option><option value="OPEN">Aberto</option><option value="ONGOING">Em curso</option><option value="FINISHED">Terminado</option><option value="CANCELED">Cancelado</option></select></Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Jogadores máx."><input type="number" value={maxPlayers} onChange={(e) => setMaxPlayers(Number(e.target.value))} min={2} className={inputCls} /></Field>
          <Field label="Inscrição ($)"><input type="number" value={entryFee} onChange={(e) => setEntryFee(Number(e.target.value))} min={0} className={inputCls} /></Field>
          <Field label="Prémio ($)"><input type="number" value={prizePool} onChange={(e) => setPrizePool(Number(e.target.value))} min={0} className={inputCls} /></Field>
        </div>
        <Field label="URL do banner"><input type="url" value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} className={inputCls} /></Field>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading} className="flex-1 rounded-lg py-2.5">{loading ? "A guardar…" : "Guardar"}</Button>
          <Link href={`/tournaments/${id}`}><Button variant="secondary" className="rounded-lg">Cancelar</Button></Link>
        </div>
      </form>
    </div>
  );
}
