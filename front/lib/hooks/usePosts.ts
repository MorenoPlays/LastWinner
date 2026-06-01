"use client";

import { useState, useEffect, useCallback } from "react";
import { postsApi } from "../api";

export interface Post {
  id: string;
  userId: string;
  content: string;
  tournamentId?: string;
  matchId?: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  likes?: number;
  comments?: number;
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await postsApi.getAll();
      setPosts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const addPost = useCallback(
    async (userId: string, content: string, imageUrl?: string) => {
      try {
        const newPost = await postsApi.create({
          userId,
          content,
          imageUrl,
        });
        setPosts((prev) => [newPost, ...prev]);
      } catch (err) {
        console.error("Failed to create post", err);
        throw err;
      }
    },
    []
  );

  const likePost = useCallback(async (postId: string) => {
    try {
      await postsApi.like(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likes: (p.likes ?? 0) + 1 } : p
        )
      );
    } catch (err) {
      console.error("Failed to like post", err);
    }
  }, []);

  return { posts, loading, error, refetch: fetch, addPost, likePost };
}
