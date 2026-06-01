/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useClips } from "@/lib/hooks/useClips";

// Importar ReactPlayer dinamicamente para evitar problemas de SSR
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export function LivesSection() {
  const { clips, loading } = useClips();
  const [selectedClip, setSelectedClip] = useState(clips[0] || null);

  // Se ainda não temos clips carregados, usar o primeiro quando carregar
  if (!selectedClip && clips.length > 0) {
    setSelectedClip(clips[0]);
  }

  return (
    <section className="mb-20">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold tracking-tight text-indigo-300">🔴 Lives agora</h2>
      </div>

      {loading ? (
        <div className="glass-card card-hover rounded-2xl p-10 text-center">
          <p className="text-lg font-semibold text-zinc-300 mb-1">Carregando transmissões...</p>
        </div>
      ) : clips.length === 0 ? (
        <div className="glass-card card-hover rounded-2xl p-10 text-center">
          <p className="text-lg font-semibold text-zinc-300 mb-1">Nenhuma live no momento.</p>
          <p className="text-sm text-zinc-400">Volte mais tarde para ver transmissões ao vivo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Player Principal */}
          <div className="lg:col-span-2">
            <div className="glass-card card-hover rounded-2xl overflow-hidden">
              {selectedClip && (
                <div className="space-y-4">
                  <div className="relative aspect-video w-full bg-black rounded-t-2xl overflow-hidden">
                    <ReactPlayer
                      url={selectedClip.videoUrl}
                      playing={true}
                      controls={true}
                      width="100%"
                      height="100%"
                      light={selectedClip.thumbnail}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-indigo-300 mb-2">{selectedClip.title}</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/30 text-xs font-bold text-indigo-300">
                        📺
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-200">Transmissão</p>
                        <p className="text-xs text-green-400 flex items-center gap-1">
                          👁️ {selectedClip.views} visualizações
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lista de Videos */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-400 px-1">Outras Transmissões</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {clips.map((clip) => (
                <button
                  key={clip.id}
                  onClick={() => setSelectedClip(clip)}
                  className={`glass-card card-hover w-full flex gap-2 rounded-lg p-2 text-left transition-all ${
                    selectedClip?.id === clip.id
                      ? "border border-indigo-400/50 bg-indigo-500/10"
                      : "border border-violet-500/30 hover:border-violet-500/50"
                  }`}
                >
                  <img
                    src={clip.thumbnail || "https://via.placeholder.com/80x45"}
                    alt={clip.title}
                    className="h-12 w-20 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 truncate">{clip.title}</p>
                    <p className="text-xs text-zinc-400">{clip.gameId}</p>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      👁️ {clip.views}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
