"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/useAuth";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) return null;

  const initial = user.username?.[0]?.toUpperCase() || "?";

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push("/");
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-sm font-extrabold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
        title={user.username}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 space-y-1 rounded-xl border border-violet-500/30 bg-slate-900/95 p-1.5 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl">
          {/* Header */}
          <div className="rounded-lg bg-gradient-to-r from-indigo-600/20 to-purple-600/20 px-3 py-2.5">
            <p className="text-sm font-extrabold text-zinc-100">{user.username}</p>
            <p className="truncate text-xs text-zinc-400">{user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-violet-500/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-300">{user.role}</span>
          </div>

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-violet-500/15 hover:text-violet-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M10 8a3 3 0 100-6 3 3 0 000 6zm-3.707 7.293a1 1 0 00-1.414 1.414L3 17.414l1.293 1.293a1 1 0 001.414-1.414l-2-2a1 1 0 010-1.414l2-2a1 1 0 00-1.414 0l-2 2z" clipRule="evenodd"/></svg>
            Meu Perfil
          </Link>

          <Link
            href="/tournaments"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-violet-500/15 hover:text-violet-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path d="M2 10.5a1.5 1.5 0 113 0v-3A1.5 1.5 0 002 7.5v3zm4.5-.5a1.5 1.5 0 013 0v5a1.5 1.5 0 01-3 0v-5zm5.5 0a1.5 1.5 0 013 0v1.5h-3v-1.5zm1.5-8a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" /><path d="M3 4a1 1 0 00-1 1v1a1 1 0 001 1h3a1 1 0 001-1V5a1 1 0 00-1-1H3zm13 0a1 1 0 00-1 1v1a1 1 0 001 1h3a1 1 0 001-1V5a1 1 0 00-1-1h-3z" /></svg>
            Meus Torneios
          </Link>

          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-violet-500/15 hover:text-violet-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.98a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>
            Definições
          </Link>

          <div className="border-t border-violet-500/15 pt-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/15 hover:text-red-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a3.75 3.75 0 00-3.75-3.75h-5.5A3.75 3.75 0 001 4.25v2a.75.75 0 01-1.5 0v-2zm4.75 6.5a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5zM9.25 10a.75.75 0 01.75-.75h3.75c.966 0 1.75.784 1.75 1.75v4.5A1.75 1.75 0 0113.25 17H10a.75.75 0 01-.75-.75v-6.5z" clipRule="evenodd"/><path d="M12.78 6.22a.75.75 0 010 1.06l-2.25 2.25a.75.75 0 01-1.06 0l-1.25-1.25a.75.75 0 111.06-1.06L10.5 8.56l1.72-1.72a.75.75 0 011.06 0z" /></svg>
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
