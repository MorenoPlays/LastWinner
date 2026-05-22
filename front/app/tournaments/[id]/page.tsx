"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { use as reactUse } from "react";
import { tournamentsApi, participantsApi, messagesApi, adminUsersApi } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";
import { useParticipants } from "@/features/tournaments/participants/useParticipants";
import { useMessages } from "@/features/tournaments/messages/useMessages";
import type { Tournament, User } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { responseCookiesToRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

const STATUS_COLOR: Record<string, string> = { DRAFT: "bg-slate-700/60 text-zinc-300", OPEN: "bg-green-500/30 text-green-300", ONGOING: "bg-sky-500/30 text-sky-300", FINISHED: "bg-amber-500/30 text-amber-300", CANCELED: "bg-red-500/30 text-red-300" };
type Tab = "overview" | "participants" | "messages";

const FORMAT_MAP: Record<string, string> = { SINGLE_ELIMINATION: "Eliminatória simples", DOUBLE_ELIMINATION: "Eliminatória dupla", ROUND_ROBIN: "Todos contra todos", SWISS: "Sistema suíço" };
const MODE_MAP: Record<string, string> = { ONLINE: "Online", PRESENTIAL: "Presencial" };
const STATUS_MAP: Record<string, string> = { DRAFT: "Rascunho", OPEN: "Aberto", ONGOING: "Em curso", FINISHED: "Terminado", CANCELED: "Cancelado" };

const inputCls = "flex-1 rounded-lg border border-violet-500/30 bg-slate-900/60 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-400";
const selectCls = "flex-1 rounded-lg border border-violet-500/30 bg-slate-900/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-400";

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN" || user?.role === "ORGANIZER";
  const {id} = reactUse(params);
  
  const participants = useParticipants();
  const messages = useMessages();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msgText, setMsgText] = useState("");
  const [msgLoading, setMsgLoading] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [availUsers, setAvailUsers] = useState<User[]>([]);

   useEffect(() => {
     let cancelled = false;
     const run = async () => {
       if (!id) {
         setError("ID do torneio não fornecido");
         setLoading(false);
         return;
       }
       try {
         const [t, allParts, allMsgs] = await Promise.all([
           tournamentsApi.getOne(id),
           participantsApi.getAll(),
           messagesApi.getAll(),
         ]);
         if (cancelled) return;
         setTournament(t);
         participants.setParticipants(allParts);
         messages.setMessages(allMsgs);
         participants.loadForTournament(id, allParts);
         messages.loadForTournament(id, allMsgs);
       } catch (err: unknown) {
         if (cancelled) return;
         const msg = err instanceof Error ? err.message : String(err);
         setError(msg);
       } finally {
         if (!cancelled) setLoading(false);
       }
     };
     run();
     return () => { cancelled = true; };
   }, [id, participants, messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !msgText.trim()) return;
    setMsgLoading(true);
    try {
      const newMsg = await messages.send(id, user, msgText.trim());
      setMsgText("");
    } catch (err: any) { alert(err.message); }
    finally { setMsgLoading(false); }
  };

   const handleJoin = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!selectedUserId || !id) return;
     try {
       const created = await participants.create({ tournamentId: id, userId: selectedUserId });
       const all = await participantsApi.getAll();
       participants.setParticipants(all);
       participants.loadForTournament(id, all);
       setShowJoinForm(false);
       setSelectedUserId("");
     } catch (err: any) { alert(err.message); }
   };

   const handleLeave = async (pid: string) => {
     if (!id) return;
     try {
       await participants.delete(pid);
       const all = await participantsApi.getAll();
       participants.setParticipants(all);
       participants.loadForTournament(id, all);
     } catch (err: any) { alert(err.message); }
   };

  const handleSetWinner = async (pid: string, pos: number) => {
    try {
      await participants.update(pid, { status: "WINNER" as any, finalPosition: pos });
      const all = await participantsApi.getAll();
      participants.setParticipants(all);
      participants.loadForTournament(id, all);
    } catch (err: any) { alert(err.message); }
  };

  const loadUsers = async () => {
    try {
      const all = await adminUsersApi.getAll();
      setAvailUsers(all.filter((u: User) => !participants.participants.some((p) => p.userId === u.id)));
    } catch (err) {
      console.error("Failed to load users:", err);
      alert("Não foi possível carregar os utilizadores.");
    }
  };

  if (loading) return <p className="p-8 text-center text-zinc-400">A carregar…</p>;
  if (error || !tournament) return <p className="p-8 text-center text-red-400">{error || "Torneio não encontrado."}</p>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/tournaments" className="mb-4 inline-block text-sm font-semibold text-violet-400 hover:text-violet-300 hover:underline">← Voltar aos torneios</Link>
      {tournament.bannerUrl && <img src={tournament.bannerUrl} alt={tournament.title} className="mb-6 h-56 w-full rounded-xl object-cover" />}
      <div className="mb-6 flex items-start justify-between">
        <div><h1 className="text-2xl font-extrabold tracking-tight text-sky-300">{tournament.title}</h1><p className="mt-1 text-sm text-zinc-400">{tournament.description}</p></div>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLOR[tournament.status]}`}>{STATUS_MAP[tournament.status]}</span>
      </div>
      <div className="glass-card mb-8 grid grid-cols-2 gap-3 rounded-xl p-4 sm:grid-cols-4">
        <div><p className="text-xs text-zinc-400">Formato</p><p className="text-sm font-semibold text-zinc-200">{FORMAT_MAP[tournament.format]}</p></div>
        <div><p className="text-xs text-zinc-400">Modo</p><p className="text-sm font-semibold text-zinc-200">{MODE_MAP[tournament.mode]}</p></div>
        <div><p className="text-xs text-zinc-400">Inscrição</p><p className="text-sm font-semibold text-zinc-200">{tournament.entryFee > 0 ? `$${tournament.entryFee}` : "Grátis"}</p></div>
        <div><p className="text-xs text-zinc-400">Prémio</p><p className="text-sm font-semibold text-zinc-200">{tournament.prizePool > 0 ? `$${tournament.prizePool}` : "—"}</p></div>
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b border-violet-500/20">
        <div className="flex gap-6">
          {(["overview", "participants", "messages"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`relative pb-3 text-sm font-semibold transition-colors ${activeTab === tab ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"}`}>
              {tab === "overview" ? "Geral" : tab === "participants" ? `Participantes (${participants.participants.length})` : `Chat (${messages.messages.length})`}
              {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="glass-card card-hover rounded-xl p-6">
            <h2 className="mb-2 text-lg font-semibold text-indigo-300">Detalhes</h2>
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-zinc-500">ID</dt><dd className="font-mono text-zinc-200">{tournament.id}</dd></div>
              <div><dt className="text-zinc-500">Jogo</dt><dd className="text-zinc-200">{(tournament as any).game?.name || tournament.gameId}</dd></div>
              <div><dt className="text-zinc-500">Máx. Jogadores</dt><dd className="text-zinc-200">{tournament.maxPlayers}</dd></div>
              <div><dt className="text-zinc-500">Criado em</dt><dd className="text-zinc-200">{new Date(tournament.createdAt).toLocaleDateString("pt-PT")}</dd></div>
            </dl>
          </div>
          <div className="flex gap-3">
            <Link href={`/tournaments/${tournament.id}/edit`}><Button className="rounded-lg shadow-lg shadow-indigo-500/30">Editar Torneio</Button></Link>
          </div>
        </div>
      )}

      {/* Participants */}
      {activeTab === "participants" && (
        <div className="space-y-4">
          {canManage && <button onClick={() => { loadUsers(); setShowJoinForm(true); }} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-shadow">Adicionar Participante</button>}
          {showJoinForm && (
            <form onSubmit={handleJoin} className="glass-card card-hover flex gap-2 rounded-xl p-4">
              {availUsers.length === 0 ? <p className="text-sm text-zinc-400">Nenhum utilizador disponível.</p> :
                <><select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className={selectCls}><option value="">Seleciona utilizador</option>{availUsers.map((u) => <option key={u.id} value={u.id}>{u.username} ({u.email})</option>)}</select>
                <button type="submit" disabled={!selectedUserId} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50 transition-colors">Adicionar</button>
                <button type="button" onClick={() => setShowJoinForm(false)} className="rounded-lg border border-violet-500/30 px-3 py-2 text-sm text-zinc-300 hover:bg-violet-500/15 transition-colors">Cancelar</button></>
              }
            </form>
          )}
          {participants.participants.length === 0 ? <p className="text-sky-400/60">Nenhum participante ainda.</p> :
            <div className="space-y-2">{participants.participants.map((p) => (
              <div key={p.id} className="glass-card card-hover flex items-center justify-between rounded-xl px-4 py-3">
                <div><p className="font-semibold text-zinc-200">{p.user?.username || p.userId}</p><p className="text-xs text-zinc-500">Status: {p.status}{p.finalPosition != null ? ` | Posição: #${p.finalPosition}` : ""}</p></div>
                {canManage && <div className="flex gap-2"><button onClick={() => handleSetWinner(p.id, 1)} className="rounded-lg px-2 py-1 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-colors">#1</button><button onClick={() => handleLeave(p.id)} className="rounded-lg px-2 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors">Remover</button></div>}
              </div>
            ))}</div>}
        </div>
      )}

      {/* Messages */}
      {activeTab === "messages" && (
        <div className="glass-card card-hover flex h-[60vh] flex-col overflow-hidden rounded-xl">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.messages.length === 0 && <p className="text-center text-sm text-zinc-400">Sem mensagens ainda.</p>}
            {messages.messages.map((m) => (
              <div key={m.id} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/30 text-xs font-extrabold text-indigo-300">{m.user?.username?.[0]?.toUpperCase() || "?"}</div>
                <div><p className="text-sm font-semibold text-zinc-200">{m.user?.username || m.userId}</p><p className="text-sm text-zinc-300">{m.message}</p><p className="text-xs text-zinc-500">{new Date(m.createdAt).toLocaleString("pt-PT")}</p></div>
              </div>
            ))}
          </div>
          {user && (
            <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-violet-500/20 p-3">
              <input type="text" value={msgText} onChange={(e) => setMsgText(e.target.value)} placeholder="Escreve uma mensagem…" className={inputCls} />
              <button type="submit" disabled={msgLoading || !msgText.trim()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 shadow-lg shadow-indigo-600/30 transition-shadow">{msgLoading ? "…" : "Enviar"}</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
