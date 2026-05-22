"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
/* eslint-disable @next/next/no-img-element */
import { useAuth } from "@/features/auth/useAuth";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";

interface Country { name: string; code: string }

const inputCls = "w-full rounded-lg border border-violet-500/30 bg-slate-900/60 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40";
const textareaCls = inputCls + " min-h-[80px] resize-none";

const COUNTRIES_URL = "https://restcountries.com/v3.1/all?fields=name,cca2";

export default function SettingsPage() {
  const { user, loading: authLoading, refresh } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [countryList, setCountryList] = useState<Country[]>([]);
  const [countryOpen, setCountryOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setBio(user.bio || "");
      setCountry(user.country || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    let cancelled = false;
    fetch(COUNTRIES_URL)
      .then(async (r) => {
        const body = await r.text();
        if (!r.ok) throw new Error('Failed to load countries');
        return body ? JSON.parse(body) : [];
      })
      .then((data: { name: { common: string }; cca2: string }[]) => {
        if (cancelled) return;
        setCountryList(
          data
            .map((c) => ({ name: c.name.common, code: c.cca2 }))
            .sort((a, b) => a.name.localeCompare(b.name, "pt"))
        );
      })
      .catch(() => { if (!cancelled) setCountryList([]); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setCountryOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedCountry = countryList.find((c) => c.code === country);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSaved(false);
    try {
      const dto: any = { username, email, bio, country, avatarUrl };
      if (password) dto.password = password;
      await authApi.updateProfile(dto);
      await refresh();
      setSaved(true);
      setPassword("");
      router.push("/profile");
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      setError(err.message || "Erro ao guardar.");
    }
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Enviar como FormData para um endpoint /auth/me/avatar hipotético
    // Por enquanto, lê como data URL
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSelect = (e: React.MouseEvent<HTMLLIElement>) => {
    const value = e.currentTarget.textContent || "";
    const match = countryList.find((c) => c.name === value);
    if (match) setCountry(match.code);
    setCountryOpen(false);
    setCountrySearch("");
  };

  if (authLoading) return <p className="p-8 text-center text-zinc-400">A carregar…</p>;
  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/profile" className="mb-4 inline-block text-sm font-semibold text-violet-400 hover:text-violet-300 hover:underline">← Voltar ao perfil</Link>

      <div className="glass-card card-hover mb-6 overflow-hidden rounded-2xl">
        <div className="relative h-20 bg-gradient-to-r from-violet-700/30 to-indigo-700/30" />
        <div className="relative px-6 pt-6 pb-6">
          <h1 className="text-xl font-extrabold tracking-tight text-indigo-300">Definições de Conta</h1>
          <p className="text-sm text-zinc-400">Atualize as suas informações pessoais e avatar</p>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-900/40 px-4 py-3 text-center text-sm text-red-300 ring-1 ring-red-500/30">{error}</p>
      )}
      {saved && (
        <p className="mb-4 rounded-lg bg-green-900/40 px-4 py-3 text-center text-sm text-green-300 ring-1 ring-green-500/30">
          ✓ Alterações guardadas com sucesso.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar section */}
        <div className="glass-card card-hover rounded-2xl p-6">
          <h2 className="mb-4 text-lg font-semibold text-indigo-300">Avatar</h2>
          <div className="flex items-center gap-5">
            <div className="relative h-20 w-20 shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={username} className="rounded-2xl object-cover ring-2 ring-violet-500/30 h-20 w-20" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-3xl font-extrabold text-white shadow-lg shadow-indigo-500/40">
                  {username[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://exemplo.com/avatar.png"
                className={inputCls}
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">ou</span>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-lg border border-violet-500/30 px-3 py-1.5 text-xs font-semibold text-violet-300 transition-colors hover:bg-violet-500/15"
                >
                  📁 Carregar ficheiro
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
              </div>
            </div>
          </div>
        </div>

        {/* Personal info */}
        <div className="glass-card card-hover space-y-5 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-indigo-300">Informações Pessoais</h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-sky-300">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className={inputCls} placeholder="username" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-sky-300">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} placeholder="email@exemplo.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-sky-300">País</label>
              <div ref={countryRef} className="relative">
                <input
                  type="text"
                  value={selectedCountry ? selectedCountry.name : countrySearch}
                  onChange={(e) => { setCountrySearch(e.target.value); setCountryOpen(true); }}
                  onFocus={() => setCountryOpen(true)}
                  className={inputCls}
                  placeholder="Pesquisar país…"
                  autoComplete="off"
                />
                {countryOpen && (() => {
                  const filtered = countryList.filter(
                    (c) =>
                      c.name.toLowerCase().includes(countrySearch.toLowerCase())
                  );
                  return filtered.length > 0 ? (
                    <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-violet-500/30 bg-slate-800/95 p-1 shadow-xl shadow-violet-900/40">
                      {filtered.map((c) => (
                        <li
                          key={c.code}
                          onClick={handleSelect}
                          className="cursor-pointer rounded-md px-3 py-2 text-sm text-zinc-200 hover:bg-violet-500/20"
                        >
                          {c.name}
                        </li>
                      ))}
                    </ul>
                  ) : null;
                })()}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-sky-300">Nova Palavra-passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" minLength={6} />
              <p className="mt-1 text-xs text-zinc-500">Deixa em branco para não mudar</p>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-sky-300">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className={textareaCls} placeholder="Fale um pouco sobre si…" rows={3} />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" className="flex-1 rounded-lg py-2.5">Guardar Alterações</Button>
          <Link href="/profile"><Button variant="secondary" className="rounded-lg">Cancelar</Button></Link>
        </div>
      </form>
    </div>
  );
}
