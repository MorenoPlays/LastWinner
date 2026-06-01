"use client";

import { useState, useEffect, useCallback } from "react";
import { tournamentsApi } from "../api";
import type { Tournament } from "../types";

export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tournamentsApi.getAll();
      setTournaments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tournaments");
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { tournaments, loading, error, refetch: fetch };
}

export function useTournament(id: string | undefined) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setTournament(null);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      try {
        setLoading(true);
        const data = await tournamentsApi.getOne(id);
        setTournament(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tournament");
        setTournament(null);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id]);

  return { tournament, loading, error };
}

export function useTournamentsByGame(gameId: string | undefined) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) {
      setTournaments([]);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      try {
        setLoading(true);
        const data = await tournamentsApi.getByGame(gameId);
        setTournaments(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tournaments");
        setTournaments([]);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [gameId]);

  return { tournaments, loading, error };
}
