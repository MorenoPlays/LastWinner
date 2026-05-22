"use client";

import { useState, useCallback } from "react";
import { gamesApi } from "@/lib/api";
import type { Game } from "@/lib/types";

export { type Game };

export interface UseGamesReturn {
  games: Game[];
  loading: boolean;
  error: string;
  load: () => Promise<void>;
  create: (dto: { name: string; slug: string; coverUrl?: string }) => Promise<Game>;
  update: (id: string, dto: { name?: string; slug?: string; coverUrl?: string }) => Promise<Game>;
  delete: (id: string) => Promise<void>;
}

export function useGames(): UseGamesReturn {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await gamesApi.getAll();
      setGames(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (dto: { name: string; slug: string; coverUrl?: string }) => {
    const newGame = await gamesApi.create(dto);
    setGames((prev) => [...prev, newGame]);
    return newGame;
  }, []);

  const update = useCallback(async (id: string, dto: { name?: string; slug?: string; coverUrl?: string }) => {
    const updated = await gamesApi.update(id, dto);
    setGames((prev) => prev.map((g) => (g.id === id ? { ...g, ...updated } : g)));
    return updated;
  }, []);

  const deleteGame = useCallback(async (id: string) => {
    await gamesApi.delete(id);
    setGames((prev) => prev.filter((g) => g.id !== id));
  }, []);

  return { games, loading, error, load, create, update, delete: deleteGame };
}
