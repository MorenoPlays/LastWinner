"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { tournamentsApi, gamesApi } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";
import { useTournaments } from "@/features/tournaments/useTournaments";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import type { Tournament } from "@/lib/types";
import { CURRENCY_MAP } from "@/lib/types";
import { Button } from "@/components/ui/Button";
/* eslint-disable @next/next/no-img-element */

const FORMAT_OPTIONS = [{ value: "SINGLE_ELIMINATION", label: "Eliminatória simples" }, { value: "DOUBLE_ELIMINATION", label: "Eliminatória dupla" }, { value: "ROUND_ROBIN", label: "Todos contra todos" }, { value: "SWISS", label: "Sistema suíço" }];
const MODE_OPTIONS = [{ value: "ONLINE", label: "Online" }, { value: "PRESENTIAL", label: "Presencial" }];
const CURRENCY_OPTIONS = [{ value: "KZ", label: "Kz – Kwanza" }, { value: "USD", label: "$ – Dólar" }, { value: "EUR", label: "€ – Euro" }, { value: "BRL", label: "R$ – Real" }];

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

export default function NewTournamentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { create } = useTournaments();
  const fileRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [gameId, setGameId] = useState("");
  const [format, setFormat] = useState("SINGLE_ELIMINATION");
  const [mode, setMode] = useState("ONLINE");
  const [maxPlayers, setMaxPlayers] = useState(16);
  const [entryFee, setEntryFee] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [prizePool, setPrizePool] = useState(0);
  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [games, setGames] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoadingState] = useState(false);

  useEffect(() => { gamesApi.getAll().then(setGames).catch(console.error); }, []);

  if (!user) return <p className="p-8 text-center text-red-400">Não tem permissão para criar torneios.</p>;

  const handleBannerFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    const reader = new FileReader();
    reader.onload = () => setBannerPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingState(true);
    setError("");
    try {
      let finalBannerUrl = bannerUrl;

      if (bannerFile) {
        try {
          const uploadedImage = await uploadImageToCloudinary(bannerFile);
          finalBannerUrl = uploadedImage.secure_url;
        } catch (uploadError: any) {
          throw new Error(`Erro ao enviar banner: ${uploadError.message}`);
        }
      }

      await create({ organizerId: user!.id, title, description: description || undefined, gameId, format, mode, maxPlayers, entryFee: entryFee || undefined, currency, prizePool: prizePool || undefined, bannerUrl: finalBannerUrl || undefined });
      router.push("/tournaments");
    } catch (err) { setError(err instanceof Error ? err.message : "Erro ao criar torneio."); }
    finally { setLoadingState(false); }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/tournaments" className="mb-4 inline-block text-sm font-semibold text-violet-400 hover:text-violet-300 hover:underline">← Voltar aos torneios</Link>
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-indigo-300">Novo Torneio</h1>
      {error && <p className="mb-4 rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300 ring-1 ring-red-500/30">{error}</p>}
      <form onSubmit={handleSubmit} className="glass-card card-hover space-y-4 rounded-2xl p-6">
        <Field label="Título"><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputCls} placeholder="Nome do torneio" disabled={loading} /></Field>
        <Field label="Descrição"><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputCls} placeholder="Descreva o torneio..." disabled={loading} /></Field>
        <Field label="Jogo"><select value={gameId} onChange={(e) => setGameId(e.target.value)} required className={selectCls} disabled={loading}><option value="">Seleciona um jogo</option>{games.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Formato"><select value={format} onChange={(e) => setFormat(e.target.value)} className={selectCls} disabled={loading}>{FORMAT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>
          <Field label="Modo"><select value={mode} onChange={(e) => setMode(e.target.value)} className={selectCls} disabled={loading}>{MODE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Jogadores máx."><input type="number" value={maxPlayers} onChange={(e) => setMaxPlayers(Number(e.target.value))} min={2} required className={inputCls} disabled={loading} /></Field>
          <Field label={`Inscrição ${CURRENCY_MAP[currency as keyof typeof CURRENCY_MAP]?.symbol || "$"}`}><input type="number" value={entryFee} onChange={(e) => setEntryFee(Number(e.target.value))} min={0} className={inputCls} disabled={loading} /></Field>
          <Field label="Moeda"><select value={currency} onChange={(e) => setCurrency(e.target.value)} className={selectCls} disabled={loading}>{CURRENCY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>
          <Field label={`Prémio ${CURRENCY_MAP[currency as keyof typeof CURRENCY_MAP]?.symbol || "$"}`}><input type="number" value={prizePool} onChange={(e) => setPrizePool(Number(e.target.value))} min={0} className={inputCls} disabled={loading} /></Field>
        </div>
        
        <Field label="Banner do torneio (opcional)">
          <div className="space-y-2">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <input type="url" value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} className={inputCls} placeholder="https://..." disabled={loading} />
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={loading}
                className="rounded-lg border border-violet-500/30 px-3 py-2.5 text-xs font-semibold text-violet-300 transition-colors hover:bg-violet-500/15 disabled:opacity-50 whitespace-nowrap"
              >
                📁 Upload
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleBannerFile} disabled={loading} />
            </div>
            
            {bannerPreview && (
              <div className="relative overflow-hidden rounded-lg border border-violet-500/20 bg-slate-800/50">
                <img src={bannerPreview} alt="Pré-visualização" className="h-32 w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                  <span className="text-sm font-bold text-white">✓ {bannerFile?.name}</span>
                </div>
              </div>
            )}
            <p className="text-xs text-zinc-400">A imagem será enviada ao Cloudinary quando clicar em "Criar Torneio"</p>
          </div>
        </Field>
        
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading} className="flex-1 rounded-lg py-2.5">{loading ? "A criar…" : "Criar Torneio"}</Button>
          <Link href="/tournaments"><Button variant="secondary" className="flex-1 rounded-lg py-2.5" disabled={loading}>Cancelar</Button></Link>
        </div>
      </form>
    </div>
  );
}
