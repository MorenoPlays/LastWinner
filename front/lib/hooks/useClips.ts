"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "../api";

export interface Clip {
  id: string;
  userId: string;
  gameId: string;
  title: string;
  videoUrl: string;
  thumbnail?: string;
  views: number;
  likes: number;
  createdAt: string;
}

export function useClips() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api<Clip[]>("/clip");
      setClips(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clips");
      setClips([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { clips, loading, error, refetch: fetch };
}
