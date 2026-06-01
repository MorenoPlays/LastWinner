"use client"

import Link from "next/link";
import Image from "next/image";
import type { Tournament, Game, Post, User } from "@/lib/types";
import { formatCurrency } from "@/lib/types";
import { usePosts } from "@/features/posts/usePosts";
import { useUsers } from "@/features/users/useUsers";
import { useTournaments } from "@/features/tournaments/useTournaments";
import { useGames } from "@/features/games/useGames";
import { useState, useEffect } from "react";

function GameFallback({ src, alt }: { src?: string; alt: string }) {
  if (src) return <img src={src} alt={alt} className="h-40 w-full rounded-lg object-cover" />;
  return (
    <div className="flex h-40 w-full items-center justify-center rounded-lg bg-slate-800">
      <span className="text-3xl font-extrabold text-slate-700">🎮</span>
    </div>
  );
}

const FORMAT_MAP: Record<string, string> = { SINGLE_ELIMINATION: "Eliminatória simples", DOUBLE_ELIMINATION: "Eliminatória dupla", ROUND_ROBIN: "Todos contra todos", SWISS: "Sistema suíço" };
const STATUS_COLOR: Record<string, string> = { DRAFT: "bg-slate-700/60 text-zinc-300", OPEN: "bg-green-500/30 text-green-300", ONGOING: "bg-sky-500/30 text-sky-300", FINISHED: "bg-amber-500/30 text-amber-300", CANCELED: "bg-red-500/30 text-red-300" };

export default function HomePage() {
  const { tournaments: tournamentsData, loading: tournamentsLoading, error: tournamentsError } = useTournaments();
  const { games: gamesData, loading: gamesLoading, error: gamesError } = useGames();
  const { users: featuredUsers, loading: usersLoading, error: usersError } = useUsers();
  const { posts: recentPosts, loading: postsLoading, error: postsError } = usePosts();

  // We'll use useEffect to fetch data for our hooks
  useEffect(() => {
    // The hooks will fetch data automatically
  }, []);

  const tournaments = tournamentsData || [];
  const games = gamesData || [];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* ── Hero Simplificado ─────────────────────────────────── */}
      <div className="bg-linear-to-b from-violet-500/10 to-transparent px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-300">LastWinner</h1>
          <p className="mt-2 text-sm sm:text-base text-sky-400">A sua plataforma de torneios e competições</p>
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* ── Torneios - SEÇÃO PRINCIPAL ────────────────────────── */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-indigo-300">🏆 Torneios</h2>
            <Link href="/tournaments" className="text-xs sm:text-sm text-violet-400 hover:text-violet-300 transition-colors">Ver todos →</Link>
          </div>
          
          {tournaments.length === 0 ? (
            <div className="glass-card rounded-xl p-6 sm:p-8 text-center border border-violet-500/20">
              <p className="text-sm sm:text-base font-semibold text-zinc-300 mb-1">Nenhum torneio criado ainda.</p>
              <p className="text-xs sm:text-sm text-zinc-400 mb-4">Crie um torneio para começar.</p>
              <Link href="/tournaments/new" className="inline-block bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg text-sm font-semibold">Criar Torneio</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tournaments.slice(0, 6).map((t) => (
                <Link key={t.id} href={`/tournaments/${t.id}`} className="glass-card flex flex-col rounded-xl overflow-hidden hover:border-violet-400/60 transition-all border border-violet-500/20">
                  {t.bannerUrl ? (
                    <Image src={t.bannerUrl} alt={t.title} width={600} height={300} className="h-32 sm:h-40 w-full object-cover" unoptimized />
                  ) : (
                    <div className="h-32 sm:h-40 w-full bg-slate-800 flex items-center justify-center">
                      <span className="text-3xl">🎮</span>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-sky-300 line-clamp-2">{t.title}</h3>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[t.status] || STATUS_COLOR.DRAFT}`}>{t.status}</span>
                    </div>
                    {t.description && <p className="line-clamp-1 text-xs text-zinc-400 mb-3">{t.description}</p>}
                    <div className="flex flex-wrap gap-1 text-xs">
                      <span className="rounded bg-indigo-500/20 px-2 py-1 text-indigo-300">{FORMAT_MAP[t.format] || t.format}</span>
                      <span className="rounded bg-green-500/20 px-2 py-1 text-green-300">{t.maxPlayers} 👥</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Jogos ─────────────────────────────────────────────── */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-indigo-300">🎮 Jogos</h2>
            <Link href="/games" className="text-xs sm:text-sm text-violet-400 hover:text-violet-300 transition-colors">Ver todos →</Link>
          </div>

          {games.length === 0 ? (
            <div className="glass-card rounded-xl p-6 sm:p-8 text-center border border-violet-500/20">
              <p className="text-sm sm:text-base font-semibold text-zinc-300 mb-1">Nenhum jogo registado.</p>
              <p className="text-xs sm:text-sm text-zinc-400">Adicione um jogo para começar a criar torneios.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {games.map((g) => (
                <Link key={g.id} href={`/games/${g.id}`} className="glass-card flex flex-col rounded-lg overflow-hidden hover:border-violet-400/60 transition-all border border-violet-500/20">
                  <GameFallback src={g.coverUrl} alt={g.name} />
                  <div className="p-2 sm:p-3">
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-100 line-clamp-1">{g.name}</h3>
                    <p className="text-xs text-zinc-500 font-mono">{g.slug}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Community Sections  ──────────────────────────────── */}
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-indigo-300 mb-4">👥 Comunidade</h2>
          
          {/* Recent Posts */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-sky-300 mb-4">Posts Recentes</h3>
            {postsLoading && <p className="text-center py-6 text-zinc-400">A carregar posts...</p>}
            {postsError && <p className="text-center text-red-400">Erro ao carregar posts: {postsError}</p>}
            {recentPosts.length === 0 && !postsLoading && !postsError && (
              <p className="text-center py-6 text-zinc-400">Ainda não há posts na comunidade. Seja o primeiro a publicar!</p>
            )}
            {!postsLoading && recentPosts.length > 0 && (
              <div className="space-y-4">
                {recentPosts.slice(0, 3).map((post) => (
                  <div key={post.id} className="glass-card rounded-xl p-4 border border-violet-500/20">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/30 text-xs font-extrabold text-indigo-300">
                        {post.user?.username?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-zinc-200">{post.user?.username || post.userId}</p>
                          <p className="text-xs text-zinc-500">{new Date(post.createdAt).toLocaleString("pt-PT")}</p>
                        </div>
                        <p className="text-zinc-200 line-clamp-2">{post.content}</p>
                        {post.imageUrl && (
                          <div className="mt-2">
                            <img src={post.imageUrl} alt="Post" className="rounded-lg max-h-36 w-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-sm text-zinc-400">
                      <button className="flex items-center gap-1 hover:text-indigo-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M2 10.3c1.3-.6 3.5-2 5.3-3.6.9-.8 1.8-1.7 2.7-2.5 1-.9 2.5-1.1 3.5-.2.8.9 1.9.9 2.9 0 2.5-2 4.5-4.6 5.6-1.3.5-2.7.8-4.1.8-1.4 0-2.8-.3-4-1.1C1.7 15.1.5 13.1 2 10.3zM13 6.1c-.7-.2-1.4-.1-2 .2-.8.4-1.2 1.1-1.2 2 0 .9.4 1.6 1 2.1l4.1 3.1c.4.3.9.4 1.4.4s1-.1 1.4-.4l4.1-3.1c.6-.5 1-1.2 1-2.1 0-.9-.4-1.6-1-2.1-.8-.3-1.5-.4-2-.2zm0 10.7c-.8.3-1.7.4-2.5.4s-1.7-.1-2.5-.4c-.8-.3-1.4-1-1.4-1.9 0-.8.5-1.5 1.2-1.8L9 12.3l-1.6-1.1c-.7-.5-1-.9-.9-1.4-.1-.4-.1-.8.1-1.1.2-.3.7-.4 1.2-.4l1.6 1.1 2.4-1.7c.5-.3 1.1-.2 1.5.3.4.5.4 1.1-.1 1.6-1.1.1-1.7.4-1.7 1.2 0 .8.5 1.5 1.4 1.9z" clipRule="evenodd" /></svg>
                        <span>{post.likesCount}</span>
                      </button>
                      <span className="ml-auto">#{post.id}</span>
                    </div>
                  </div>
                ))}
                <div className="mt-4 text-center">
                  <Link href="/posts" className="text-sm text-indigo-400 hover:text-indigo-300 underline">
                    Ver todos os posts →
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Featured Players */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-sky-300 mb-4">Jogadores em Destaque</h3>
            {usersLoading && <p className="text-center py-6 text-zinc-400">A carregar jogadores...</p>}
            {usersError && <p className="text-center text-red-400">Erro ao carregar jogadores: {usersError}</p>}
            {featuredUsers.length === 0 && !usersLoading && !usersError && (
              <p className="text-center py-6 text-zinc-400">Ainda não há jogadores registados.</p>
            )}
            {!usersLoading && featuredUsers.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredUsers.map((user) => (
                  <div key={user.id} className="glass-card rounded-xl p-4 text-center border border-violet-500/20">
                    <div className="flex items-center justify-center mb-3">
                      {user.avatarUrl ? (
                        <Image src={user.avatarUrl} alt={user.username} width={60} height={60} className="rounded-full" unoptimized />
                      ) : (
                        <div className="h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-extrabold text-white">
                          {user.username?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-zinc-200 mb-1">{user.username}</h4>
                    <p className="text-sm text-zinc-400 mb-2">
                      <span className="font-medium">ELO:</span> <span className="text-indigo-300">{user.elo}</span>
                    </p>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 text-green-400"><path fillRule="evenodd" d="M16.707 5.293a1.5 1.5 0 010 2.121l-8 8a1.5 1.5 0 01-2.121 0l-4-4a1.5 1.5 0 012.121-2.121l3.314 3.314 7.586-7.586a1.5 1.5 0 012.121 0z" clipRule="evenodd" /></svg>
                        <span>{user.wins}</span>
                      </span>
                      <span className="mx-2">|</span>
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 text-red-400"><path fillRule="evenodd" d="M12.293 5.293a1.5 1.5 0 012.121 0l3.614 3.614a1.5 1.5 0 01-2.121 2.121-.414.414-.707-.121-1.06-.504l-.708-.708a1.5 1.5 0 011.06-.504l3.614-3.614a1.5 1.5 0 012.121 0l1.414 1.414a1.5 1.5 0 01-2.121-2.121zM5.293 12.293a1.5 1.5 0 01-2.121 0l-3.614 3.614a1.5 1.5 0 012.121-2.121.414.414.707.121 1.06.504l.708.708a1.5 1.5 0 00-1.06.504l-3.614-3.614a1.5 1.5 0 00-2.121-2.121z" clipRule="evenodd" /></svg>
                        <span>{user.losses}</span>
                      </span>
                    </div>
                    {user.isVerified && (
                      <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 me-1"><path fillRule="evenodd" d="M16.707 5.293a1.5 1.5 0 010 2.121l-8 8a1.5 1.5 0 01-2.121 0l-4-4a1.5 1.5 0 012.121-2.121l3.314 3.314 7.586-7.586a1.5 1.5 0 012.121 0z" clipRule="evenodd" /></svg>
                        Verificado
                      </span>
                    )}
                    <Link href={`/profile/${user.id}`} className="mt-3 block text-sm text-indigo-400 hover:text-indigo-300">
                      Ver perfil
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Community Stats */}
          <div className="glass-card rounded-xl p-6 border border-violet-500/20">
            <h3 className="font-bold text-lg text-sky-300 mb-4">Estatísticas da Comunidade</h3>
            <div className="space-y-3 text-sm text-zinc-300">
              <div className="flex justify-between">
                <span>Posts na Comunidade:</span>
                <span className="text-indigo-400 font-semibold">{recentPosts.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Jogadores Ativos:</span>
                <span className="text-violet-400 font-semibold">{featuredUsers.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Torneios Ativos:</span>
                <span className="text-green-400 font-semibold">{tournaments.filter(t => t.status === 'ONGOING' || t.status === 'OPEN').length}</span>
              </div>
            </div>
          </div>
        </section>

         {/* ── CTA Section ──────────────────────────────────────── */}
        {tournaments.length > 0 && (
          <section className="mb-12 glass-card rounded-xl p-8 border border-violet-500/20 text-center">
            <h3 className="text-2xl font-bold text-indigo-300 mb-2">Pronto para competir?</h3>
            <p className="text-zinc-400 mb-6">Participa num torneio ou cria o teu próprio</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/tournaments" className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg font-semibold transition-colors">Explorar Torneios</Link>
              <Link href="/tournaments/new" className="bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-lg font-semibold transition-colors">Criar Torneio</Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
