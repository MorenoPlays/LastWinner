"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/features/auth/useAuth";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login.");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4">
      <div className="glass-card card-hover w-full max-w-md space-y-7 rounded-2xl px-8 py-10">
        {/* Logo */}
        <div className="flex justify-center">
          <img src="/nav-logo1.png" alt="LastWinner" className="h-10 w-auto" />
        </div>

        <h1 className="text-center text-2xl font-extrabold tracking-tight text-indigo-300">Sign In</h1>

        {error && (
          <p className="rounded-lg bg-red-900/40 px-4 py-3 text-center text-sm text-red-300 ring-1 ring-red-500/30">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-sky-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-violet-500/30 bg-slate-900/60 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40"
              placeholder="email@exemplo.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-sky-300">Palavra-passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-violet-500/30 bg-slate-900/60 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40"
              placeholder="mínimo 6 caracteres"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-lg py-2.5 text-sm font-semibold tracking-wide">
            {loading ? "A entrar…" : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-400">
          Não tem conta?{" "}
          <Link href="/register" className="font-semibold text-violet-400 hover:text-violet-300 hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
