/* eslint-disable @next/next/no-img-element */
"use client";

import { usePosts } from "@/lib/hooks/usePosts";

export function PostsFeed() {
  const { posts, loading, error, likePost } = usePosts();

  const handleLike = async (postId: string) => {
    try {
      await likePost(postId);
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  return (
    <section className="mb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold tracking-tight text-indigo-300">
          📰 Feed da Comunidade
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Acompanha as novidades e conquistas da comunidade
        </p>
      </div>

      {loading ? (
        <div className="text-center text-zinc-400 py-8">Carregando posts...</div>
      ) : error ? (
        <div className="text-center text-red-400 py-8">Erro ao carregar posts</div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {posts.length === 0 ? (
            <div className="text-center text-zinc-400 py-8">Nenhum post ainda. Seja o primeiro!</div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="glass-card card-hover rounded-2xl border border-violet-500/20 overflow-hidden p-6"
              >
                {/* Autor */}
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={post.user?.avatarUrl || `https://ui-avatars.com/api/?name=${post.user?.username || "Unknown"}`}
                    alt={post.user?.username || "Unknown"}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-zinc-100">{post.user?.username || "Unknown"}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(post.createdAt).toLocaleDateString("pt-PT", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {/* Conteúdo */}
                <p className="text-zinc-200 mb-3 text-sm leading-relaxed">{post.content}</p>

                {/* Imagem */}
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    className="w-full rounded-lg border border-violet-500/10 mb-3 max-h-64 object-cover"
                  />
                )}

                {/* Ações */}
                <div className="flex items-center gap-4 pt-3 border-t border-violet-500/10">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2 text-sm font-semibold transition-colors text-zinc-400 hover:text-zinc-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {post.likes || 0}
                  </button>
                  <button className="flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-zinc-300 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {post.comments || 0}
                  </button>
                  <button className="ml-auto text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                    ⋯ Mais
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
