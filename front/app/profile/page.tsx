"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/useAuth";
import { adminUsersApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
/* eslint-disable @next/next/no-img-element */

export default function ProfilePage() {
  const { user, loading: authLoading, refresh } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"profile" | "stats" | "admin">("profile");

  // Admin panel state
  const [allUsers, setAllUsers] = useState<Array<{ id: string; username: string; email: string; role: string }>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  // Load all users when admin tab is selected
  useEffect(() => {
    if (tab === "admin" && user?.role === "ADMIN") {
      setLoadingUsers(true);
      adminUsersApi.getAll()
        .then((users: any[]) => setAllUsers(users))
        .catch(console.error)
        .finally(() => setLoadingUsers(false));
    }
  }, [tab, user?.role]);

  if (authLoading) return <p className="p-8 text-center text-zinc-400">A carregar…</p>;
  if (!user) return null;

  const isAdmin = user.role === "ADMIN";

  const handleChangeRole = async (userId: string, newRole: string) => {
    setChangingRole(userId);
    try {
      await adminUsersApi.updateRole(userId, newRole);
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      if (userId === user.id) await refresh();
    } catch (err: any) {
      alert(err.message || "Erro ao alterar função.");
    } finally {
      setChangingRole(null);
    }
  };

  const roleOptions = ["USER", "ORGANIZER", "ADMIN"] as const;

  const initial = user.username?.[0]?.toUpperCase() || "?";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="mb-4 inline-block text-sm font-semibold text-violet-400 hover:text-violet-300 hover:underline">← Voltar</Link>

      {/* Profile header card */}
      <div className="glass-card card-hover mb-6 overflow-hidden rounded-2xl">
        <div className="relative h-28 bg-gradient-to-r from-indigo-700/40 via-violet-700/40 to-indigo-700/40" />
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="-mt-10 mb-3 flex items-end gap-4">
            <div className="relative h-20 w-20 shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} className="rounded-2xl object-cover ring-4 ring-slate-900 h-20 w-20" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-3xl font-extrabold text-white shadow-lg shadow-indigo-500/40 ring-4 ring-slate-900">
                  {initial}
                </div>
              )}
            </div>
            <div className="mb-1">
              <h1 className="text-xl font-extrabold tracking-tight text-zinc-100">{user.username}</h1>
              <p className="text-sm text-zinc-400">{user.email}</p>
            </div>
            <span className="ml-auto mb-2 rounded-full bg-violet-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-300">
              {user.role}
            </span>
          </div>

          {/* Stats row */}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-zinc-400">
            <div className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-amber-400"><path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" /></svg>
              <span className="font-semibold text-zinc-200">{user.elo}</span> <span>ELO</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-green-400">{user.wins}</span> Win
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-red-400">{user.losses}</span> Loss
            </div>
            {user.isVerified && (
              <span className="flex items-center gap-1 rounded-full bg-sky-500/20 px-2 py-0.5 text-xs font-semibold text-sky-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3"><path fillRule="evenodd" d="M16.707 5.293a1.5 1.5 0 010 2.121l-8 8a1.5 1.5 0 01-2.121 0l-4-4a1.5 1.5 0 012.121-2.121l3.314 3.314 7.586-7.586a1.5 1.5 0 012.121 0z" clipRule="evenodd" /></svg>
                Verificado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b border-violet-500/20">
        <div className="flex gap-6">
          {(["profile", "stats", ...(isAdmin ? ["admin" as const] : [])] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`relative pb-3 text-sm font-semibold transition-colors ${tab === t ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"}`}>
              {t === "profile" ? "Perfil" : t === "stats" ? "Estatísticas" : "Administração"}
              {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {tab === "profile" && (
        <div className="glass-card card-hover space-y-4 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-indigo-300">Informações Pessoais</h2>
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">Username</dt>
              <dd className="font-semibold text-zinc-200">{user.username}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Email</dt>
              <dd className="font-semibold text-zinc-200">{user.email}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Função</dt>
              <dd className="font-semibold text-zinc-200">{user.role}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">País</dt>
              <dd className="font-semibold text-zinc-200">{user.country || "—"}</dd>
            </div>
            {user.bio && (
              <div className="sm:col-span-2">
                <dt className="text-zinc-500">Bio</dt>
                <dd className="font-semibold text-zinc-200">{user.bio}</dd>
              </div>
            )}
            <div>
              <dt className="text-zinc-500">Criado em</dt>
              <dd className="font-semibold text-zinc-200">{new Date(user.createdAt).toLocaleDateString("pt-PT")}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Atualizado em</dt>
              <dd className="font-semibold text-zinc-200">{new Date(user.updatedAt).toLocaleDateString("pt-PT")}</dd>
            </div>
          </dl>
        </div>
      )}

      {tab === "stats" && (
        <div className="glass-card card-hover space-y-4 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-indigo-300">Estatísticas</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-indigo-500/10 p-4 text-center ring-1 ring-indigo-500/20">
              <p className="text-2xl font-extrabold text-indigo-400">{user.elo}</p>
              <p className="text-xs text-zinc-500">ELO Rating</p>
            </div>
            <div className="rounded-xl bg-green-500/10 p-4 text-center ring-1 ring-green-500/20">
              <p className="text-2xl font-extrabold text-green-400">{user.wins}</p>
              <p className="text-xs text-zinc-500">Vitórias</p>
            </div>
            <div className="rounded-xl bg-red-500/10 p-4 text-center ring-1 ring-red-500/20">
              <p className="text-2xl font-extrabold text-red-400">{user.losses}</p>
              <p className="text-xs text-zinc-500">Derrotas</p>
            </div>
            <div className="rounded-xl bg-amber-500/10 p-4 text-center ring-1 ring-amber-500/20">
              <p className="text-2xl font-extrabold text-amber-400">{user.wins + user.losses > 0 ? ((user.wins / (user.wins + user.losses)) * 100).toFixed(0) : 0}%</p>
              <p className="text-xs text-zinc-500">Win Rate</p>
            </div>
          </div>
        </div>
      )}

      {tab === "admin" && isAdmin && (
        <div className="glass-card card-hover space-y-4 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-indigo-300">Gerir Utilizadores</h2>
          <p className="text-sm text-zinc-400">Altere a função de qualquer utilizador para <span className="font-semibold text-violet-300">USER</span>, <span className="font-semibold text-green-300">ORGANIZER</span> ou <span className="font-semibold text-red-300">ADMIN</span>.</p>

          {loadingUsers ? (
            <p className="text-sm text-zinc-400">A carregar utilizadores…</p>
          ) : (
            <div className="space-y-3">
              {allUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-4 rounded-xl bg-slate-800/50 px-4 py-3 text-sm"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-base font-extrabold text-white">
                    {u.username?.[0]?.toUpperCase() || "?"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-100 truncate">{u.username}</p>
                    <p className="text-xs text-zinc-500 truncate">{u.email}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                      u.role === "ADMIN"
                        ? "bg-red-500/30 text-red-300"
                        : u.role === "ORGANIZER"
                        ? "bg-green-500/30 text-green-300"
                        : "bg-zinc-500/30 text-zinc-300"
                    }`}
                  >
                    {u.role}
                  </span>
                  <div className="flex shrink-0 gap-2">
                    {roleOptions
                      .filter((r) => r !== u.role)
                      .map((r) => (
                        <button
                          key={r}
                          disabled={changingRole === u.id}
                          onClick={() => handleChangeRole(u.id, r)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                            r === "ADMIN"
                              ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                              : r === "ORGANIZER"
                              ? "bg-green-500/20 text-green-300 hover:bg-green-500/30"
                              : "bg-zinc-500/20 text-zinc-300 hover:bg-zinc-500/30"
                          } disabled:opacity-40`}
                        >
                          {changingRole === u.id ? "…" : r}
                        </button>
                      ))}
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
