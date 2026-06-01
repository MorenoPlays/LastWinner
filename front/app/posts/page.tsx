"use client";

import { useState } from "react";
import Link from "next/link";
import { usePosts } from "@/features/posts/usePosts";
import { useAuth } from "@/features/auth/useAuth";
import type { Post } from "@/lib/types";

export default function PostsPage() {
  const { user } = useAuth();
  const { posts, loading, error, loadPosts } = usePosts();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, we'd have a search endpoint for posts
    // For now, we'll just reload all posts
    await loadPosts();
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <Link href="/" className="mb-6 inline-block text-sm font-semibold text-violet-400 hover:text-violet-300">
        ← Voltar ao início
      </Link>
      
      <h1 className="mb-6 text-2xl font-extrabold text-indigo-300">Posts da Comunidade</h1>
      
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Pesquisar posts..."
          className="flex-1 rounded-lg border border-violet-500/30 bg-slate-900/60 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-400"
        />
        <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
          Pesquisar
        </button>
      </form>
      
      {/* Posts List */}
      {loading && <p className="text-center py-12 text-zinc-400">A carregar posts...</p>}
      {error && <p className="text-center text-red-400">Erro ao carregar posts: {error}</p>}
      {posts.length === 0 && !loading && !error && (
        <p className="text-center py-12 text-zinc-400">Ainda não há posts na comunidade. Seja o primeiro a publicar!</p>
      )}
      {!loading && posts.length > 0 && (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="glass-card rounded-xl p-5 border border-violet-500/20">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-500/30 text-xs font-extrabold text-indigo-300">
                  {post.user?.username?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-zinc-200">{post.user?.username || post.userId}</p>
                    <p className="text-xs text-zinc-500">{new Date(post.createdAt).toLocaleString("pt-PT")}</p>
                    {post.tournamentId && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300">
                        Torneio
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-200">{post.content}</p>
                  {post.imageUrl && (
                    <div className="mt-3">
                      <img src={post.imageUrl} alt="Post" className="rounded-lg max-h-48 w-full object-cover" />
                    </div>
                  )}
                  {post.videoUrl && (
                    <div className="mt-3">
                      <video controls className="rounded-lg max-h-48 w-full object-contain">
                        <source src={post.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                  <div className="mt-4 flex items-center gap-4 text-sm text-zinc-400">
                    <button onClick={() => {/* likePost(post.id) */}} className={`flex items-center gap-1 hover:text-indigo-400 transition-colors`}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M2 10.3c1.3-.6 3.5-2 5.3-3.6.9-.8 1.8-1.7 2.7-2.5 1-.9 2.5-1.1 3.5-.2.8.9 1.9.9 2.9 0 2.5-2 4.5-4.6 5.6-1.3.5-2.7.8-4.1.8-1.4 0-2.8-.3-4-1.1C1.7 15.1.5 13.1 2 10.3zM13 6.1c-.7-.2-1.4-.1-2 .2-.8.4-1.2 1.1-1.2 2 0 .9.4 1.6 1 2.1l4.1 3.1c.4.3.9.4 1.4.4s1-.1 1.4-.4l4.1-3.1c.6-.5 1-1.2 1-2.1 0-.9-.4-1.6-1-2.1-.8-.3-1.5-.4-2-.2zm0 10.7c-.8.3-1.7.4-2.5.4s-1.7-.1-2.5-.4c-.8-.3-1.4-1-1.4-1.9 0-.8.5-1.5 1.2-1.8L9 12.3l-1.6-1.1c-.7-.5-1-.9-.9-1.4-.1-.4-.1-.8.1-1.1.2-.3.7-.4 1.2-.4l1.6 1.1 2.4-1.7c.5-.3 1.1-.2 1.5.3.4.5.4 1.1-.1 1.6-1.1.1-1.7.4-1.7 1.2 0 .8.5 1.5 1.4 1.9z" clipRule="evenodd" /></svg>
                      <span>{post.likesCount}</span>
                    </button>
                    <button onClick={() => {/* comment functionality */}} className="flex items-center gap-1 text-zinc-400 hover:text-zinc-300 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M5 4a3 3 0 013-3h6a3 3 0 013-3v8a3 3 0 013-3h-6a3 3 0 013-3V4zm0 2a1 1 0 1000 2h6a1 1 0 1000 0-2H5zm6 11a1 1 0 1000 0 2h6a1 1 0 1000 0-2h-6zm2-9a1 1 0 1000 0 2h2a1 1 0 1000 0-2h-2z" clipRule="evenodd" /></svg>
                      <span>{post.commentsCount}</span>
                    </button>
                    <span className="ml-auto text-zinc-500">#{post.id}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Load More Button */}
          <div className="mt-6 text-center">
            <button onClick={() => { /* load more posts */ }} className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
              Carregar mais posts
            </button>
          </div>
        </div>
      )}
    </div>
  );
}