"use client";

import { useState, useCallback } from "react";
import { tournamentsApi } from "@/lib/api";
import type { Tournament, User } from "@/lib/types";

export interface UseTournamentsReturn {
  tournaments: Tournament[];
  currentTournament: Tournament | null;
  loading: boolean;
  error: string;
  loadAll: () => Promise<void>;
  loadOne: (id: string) => Promise<void>;
  create: (dto: any) => Promise<Tournament>;
  update: (id: string, dto: Record<string, any>) => Promise<Tournament>;
  delete: (id: string) => Promise<void>;
  setCurrentTournament: (t: Tournament | null) => void;
}

export function useTournaments(): UseTournamentsReturn {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await tournamentsApi.getAll();
      setTournaments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOne = useCallback(async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const data = await tournamentsApi.getOne(id);
      setCurrentTournament(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (dto: any) => {
    const created = await tournamentsApi.create(dto);
    setTournaments((prev) => [...prev, created]);
    return created;
  }, []);

  const update = useCallback(async (id: string, dto: Record<string, any>) => {
    const updated = await tournamentsApi.update(id, dto);
    setTournaments((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    if (currentTournament?.id === id) {
      setCurrentTournament((prev) => (prev ? { ...prev, ...updated } : null));
    }
    return updated;
  }, [currentTournament?.id]);

  const remove = useCallback(async (id: string) => {
    await tournamentsApi.delete(id);
    setTournaments((prev) => prev.filter((t) => t.id !== id));
    if (currentTournament?.id === id) {
      setCurrentTournament(null);
    }
  }, [currentTournament?.id]);

  return { tournaments, currentTournament, loading, error, loadAll, loadOne, create, update, delete: remove, setCurrentTournament };
}
