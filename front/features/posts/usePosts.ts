import { useState, useEffect, useCallback } from "react";
import { postsApi } from "@/lib/api";
import type { Post } from "@/lib/types";

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await postsApi.getAll();
      setPosts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to load posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPostsByTournament = useCallback(async (tournamentId: string) => {
    setLoading(true);
    try {
      const data = await postsApi.getByTournament(tournamentId);
      setPosts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to load posts by tournament:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPostsByUser = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const data = await postsApi.getByUser(userId);
      setPosts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to load posts by user:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (dto: Omit<Post, "id" | "user" | "createdAt" | "updatedAt" | "likesCount" | "commentsCount" | "isLikedByUser">) => {
    try {
      const newPost = await postsApi.create(dto);
      return newPost;
    } catch (err: any) {
      throw err;
    }
  }, []);

  const updatePost = useCallback(async (id: string, dto: Partial<Post>) => {
    try {
      const updatedPost = await postsApi.update(id, dto);
      return updatedPost;
    } catch (err: any) {
      throw err;
    }
  }, []);

  const deletePost = useCallback(async (id: string) => {
    try {
      await postsApi.delete(id);
    } catch (err: any) {
      throw err;
    }
  }, []);

  const likePost = useCallback(async (postId: string) => {
    try {
      return await postsApi.like(postId);
    } catch (err: any) {
      throw err;
    }
  }, []);

  const unlikePost = useCallback(async (postId: string) => {
    try {
      await postsApi.unlike(postId);
    } catch (err: any) {
      throw err;
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return {
    posts,
    loading,
    error,
    loadPosts,
    loadPostsByTournament,
    loadPostsByUser,
    createPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
  };
}