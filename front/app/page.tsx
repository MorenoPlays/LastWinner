import Link from "next/link";
import Image from "next/image";
import type { Tournament, Game } from "@/lib/types";

function GameFallback({ src, alt }: { src?: string; alt: string }) {
  if (src) return <img src={src} alt={alt} className="h-48 w-full rounded-xl object-cover" />;
  return (
    <div className="flex h-48 w-full items-center justify-center rounded-xl bg-slate-800">
      <span className="text-4xl font-extrabold text-slate-700">L</span>
    </div>
  );
}

async function getTournaments() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/tournament`, { next: { revalidate: 30 } });
    const body = await res.text();
    if (!res.ok) return [];
    return body ? JSON.parse(body) as Tournament[] : [];
  } catch { return []; }
}

async function getGames() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/game`, { next: { revalidate: 60 } });
    const body = await res.text();
    if (!res.ok) return [];
    return body ? JSON.parse(body) as Game[] : [];
  } catch { return []; }
}

const FORMAT_MAP: Record<string, string> = { SINGLE_ELIMINATION: "Eliminatória simples", DOUBLE_ELIMINATION: "Eliminatória dupla", ROUND_ROBIN: "Todos contra todos", SWISS: "Sistema suíço" };
const STATUS_COLOR: Record<string, string> = { DRAFT: "bg-slate-700/60 text-zinc-300", OPEN: "bg-green-500/30 text-green-300", ONGOING: "bg-sky-500/30 text-sky-300", FINISHED: "bg-amber-500/30 text-amber-300", CANCELED: "bg-red-500/30 text-red-300" };

export default async function HomePage() {
  const [tournaments, games] = await Promise.all([getTournaments(), getGames()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <div className="mb-16 flex flex-col items-center text-center">
        <img src="/logo.png" alt="LastWinner" className="h-28 w-auto select-none sm:h-36" style={{ animation: 'float 3s ease-in-out infinite' }} />
        <h1 className="mt-5 mb-1 text-3xl font-extrabold text-indigo-400 sm:text-5xl" style={{ letterSpacing: "-0.02em" }}>Bem-vindo ao LastWinner</h1>
        <p className="text-lg text-sky-400 sm:text-2xl" style={{ fontFamily: 'var(--font-Outfit)' }}>Agora sim, é ganhar.</p>
        <span className="mt-10 block h-1.5 w-32 rounded-full bg-violet-500/80 shadow-lg shadow-violet-500/40" />
      </div>

      {/* ── Torneios em destaque ─────────────────────────────────── */}
      <section className="mb-20">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight text-indigo-300">Torneios</h2>
          <Link href="/tournaments" className="rounded-lg border border-violet-500/30 px-5 py-2 text-sm font-semibold text-zinc-300 hover:bg-violet-500/15 transition-colors">Ver todos</Link>
        </div>
        {tournaments.length === 0 ? (
          <div className="glass-card card-hover rounded-2xl p-10 text-center">
            <p className="text-lg font-semibold text-zinc-300 mb-1">Nenhum torneio criado ainda.</p>
            <p className="text-sm text-zinc-400">Crie um torneio para começar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.slice(0, 6).map((t) => (
              <Link key={t.id} href={`/tournaments/${t.id}`} className="glass-card card-hover flex flex-col overflow-hidden rounded-2xl transition-transform hover:-translate-y-1">
                {t.bannerUrl && <Image src={t.bannerUrl} alt={t.title} width={600} height={300} className="h-48 w-full object-cover" unoptimized />}
                <div className="flex flex-col gap-2 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-sky-300">{t.title}</h3>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${STATUS_COLOR[t.status] || STATUS_COLOR.DRAFT}`}>{t.status}</span>
                  </div>
                  {t.description && <p className="line-clamp-2 text-sm text-zinc-400">{t.description}</p>}
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-400">
                    <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-indigo-300">{FORMAT_MAP[t.format] || t.format}</span>
                    <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-green-300">{t.maxPlayers} jogadores</span>
                    <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-amber-300">{t.prizePool > 0 ? `$${t.prizePool}` : "Grátis"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Jogos em destaque ───────────────────────────────────── */}
      <section className="mb-20">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight text-indigo-300">Jogos</h2>
          <Link href="/games" className="rounded-lg border border-violet-500/30 px-5 py-2 text-sm font-semibold text-zinc-300 hover:bg-violet-500/15 transition-colors">Ver todos</Link>
        </div>
        {games.length === 0 ? (
          <div className="glass-card card-hover rounded-2xl p-10 text-center">
            <p className="text-lg font-semibold text-zinc-300 mb-1">Nenhum jogo registado.</p>
            <p className="text-sm text-zinc-400">Adicione um jogo para começar a criar torneios.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {games.map((g) => (
              <Link key={g.id} href={`/games/${g.id}`} className="glass-card card-hover flex flex-col overflow-hidden rounded-2xl transition-transform hover:-translate-y-1">
                <GameFallback src={g.coverUrl} alt={g.name} />
                <div className="p-4">
                  <h3 className="text-base font-bold text-zinc-100">{g.name}</h3>
                  <p className="mt-0.5 text-xs font-mono text-zinc-500">{g.slug}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
