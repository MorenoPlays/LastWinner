"use client";

import type { Game } from "@/lib/types";
import { useState, useEffect, use as reactUse } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { gamesApi } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";
import { useGames } from "@/features/games/useGames";
import { Button } from "@/components/ui/Button";

const inputCls = "w-full rounded-lg border border-violet-500/30 bg-slate-900/60 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-sky-300">{label}</label>
      {children}
    </div>
  );
}

export default function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const router = useRouter();
  const canManage = user?.role === "ADMIN" || user?.role === "ORGANIZER";
  const { update, loading } = useGames();
  const [game, setGame] = useState<Game | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);

  const { id } = reactUse(params);

  useEffect(() => {
    gamesApi.getOne(id).then((data: Game) => {
      setGame(data); setName(data.name); setSlug(data.slug); setCoverUrl(data.coverUrl || "");
    }).catch((err: Error) => setError(err.message)).finally(() => setFetching(false));
  }, [id]);

  if (!canManage) return <p className="p-8 text-center text-red-400">Sem permissão.</p>;
  if (fetching) return <p className="p-8 text-center text-zinc-400">A carregar…</p>;
  if (!game) return <p className="p-8 text-center text-zinc-400">Jogo não encontrado.</p>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    try {
      await update(id, { name, slug, coverUrl: coverUrl || undefined });
      router.push("/games");
    } catch (err) { setError(err instanceof Error ? err.message : "Erro ao atualizar."); }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link href="/games" className="mb-4 inline-block text-sm font-semibold text-violet-400 hover:text-violet-300 hover:underline">← Voltar aos jogos</Link>
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-indigo-300">Editar Jogo</h1>
      {error && <p className="mb-4 rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300 ring-1 ring-red-500/30">{error}</p>}
      <form onSubmit={handleSubmit} className="glass-card card-hover space-y-4 rounded-2xl p-6">
        <Field label="Nome"><input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} /></Field>
        <Field label="Slug"><input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required className={inputCls} /></Field>
        <Field label="URL da capa"><input type="url" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} className={inputCls} /></Field>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading} className="flex-1 rounded-lg py-2.5">{loading ? "A guardar…" : "Guardar"}</Button>
          <Link href="/games"><Button variant="secondary" className="flex-1 rounded-lg py-2.5">Cancelar</Button></Link>
        </div>
      </form>
    </div>
  );
}
