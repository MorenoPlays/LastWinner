"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/features/auth/useAuth";
import UserMenu from "@/components/UserMenu";
const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/games", label: "Jogos" },
  { href: "/tournaments", label: "Torneios" },
  { href: "/players", label: "Jogadores" },
];

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-4 z-50 w-full">
      <div className="relative mx-auto flex h-12 w-full max-w-6xl items-center justify-between px-4">
        {/* Logo — absolute left */}
        <Link href="/" className="absolute left-4 flex items-center transition-transform hover:scale-105">
          <Image src="/nav-logo1.png" alt="LastWinner" width={140} height={42} className="h-9 w-auto" priority />
        </Link>

        {/* Nav pill — perfectly centered */}
        <nav className="absolute left-1/2 -translate-x-1/2 glass-card flex items-center rounded-full px-2 py-1.5 backdrop-blur-md">
          {NAV.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-300 transition-all hover:bg-indigo-500/30 hover:text-indigo-300"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right side — messages and auth */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {user && (
            <Link
              href="/messages"
              title="Mensagens"
              className="rounded-full p-2 text-sm font-semibold text-violet-300 transition-colors hover:bg-violet-500/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
            </Link>
          )}
          
          {user ? (
            <UserMenu />
          ) : (
            <Link href="/register" title="Criar conta">
              <button className="rounded-full p-2 text-sm font-semibold text-violet-300 transition-colors hover:bg-violet-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z"/></svg>
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
