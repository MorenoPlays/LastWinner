"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { use as reactUse } from "react";
import { tournamentsApi, participantsApi, messagesApi, adminUsersApi } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";
import { useParticipants } from "@/features/tournaments/participants/useParticipants";
import { useMessages } from "@/features/tournaments/messages/useMessages";
import { usePosts } from "@/features/posts/usePosts";
import type { Tournament, User, Match } from "@/lib/types";
import { CURRENCY_MAP, formatCurrency } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { BracketTree } from "@/components/BracketTree";
import { MatchCard } from "@/components/MatchCard";
import { TournamentWinnerActions } from "@/components/TournamentWinnerActions";
import { TournamentResults } from "@/components/TournamentResults";
import { responseCookiesToRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

const STATUS_COLOR: Record<string, string> = { DRAFT: "bg-slate-700/60 text-zinc-300", OPEN: "bg-green-500/30 text-green-300", ONGOING: "bg-sky-500/30 text-sky-300", FINISHED: "bg-amber-500/30 text-amber-300", CANCELED: "bg-red-500/30 text-red-300" };
type Tab = "overview" | "participants" | "messages" | "posts";

const FORMAT_MAP: Record<string, string> = { SINGLE_ELIMINATION: "Eliminatória simples", DOUBLE_ELIMINATION: "Eliminatória dupla", ROUND_ROBIN: "Todos contra todos", SWISS: "Sistema suíço" };
const MODE_MAP: Record<string, string> = { ONLINE: "Online", PRESENTIAL: "Presencial" };
const STATUS_MAP: Record<string, string> = { DRAFT: "Rascunho", OPEN: "Aberto", ONGOING: "Em curso", FINISHED: "Terminado", CANCELED: "Cancelado" };

const inputCls = "flex-1 rounded-lg border border-violet-500/30 bg-slate-900/60 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-400";
const selectCls = "flex-1 rounded-lg border border-violet-500/30 bg-slate-900/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-400";

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const {id} = reactUse(params);
   
  const participants = useParticipants();
  const messages = useMessages();
  const posts = usePosts();
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [newPostImageUrl, setNewPostImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const uploadImage = async (file: File) => {
    try {
      setUploadingImage(true);
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      if (!cloudName || !uploadPreset) throw new Error('Cloudinary não configurado no frontend');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Falha no upload para o Cloudinary');
      const data = await res.json();
      return data.secure_url;
    } catch (err: any) {
      throw err;
    } finally {
      setUploadingImage(false);
    }
  };

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msgText, setMsgText] = useState("");
  const [msgLoading, setMsgLoading] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [availUsers, setAvailUsers] = useState<User[]>([]);
  const [showSelfJoin, setShowSelfJoin] = useState(false);
  const [joining, setJoining] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUploadedUrl, setProofUploadedUrl] = useState("");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [showPending, setShowPending] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<Array<{ id: string; userId: string; paymentProof?: string; user?: { username: string } }>>([]);

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
          // Load posts for this tournament
          posts.loadPostsByTournament(id);
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
      
    }, [id, participants, messages, posts]);

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
       setAvailUsers((all as User[]).filter(u => !participants.participants.some(p => p.userId === u.id)));
     } catch (err) {
       console.error("Failed to load users:", err);
       alert("Não foi possível carregar os utilizadores.");
     }
   };

  const isAlreadyRegistered = user
    ? participants.participants.some(p => p.userId === user.id && p.status !== "PENDING")
    : false;
  const isPendingPayment = user
    ? participants.participants.some(p => p.userId === user.id && p.status === "PENDING")
    : false;

  const handleSelfJoin = async (e: React.FormEvent, skipProof = false) => {
     e.preventDefault();
     if (!user || !id) return;
     setJoining(true);
     try {
       await participants.create({
         tournamentId: id,
         userId: user.id,
         paymentProof: skipProof ? undefined : (proofUploadedUrl || undefined),
       });
       const all = await participantsApi.getAll();
       participants.setParticipants(all);
       participants.loadForTournament(id, all);
       setShowSelfJoin(false);
       resetProofState();
     } catch (err: any) { alert(err.message); }
     finally { setJoining(false); }
   };

  const resetProofState = () => {
     setProofFile(null);
     setProofUploadedUrl("");
     setUploadingProof(false);
   };

  const loadPending = async () => {
     try {
       const data = await participantsApi.getPendingByTournament(id);
       setPendingRequests(data);
       setShowPending(true);
     } catch (err: any) { alert(err.message); }
   };

  const handleApprove = async (participantId: string) => {
     setApprovingId(participantId);
     try {
       await participantsApi.approvePending(participantId);
       setPendingRequests(prev => prev.filter(p => p.id !== participantId));
       const all = await participantsApi.getAll();
       participants.setParticipants(all);
       participants.loadForTournament(id, all);
     } catch (err: any) { alert(err.message); }
     finally { setApprovingId(null); }
   };

  if (loading) return <p className="p-8 text-center text-zinc-400">A carregar…</p>;
  if (error || !tournament) return <p className="p-8 text-center text-red-400">{error || "Torneio não encontrado."}</p>;

  const canManage = user?.role === "ADMIN" || user?.id === tournament.organizerId;

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
        <div><p className="text-xs text-zinc-400">Inscrição</p><p className="text-sm font-semibold text-zinc-200">{tournament.entryFee > 0 ? formatCurrency(tournament.entryFee, (tournament as any).currency || 'USD') : "Grátis"}</p></div>
        <div><p className="text-xs text-zinc-400">Prémio</p><p className="text-sm font-semibold text-zinc-200">{tournament.prizePool > 0 ? formatCurrency(tournament.prizePool, (tournament as any).currency || 'USD') : "—"}</p></div>
      </div>

       {/* Tabs */}
       <div className="mb-4 border-b border-violet-500/20">
         <div className="flex gap-6">
           {(["overview", "participants", "messages", "posts"] as const).map((tab) => (
             <button key={tab} onClick={() => setActiveTab(tab)} className={`relative pb-3 text-sm font-semibold transition-colors ${activeTab === tab ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"}`}>
               {tab === "overview" ? "Geral" : tab === "participants" ? `Participantes (${participants.participants.length})` : tab === "messages" ? `Chat (${messages.messages.length})` : `Posts (${posts.posts.length})`}
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
               <div><dt className="text-zinc-500">ID</dt><dd className="font-mono text-zinc-200">####################</dd></div>
               <div><dt className="text-zinc-500">Jogo</dt><dd className="text-zinc-200">{(tournament as any).game?.name || tournament.gameId}</dd></div>
               <div><dt className="text-zinc-500">Máx. Jogadores</dt><dd className="text-zinc-200">{tournament.maxPlayers}</dd></div>
               <div><dt className="text-zinc-500">Criado em</dt><dd className="text-zinc-200">{new Date(tournament.createdAt).toLocaleDateString("pt-PT")}</dd></div>
             </dl>
           </div>
           <div className="flex gap-3">
             {canManage && <Link href={`/tournaments/${tournament.id}/edit`}><Button className="rounded-lg shadow-lg shadow-indigo-500/30">Editar Torneio</Button></Link>}
             {user && !canManage && !isAlreadyRegistered && !isPendingPayment && (
               <button onClick={() => setShowSelfJoin(true)} className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-500 shadow-lg shadow-green-600/30 transition-shadow">
                 Inscrever-me
               </button>
             )}
             {user && !canManage && isPendingPayment && (
               <span className="flex items-center gap-2 rounded-lg border border-amber-500/30 px-4 py-2 text-sm font-semibold text-amber-400">⏳ Aguardando validação</span>
             )}
             {user && !canManage && isAlreadyRegistered && !isPendingPayment && (
               <span className="flex items-center gap-2 rounded-lg border border-green-500/30 px-4 py-2 text-sm font-semibold text-green-400">✓ Inscrito</span>
             )}
             {canManage && tournament.status === 'OPEN' && (
               <Button 
                //  variant="outline"
                 onClick={async () => {
                   if (window.confirm('Tem certeza que deseja iniciar o torneio? Isso criará as partidas e alterará o status para "Em curso".')) {
                     try {
                       await tournamentsApi.startTournament(tournament.id);
                       const updatedTournament = await tournamentsApi.getOne(tournament.id);
                       setTournament(updatedTournament);
                     } catch (err: any) {
                       alert(err.message || 'Erro ao iniciar o torneio');
                     }
                   }
                 }}
               >
                 Iniciar Torneio
               </Button>
             )}
           </div>
          
           {/* Bracket Visualization */}
           {tournament.brackets && tournament.brackets.length > 0 && (
             <div className="space-y-4">
               <h2 className="text-lg font-semibold text-indigo-300">Bracket</h2>
               {/* <div className="mb-4">
                 {tournament.status === 'OPEN' && canManage && (
                   <Button 
                     variant="outline"
                     onClick={async () => {
                       if (window.confirm('Tem certeza que deseja iniciar o torneio? Isso criará as partidas e alterará o status para "Em curso".')) {
                         try {
                           await tournamentsApi.startTournament(tournament.id);
                           const updatedTournament = await tournamentsApi.getOne(tournament.id);
                           setTournament(updatedTournament);
                         } catch (err: any) {
                           alert(err.message || 'Erro ao iniciar o torneio');
                         }
                       }
                     }}
                   >
                     Iniciar Torneio
                   </Button>
                 )}
               </div> */}
               <div className="glass-card rounded-2xl p-6">
                 {/* Fetch matches for the first bracket */}
                 {tournament.brackets[0]?.matches ? (
                   <>
                     {/* Calculate winner's bracket rounds from maxPlayers */}
                     {(() => {
                       const wbRounds = Math.log2(tournament.maxPlayers) || 0;
                       
                       return (
                         <BracketTree 
                           matches={tournament.brackets[0].matches} 
                           wbRounds={wbRounds}
                           tournamentId={tournament.id}
                           canStart={tournament.status === 'OPEN' && canManage}
                           refetch={async () => {
                             const updatedTournament = await tournamentsApi.getOne(tournament.id);
                             setTournament(updatedTournament);
                           }}
                         />
                       );
                     })()}
                   </>
                 ) : (
                   <p className="text-center text-zinc-400 py-8">Carregando partidas...</p>
                 )}
               </div>
             </div>
           )}

           {/* Winner Actions & Results */}
           {tournament.status === 'ONGOING' && canManage && (
             <div className="space-y-4">
               <h2 className="text-lg font-semibold text-indigo-300">Definir Vencedor</h2>
               <TournamentWinnerActions
                 tournament={tournament}
                 onSuccess={(result) => {
                   setTournament(result);
                 }}
               />
             </div>
           )}

           {tournament.status === 'FINISHED' && (
             <div className="space-y-4">
               <TournamentResults tournament={tournament} />
             </div>
           )}
         </div>
       )}

      {/* Self-join modal */}
      {showSelfJoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => { setShowSelfJoin(false); resetProofState(); }}>
          <div className="glass-card max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6" onClick={e => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-semibold text-indigo-300">Inscrever-se no Torneio</h2>
            {tournament.entryFee > 0 ? (
              <>
                <p className="mb-4 text-sm text-zinc-400">
                  Taxa de inscrição: <strong className="text-amber-300">{formatCurrency(tournament.entryFee, (tournament as any).currency || 'USD')}</strong>. Escolha uma das opções abaixo. A sua inscrição ficará pendente até o organizador confirmar o pagamento.
                </p>

                {!proofUploadedUrl ? (
                  <div className="space-y-4">
                    <div className="glass-card rounded-xl border border-violet-500/20 p-4">
                      <h3 className="mb-2 text-sm font-semibold text-sky-300">Enviar comprovativo de pagamento (recomendado)</h3>
                      <p className="mb-3 text-xs text-zinc-400">Faça upload de uma imagem do comprovativo (PNG, JPG, WEBP). O arquivo será armazenado no Cloudinary.</p>
                      <div className="flex flex-col gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => setProofFile(e.target.files?.[0] || null)}
                          className="text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-violet-500"
                        />
                        {proofFile && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (!proofFile) return;
                              setUploadingProof(true);
                              try {
                                const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                                const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
                                if (!cloudName || !uploadPreset) throw new Error('Cloudinary não configurado no frontend');
                                const formData = new FormData();
                                formData.append('file', proofFile);
                                formData.append('upload_preset', uploadPreset);
                                const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                                  method: 'POST',
                                  body: formData,
                                });
                                if (!res.ok) throw new Error('Falha no upload para o Cloudinary');
                                const data = await res.json();
                                setProofUploadedUrl(data.secure_url);
                              } catch (err: any) { alert(err.message); }
                              finally { setUploadingProof(false); }
                            }}
                            disabled={uploadingProof}
                            className="rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                          >
                            {uploadingProof ? "A enviar…" : `Enviar "${proofFile.name}" para o Cloudinary`}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="glass-card rounded-xl border border-amber-500/20 p-4">
                      <h3 className="mb-2 text-sm font-semibold text-amber-300">Inscrever-me sem comprovativo</h3>
                      <p className="mb-3 text-xs text-zinc-400">Você não tem o comprovativo agora. A sua inscrição ficará pendente — é sua responsabilidade contactar o organizador para efectuar o pagamento.</p>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          disabled={joining}
                          onClick={(e) => { e.preventDefault(); handleSelfJoin(e as any, true); }}
                          className="flex-1 rounded-lg bg-amber-600 py-2.5 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-50 shadow-lg shadow-amber-600/30 transition-shadow"
                        >
                          {joining ? "A inscrever…" : "Inscrever-me (sem comprovativo)"}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button type="button" onClick={() => { setShowSelfJoin(false); resetProofState(); }} className="rounded-lg border border-violet-500/30 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-violet-500/15 transition-colors">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="glass-card rounded-xl border border-green-500/20 p-4">
                      <p className="text-sm text-green-400">✓ Comprovativo enviado com sucesso!</p>
                      <div className="mt-2 flex items-center gap-3">
                        <img src={proofUploadedUrl} alt="Comprovativo" className="max-h-40 rounded-lg border border-violet-500/20" />
                        <a href={proofUploadedUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:underline">Abrir em nova aba</a>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        disabled={joining}
                        onClick={(e) => { e.preventDefault(); handleSelfJoin(e as any, false); }}
                        className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50 shadow-lg shadow-green-600/30 transition-shadow"
                      >
                        {joining ? "A enviar…" : "Confirmar Inscrição"}
                      </button>
                      <button type="button" onClick={() => resetProofState()} className="rounded-lg border border-violet-500/30 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-violet-500/15 transition-colors">Trocar imagem</button>
                      <button type="button" onClick={() => { setShowSelfJoin(false); resetProofState(); }} className="rounded-lg border border-violet-500/30 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-violet-500/15 transition-colors">Cancelar</button>
                    </div>
                  </div>
                )}
              </>
            ) : tournament.prizePool > 0 ? (
              <>
                <p className="mb-4 text-sm text-zinc-400">Este torneio tem prémios. Inscrição gratuita — será registado imediatamente.</p>
                <form onSubmit={handleSelfJoin} className="space-y-4">
                  <div className="flex gap-3">
                    <button type="submit" disabled={joining} className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50 shadow-lg shadow-green-600/30 transition-shadow">{joining ? "A inscrever…" : "Inscrever-me gratuitamente"}</button>
                    <button type="button" onClick={() => { setShowSelfJoin(false); resetProofState(); }} className="rounded-lg border border-violet-500/30 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-violet-500/15 transition-colors">Cancelar</button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <p className="mb-4 text-sm text-zinc-400">Torneio gratuito — será registado imediatamente.</p>
                <form onSubmit={handleSelfJoin} className="space-y-4">
                  <div className="flex gap-3">
                    <button type="submit" disabled={joining} className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50 shadow-lg shadow-green-600/30 transition-shadow">{joining ? "A inscrever…" : "Inscrever-me gratuitamente"}</button>
                    <button type="button" onClick={() => { setShowSelfJoin(false); resetProofState(); }} className="rounded-lg border border-violet-500/30 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-violet-500/15 transition-colors">Cancelar</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Participants */}
      {activeTab === "participants" && (
        <div className="space-y-4">
          {canManage && tournament.status === 'ONGOING' && (
            <div className="glass-card rounded-xl border border-green-500/30 p-4">
              <p className="mb-3 text-sm font-semibold text-green-300">Torneio em Curso</p>
              <TournamentWinnerActions
                tournament={tournament}
                onSuccess={(result) => {
                  setTournament(result);
                  setActiveTab("overview");
                }}
              />
            </div>
          )}
          {canManage && <button onClick={() => { loadUsers(); setShowJoinForm(true); }} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-shadow">Adicionar Participante</button>}
          {canManage && (tournament.entryFee > 0 || tournament.prizePool > 0) && (
            <button onClick={loadPending} className={`rounded-lg px-4 py-2 text-sm font-semibold hover:bg-amber-500/15 transition-colors ${pendingRequests.length > 0 ? "border border-amber-500/40 text-amber-400" : "border border-violet-500/30 text-zinc-300"}`}>
              {showPending ? "← Ver participantes" : pendingRequests.length > 0 ? `Pedidos pendentes (${pendingRequests.length})` : "Pedidos pendentes"}
            </button>
          )}
          {showPending && pendingRequests.length > 0 && (
            <div className="space-y-2">
              {pendingRequests.map(p => (
                <div key={p.id} className="glass-card card-hover flex items-center gap-3 rounded-xl px-4 py-3">
                  <p className="font-semibold text-amber-300">{p.user?.username || p.userId}</p>
                  {p.paymentProof && <a href={p.paymentProof} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:underline">Ver comprovativo</a>}
                  <button onClick={() => handleApprove(p.id)} disabled={approvingId === p.id} className="ml-auto rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500 disabled:opacity-50 transition-colors">{approvingId === p.id ? "A aprovar…" : "Aprovar"}</button>
                  <button onClick={async () => { await participants.delete(p.id); const all = await participantsApi.getAll(); participants.setParticipants(all); participants.loadForTournament(id, all); setPendingRequests(prev => prev.filter(r => r.id !== p.id)); }} className="rounded-lg bg-red-600/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 transition-colors">Rejeitar</button>
                </div>
              ))}
            </div>
          )}
          {showJoinForm && (
            <form onSubmit={handleJoin} className="glass-card card-hover flex gap-2 rounded-xl p-4">
              {availUsers.length === 0 ? <p className="text-sm text-zinc-400">Nenhum utilizador disponível.</p> :
                <><select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className={selectCls}><option value="">Seleciona utilizador</option>{availUsers.map((u) => <option key={u.id} value={u.id}>{u.username} ({u.email})</option>)}</select>
                <button type="submit" disabled={!selectedUserId} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50 transition-colors">Adicionar</button>
                <button type="button" onClick={() => setShowJoinForm(false)} className="rounded-lg border border-violet-500/30 px-3 py-2 text-sm text-zinc-300 hover:bg-violet-500/15 transition-colors">Cancelar</button></>
              }
            </form>
          )}
          {showPending ? (
            pendingRequests.length === 0 ? <p className="text-sm text-gray-500">Sem pedidos pendentes.</p> :
            <p className="text-xs text-zinc-500 italic">Lista de pedidos pendentes acima — selecione um para aprovar ou rejeitar.</p>
          ) : (
            participants.participants.length === 0
              ? <p className="text-sky-400/60">Nenhum participante ainda.</p>
              : <div className="space-y-2">
                  {participants.participants.map((p) => (
                    <div key={p.id} className={`glass-card card-hover flex items-center justify-between rounded-xl px-4 py-3 ${p.status === 'PENDING' ? 'border border-amber-500/30' : ''}`}>
                      <div>
                        <p className={`font-semibold ${p.status === 'PENDING' ? 'text-amber-300' : 'text-zinc-200'}`}>{p.user?.username || p.userId}</p>
                        <p className="text-xs text-zinc-500">
                          Status: {p.status}
                          {p.finalPosition != null ? ` | Posição: #${p.finalPosition}` : ""}
                          {p.status === 'PENDING' ? ' | Aguardando pagamento' : ''}
                        </p>
                      </div>
                      {canManage && p.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(p.id)} disabled={approvingId === p.id} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500 disabled:opacity-50 transition-colors">{approvingId === p.id ? 'A aprovar…' : 'Aprovar'}</button>
                          <button onClick={async () => { await participants.delete(p.id); const all = await participantsApi.getAll(); participants.setParticipants(all); participants.loadForTournament(id, all); }} className="rounded-lg bg-red-600/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 transition-colors">Rejeitar</button>
                        </div>
                      )}
                      {canManage && p.status !== 'PENDING' && <div className="flex gap-2"><button onClick={() => handleSetWinner(p.id, 1)} className="rounded-lg px-2 py-1 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-colors">#1</button><button onClick={() => handleLeave(p.id)} className="rounded-lg px-2 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors">Remover</button></div>}
                    </div>
                  ))}
                </div>
          )}
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
       
       {/* Posts */}
       {activeTab === "posts" && (
         <div className="space-y-4">
           {/* Create Post Form */}
           {user && (
             <div className="glass-card rounded-xl p-5 border border-violet-500/20">
               <h3 className="mb-3 text-lg font-semibold text-indigo-300">Criar Post</h3>
               <form onSubmit={async (e) => {
                 e.preventDefault();
                 if (!newPostContent.trim()) return;
                 try {
                   let imageUrl = newPostImageUrl;
                   if (newPostImage && !newPostImageUrl) {
                     imageUrl = await uploadImage(newPostImage);
                   }
                   await posts.createPost({
                     userId: user.id,
                     content: newPostContent,
                     tournamentId: id,
                     imageUrl,
                   });
                   setNewPostContent("");
                   setNewPostImage(null);
                   setNewPostImageUrl(null);
                   // Refresh posts after creating
                   await posts.loadPostsByTournament(id);
                 } catch (err: any) {
                   alert(err.message);
                 }
               }} className="space-y-3">
                 <div className="flex items-start gap-3">
                   <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/30 text-xs font-extrabold text-indigo-300">
                     {user.username?.[0]?.toUpperCase() || "?"}
                   </div>
                   <textarea
                     value={newPostContent}
                     onChange={(e) => setNewPostContent(e.target.value)}
                     placeholder="O que está acontecendo?"
                     className="flex-1 min-h-20 rounded-lg border border-violet-500/30 bg-slate-900/60 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-400 resize-y"
                   />
                 </div>
                 <div className="flex items-center gap-3">
                   <input
                     type="file"
                     accept="image/*"
                     onChange={(e) => {
                       if (e.target.files?.[0]) {
                         setNewPostImage(e.target.files[0]);
                         setNewPostImageUrl(null); // Reset URL when new file selected
                       }
                     }}
                     className="text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-violet-500"
                   />
                   {newPostImageUrl ? (
                     <div className="flex items-center gap-2">
                       <img src={newPostImageUrl} alt="Preview" className="max-h-24 rounded-lg" />
                       <button type="button" onClick={() => {
                         setNewPostImage(null);
                         setNewPostImageUrl(null);
                       }} className="text-xs text-red-400 hover:text-red-300">
                         Remover
                       </button>
                     </div>
                   ) : newPostImage && (
                     <div className="flex items-center gap-2">
                       <img src={URL.createObjectURL(newPostImage)} alt="Preview" className="max-h-24 rounded-lg" />
                       <button type="button" onClick={() => {
                         setNewPostImage(null);
                         setNewPostImageUrl(null);
                       }} className="text-xs text-red-400 hover:text-red-300">
                         Remover
                       </button>
                     </div>
                   )}
                   <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
                     Publicar
                   </button>
                 </div>
               </form>
             </div>
           )}
           
           {posts.loading && <p className="text-center py-8 text-zinc-400">A carregar posts...</p>}
           {posts.error && <p className="text-center text-red-400">Erro ao carregar posts: {posts.error}</p>}
           {posts.posts.length === 0 && !posts.loading && !posts.error && (
             <p className="text-center py-8 text-zinc-400">Ainda não há posts neste torneio. Seja o primeiro a publicar!</p>
           )}
           {!posts.loading && posts.posts.length > 0 && (
             <div className="space-y-4">
               {posts.posts.map((post) => (
                 <div key={post.id} className="glass-card card-hover rounded-xl p-5 border border-violet-500/20">
                   <div className="flex items-start gap-4 mb-3">
                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/30 text-xs font-extrabold text-indigo-300">
                       {post.user?.username?.[0]?.toUpperCase() || "?"}
                     </div>
                     <div className="flex-1 space-y-1">
                       <div className="flex items-center gap-2">
                         <p className="font-semibold text-zinc-200">{post.user?.username || post.userId}</p>
                         <p className="text-xs text-zinc-500">{new Date(post.createdAt).toLocaleString("pt-PT")}</p>
                       </div>
                       <p className="text-zinc-200">{post.content}</p>
                       {post.imageUrl && (
                         <div className="mt-3">
                           <img src={post.imageUrl} alt="Post" className="rounded-lg max-h-48 w-full object-cover" />
                         </div>
                       )}
                       {post.videoUrl && (
                         <div className="mt-3">
                           <video controls className="rounded-lg max-h-48 w-full object-contain">
                             <source src={post.videoUrl} type="video/mp4" />
                             Your browser does not support the video tag.
                           </video>
                         </div>
                       )}
                       <div className="mt-4 flex items-center gap-4 text-sm text-zinc-400">
                         <button onClick={() => posts.likePost(post.id)} className={`flex items-center gap-1 hover:text-indigo-400 transition-colors ${post.isLikedByUser ? "text-indigo-400" : "text-zinc-400"}`}>
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M2 10.3c1.3-.6 3.5-2 5.3-3.6.9-.8 1.8-1.7 2.7-2.5 1-.9 2.5-1.1 3.5-.2.8.9 1.9.9 2.9 0 2.5-2 4.5-4.6 5.6-1.3.5-2.7.8-4.1.8-1.4 0-2.8-.3-4-1.1C1.7 15.1.5 13.1 2 10.3zM13 6.1c-.7-.2-1.4-.1-2 .2-.8.4-1.2 1.1-1.2 2 0 .9.4 1.6 1 2.1l4.1 3.1c.4.3.9.4 1.4.4s1-.1 1.4-.4l4.1-3.1c.6-.5 1-1.2 1-2.1 0-.9-.4-1.6-1-2.1-.8-.3-1.5-.4-2-.2zm0 10.7c-.8.3-1.7.4-2.5.4s-1.7-.1-2.5-.4c-.8-.3-1.4-1-1.4-1.9 0-.8.5-1.5 1.2-1.8L9 12.3l-1.6-1.1c-.7-.5-1-.9-.9-1.4-.1-.4-.1-.8.1-1.1.2-.3.7-.4 1.2-.4l1.6 1.1 2.4-1.7c.5-.3 1.1-.2 1.5.3.4.5.4 1.1-.1 1.6-1.1.1-1.7.4-1.7 1.2 0 .8.5 1.5 1.4 1.9z" clipRule="evenodd" /></svg>
                           <span>{post.likesCount}</span>
                         </button>
                         <button onClick={() => /* comment functionality would go here */} className="flex items-center gap-1 text-zinc-400 hover:text-zinc-300 transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M5 4a3 3 0 013-3h6a3 3 0 013-3v8a3 3 0 013-3h-6a3 3 0 013-3V4zm0 2a1 1 0 1000 2h6a1 1 0 1000 0-2H5zm6 11a1 1 0 1000 0 2h6a1 1 0 1000 0-2h-6zm2-9a1 1 0 1000 0 2h2a1 1 0 1000 0-2h-2z" clipRule="evenodd" /></svg>
                           <span>{post.commentsCount}</span>
                         </button>
                         <span className="ml-auto text-zinc-500">#{post.id}</span>
                       </div>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           )}
           
           {/* Live Broadcasts Section */}
           {tournament.status === 'ONGOING' && (
             <div className="glass-card rounded-xl p-5 border border-violet-500/20">
               <h3 className="mb-3 text-lg font-semibold text-indigo-300">Transmissão ao Vivo</h3>
               <div className="space-y-4">
                 {/* This would be where you embed the live stream */}
                 <div className="aspect-w-16 aspect-h-9 bg-gray-800 rounded-lg overflow-hidden">
                   <div className="flex items-center justify-center h-full text-zinc-400">
                     Transmissão ao vivo em andamento...
                     {/* In a real implementation, you'd embed a video player here */}
                   </div>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-zinc-400">
                   <div className="flex items-center gap-2">
                     <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                     <span>AO VIVO</span>
                   </div>
                   <span>Assistindo: {tournament.participants?.length || 0} participantes</span>
                 </div>
               </div>
             </div>
           )}
           
           {/* Past Matches Section */}
           {tournament.status === 'FINISHED' && (
             <div className="glass-card rounded-xl p-5 border border-violet-500/20">
               <h3 className="mb-5 text-lg font-semibold text-indigo-300">Partidas Anteriores</h3>
               {tournament.brackets && tournament.brackets.length > 0 ? (
                 <div className="space-y-6">
                   {tournament.brackets.map((bracket) => (
                     <div key={bracket.id} className="space-y-4">
                       <div className="flex items-center justify-between gap-3 rounded-3xl border border-violet-500/10 bg-slate-950/70 px-4 py-3">
                         <div>
                           <p className="text-sm font-semibold text-indigo-200">
                             {bracket.type === 'SINGLE_ELIMINATION'
                               ? 'Chave de Eliminatórias Simples'
                               : bracket.type === 'DOUBLE_ELIMINATION'
                               ? 'Chave de Eliminatórias Duplas'
                               : bracket.type === 'ROUND_ROBIN'
                               ? 'Todos contra Todos'
                               : 'Sistema Suíço'}
                           </p>
                           <p className="text-xs text-zinc-500">{bracket.matches.length} partidas</p>
                         </div>
                       </div>

                       <div className="grid gap-4 sm:grid-cols-2">
                         {bracket.matches && bracket.matches.length > 0 ? (
                           bracket.matches.map((match) => (
                             <MatchCard key={match.id} match={match} compact className="w-full" />
                           ))
                         ) : (
                           <p className="text-center text-zinc-400 py-4">Nenhuma partida encontrada nesta chave.</p>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-center text-zinc-400 py-4">Nenhum dado de partidas disponível.</p>
               )}
             </div>
           )}
         </div>
       )}
           {!posts.loading && posts.posts.length > 0 && (
             <div className="space-y-4">
               {posts.posts.map((post) => (
                 <div key={post.id} className="glass-card card-hover rounded-xl p-5 border border-violet-500/20">
                   <div className="flex items-start gap-4 mb-3">
                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/30 text-xs font-extrabold text-indigo-300">
                       {post.user?.username?.[0]?.toUpperCase() || "?"}
                     </div>
                     <div className="flex-1 space-y-1">
                       <div className="flex items-center gap-2">
                         <p className="font-semibold text-zinc-200">{post.user?.username || post.userId}</p>
                         <p className="text-xs text-zinc-500">{new Date(post.createdAt).toLocaleString("pt-PT")}</p>
                       </div>
                       <p className="text-zinc-200">{post.content}</p>
                       {post.imageUrl && (
                         <div className="mt-3">
                           <img src={post.imageUrl} alt="Post" className="rounded-lg max-h-48 w-full object-cover" />
                         </div>
                       )}
                       {post.videoUrl && (
                         <div className="mt-3">
                           <video controls className="rounded-lg max-h-48 w-full object-contain">
                             <source src={post.videoUrl} type="video/mp4" />
                             Your browser does not support the video tag.
                           </video>
                         </div>
                       )}
                       <div className="mt-4 flex items-center gap-4 text-sm text-zinc-400">
                         <button onClick={() => posts.likePost(post.id)} className={`flex items-center gap-1 hover:text-indigo-400 transition-colors ${post.isLikedByUser ? "text-indigo-400" : "text-zinc-400"}`}>
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M2 10.3c1.3-.6 3.5-2 5.3-3.6.9-.8 1.8-1.7 2.7-2.5 1-.9 2.5-1.1 3.5-.2.8.9 1.9.9 2.9 0 2.5-2 4.5-4.6 5.6-1.3.5-2.7.8-4.1.8-1.4 0-2.8-.3-4-1.1C1.7 15.1.5 13.1 2 10.3zM13 6.1c-.7-.2-1.4-.1-2 .2-.8.4-1.2 1.1-1.2 2 0 .9.4 1.6 1 2.1l4.1 3.1c.4.3.9.4 1.4.4s1-.1 1.4-.4l4.1-3.1c.6-.5 1-1.2 1-2.1 0-.9-.4-1.6-1-2.1-.8-.3-1.5-.4-2-.2zm0 10.7c-.8.3-1.7.4-2.5.4s-1.7-.1-2.5-.4c-.8-.3-1.4-1-1.4-1.9 0-.8.5-1.5 1.2-1.8L9 12.3l-1.6-1.1c-.7-.5-1-.9-.9-1.4-.1-.4-.1-.8.1-1.1.2-.3.7-.4 1.2-.4l1.6 1.1 2.4-1.7c.5-.3 1.1-.2 1.5.3.4.5.4 1.1-.1 1.6-1.1.1-1.7.4-1.7 1.2 0 .8.5 1.5 1.4 1.9z" clipRule="evenodd" /></svg>
                           <span>{post.likesCount}</span>
                         </button>
                         <button onClick={() => /* comment functionality would go here */} className="flex items-center gap-1 text-zinc-400 hover:text-zinc-300 transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M5 4a3 3 0 013-3h6a3 3 0 013 3v8a3 3 0 01-3 3h-6a3 3 0 01-3-3V4zm0 2a1 1 0 100 2h6a1 1 0 100-2H5zm6 11a1 1 0 100 2h6a1 1 0 100-2h-6zm2-9a1 1 0 100 2h2a1 1 0 100-2h-2z" clipRule="evenodd" /></svg>
                           <span>{post.commentsCount}</span>
                         </button>
                         <span className="ml-auto text-zinc-500">#{post.id}</span>
                       </div>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           )}
         </div>
       )}
       
     </div>
   );
 }