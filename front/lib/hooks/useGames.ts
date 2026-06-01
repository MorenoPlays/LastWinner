"use client";

import { useState, useEffect, useCallback } from "react";
import { gamesApi } from "../api";
import type { Game } from "../types";

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await gamesApi.getAll();
      setGames(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load games");
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { games, loading, error, refetch: fetch };
}

export function useGame(id: string | undefined) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setGame(null);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      try {
        setLoading(true);
        const data = await gamesApi.getOne(id);
        setGame(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load game");
        setGame(null);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id]);

  return { game, loading, error };
}
