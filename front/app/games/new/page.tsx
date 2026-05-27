"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/useAuth";
import { useGames } from "@/features/games/useGames";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { Button } from "@/components/ui/Button";
/* eslint-disable @next/next/no-img-element */

const inputCls = "w-full rounded-lg border border-violet-500/30 bg-slate-900/60 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-sky-300">{label}</label>
      {children}
    </div>
  );
}

export default function NewGamePage() {
  const { user } = useAuth();
  const router = useRouter();
  const canManage = user?.role === "ADMIN";
  const { create, loading } = useGames();
  const fileRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!canManage) return <p className="p-8 text-center text-red-400">Não tem permissão para criar jogos.</p>;

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      let finalCoverUrl = coverUrl;

      if (coverFile) {
        try {
          const uploadedImage = await uploadImageToCloudinary(coverFile);
          finalCoverUrl = uploadedImage.secure_url;
        } catch (uploadError: any) {
          throw new Error(`Erro ao enviar capa: ${uploadError.message}`);
        }
      }

      await create({ name, slug, coverUrl: finalCoverUrl || undefined });
      router.push("/games");
    } catch (err) { 
      setError(err instanceof Error ? err.message : "Erro ao criar jogo."); 
    } finally { 
      setSubmitting(false); 
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link href="/games" className="mb-4 inline-block text-sm font-semibold text-violet-400 hover:text-violet-300 hover:underline">← Voltar aos jogos</Link>
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-indigo-300">Novo Jogo</h1>
      {error && <p className="mb-4 rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300 ring-1 ring-red-500/30">{error}</p>}
      <form onSubmit={handleSubmit} className="glass-card card-hover space-y-4 rounded-2xl p-6">
        <Field label="Nome"><input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} placeholder="Nome do jogo" disabled={submitting} /></Field>
        <Field label="Slug"><input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required className={inputCls} placeholder="nome-do-jogo" disabled={submitting} /></Field>
        
        <Field label="Capa do jogo (opcional)">
          <div className="space-y-2">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <input type="url" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} className={inputCls} placeholder="https://..." disabled={submitting} />
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={submitting}
                className="rounded-lg border border-violet-500/30 px-3 py-2.5 text-xs font-semibold text-violet-300 transition-colors hover:bg-violet-500/15 disabled:opacity-50 whitespace-nowrap"
              >
                📁 Upload
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFile} disabled={submitting} />
            </div>
            
            {coverPreview && (
              <div className="relative overflow-hidden rounded-lg border border-violet-500/20 bg-slate-800/50">
                <img src={coverPreview} alt="Pré-visualização" className="h-32 w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                  <span className="text-sm font-bold text-white">✓ {coverFile?.name}</span>
                </div>
              </div>
            )}
            <p className="text-xs text-zinc-400">A imagem será enviada ao Cloudinary quando clicar em "Criar Jogo"</p>
          </div>
        </Field>
        
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={submitting || loading} className="flex-1 rounded-lg py-2.5">{submitting ? "A criar…" : "Criar Jogo"}</Button>
          <Link href="/games"><Button variant="secondary" className="flex-1 rounded-lg py-2.5" disabled={submitting}>Cancelar</Button></Link>
        </div>
      </form>
    </div>
  );
}
