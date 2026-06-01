"use client"

import Link from "next/link";
import type { User } from "@/lib/types";
import { useUsers } from "@/features/users/useUsers";
import { useAuth } from "@/features/auth/useAuth";
import { useState } from "react";

export default function PlayersPage() {
  const { users: allUsers, loading, error, loadUsers } = useUsers();
  const [searchQuery, setSearchQuery] = useState("");
//   const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Filter users based on search query
  // In a real implementation, this would be done server-side
  // For now, we'll do it client-side
  // useEffect(() => {
  //   if (!searchQuery) {
  //     setFilteredUsers(allUsers);
  //   } else {
  //     const filtered = allUsers.filter(user =>
  //       user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       user.email.toLowerCase().includes(searchQuery.toLowerCase())
  //     );
  //     setFilteredUsers(filtered);
  //   }
  // }, [allUsers, searchQuery]);

  // For simplicity, we'll just show all users for now
  // and implement search in a future update

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <Link href="/" className="mb-6 inline-block text-sm font-semibold text-violet-400 hover:text-violet-300">
        ← Voltar ao início
      </Link>
      
      <h1 className="mb-6 text-2xl font-extrabold text-indigo-300">Jogadores da Comunidade</h1>
      
      {/* Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Pesquisar jogadores por nome ou email..."
          className="flex-1 rounded-lg border border-violet-500/30 bg-slate-900/60 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-400"
        />
        <button onClick={() => { /* trigger search */ }} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
          Pesquisar
        </button>
      </div>
      
      {/* Users List */}
      {loading && <p className="text-center py-12 text-zinc-400">A carregar jogadores...</p>}
      {error && <p className="text-center text-red-400">Erro ao carregar jogadores: {error}</p>}
      {allUsers.length === 0 && !loading && !error && (
        <p className="text-center py-12 text-zinc-400">Ainda não há jogadores registados.</p>
      )}
      {!loading && allUsers.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allUsers.map((user) => (
            <Link key={user.id} href={`/profile/${user.id}`} className="glass-card rounded-xl p-5 hover:-translate-y-1 transition-transform border border-violet-500/20">
              <div className="flex items-center justify-center mb-4">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.username} className="h-16 w-16 rounded-full ring-4 ring-indigo-500/20" />
                ) : (
                  <div className="h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-extrabold text-white ring-4 ring-indigo-500/20">
                    {user.username?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <h3 className="mb-2 text-base font-bold text-zinc-200">{user.username}</h3>
              <p className="mb-2 text-xs text-zinc-500">{user.email}</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 text-indigo-400 me-1"><path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" /></svg>
                  <span className="font-medium text-zinc-200">ELO: {user.elo}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 text-green-400"><path fillRule="evenodd" d="M16.707 5.293a1.5 1.5 0 010 2.121l-8 8a1.5 1.5 0 01-2.121 0l-4-4a1.5 1.5 0 012.121-2.121l3.314 3.314 7.586-7.586a1.5 1.5 0 012.121 0z" clipRule="evenodd" /></svg>
                    <span>{user.wins}</span>
                  </span>
                  <span className="mx-2">|</span>
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 text-red-400"><path fillRule="evenodd" d="M12.293 5.293a1.5 1.5 0 012.121 0l3.614 3.614a1.5 1.5 0 01-2.121 2.121-.414.414-.707-.121-1.06-.504l-.708-.708a1.5 1.5 0 001.06-.504l3.614-3.614a1.5 1.5 0 011.06-.504l3.614-3.614a1.5 1.5 0 012.121 0l1.414 1.414a1.5 1.5 0 01-2.121-2.121zM5.293 12.293a1.5 1.5 0 01-2.121 0l-3.614 3.614a1.5 1.5 0 012.121-2.121.414.414.707.121 1.06.504l.708.708a1.5 1.5 0 00-1.06.504l-3.614-3.614a1.5 1.5 0 00-2.121-2.121z" clipRule="evenodd" /></svg>
                    <span>{user.losses}</span>
                  </span>
                </div>
                {user.isVerified && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 me-1"><path fillRule="evenodd" d="M16.707 5.293a1.5 1.5 0 010 2.121l-8 8a1.5 1.5 0 01-2.121 0l-4-4a1.5 1.5 0 012.121-2.121l3.314 3.314 7.586-7.586a1.5 1.5 0 012.121 0z" clipRule="evenodd" /></svg>
                    Verificado
                  </span>
                )}
                {user.bio && (
                  <p className="mt-2 text-xs text-zinc-400 line-clamp-2">{user.bio}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {/* Load More Button */}
      {allUsers.length > 0 && (
        <div className="mt-8 text-center">
          <button onClick={() => { /* load more users */ }} className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
            Carregar mais jogadores
          </button>
        </div>
      )}
    </div>
  );
}