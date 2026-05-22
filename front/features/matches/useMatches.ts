"use client";

import { useState, useCallback } from "react";
import { matchesApi } from "@/lib/api";

export interface UseMatchesReturn {
  matches: any[];
  loading: boolean;
  error: string;
  loadAll: () => Promise<void>;
  loadOne: (id: string) => Promise<void>;
  create: (dto: any) => Promise<any>;
  update: (id: string, dto: Record<string, any>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  setMatches: (m: any[]) => void;
}

export function useMatches(): UseMatchesReturn {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await matchesApi.getAll();
      setMatches(data);
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
      const data = await matchesApi.getOne(id);
      setMatches([data]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (dto: any) => {
    const created = await matchesApi.create(dto);
    setMatches((prev) => [...prev, created]);
    return created;
  }, []);

  const update = useCallback(async (id: string, dto: Record<string, any>) => {
    const updated = await matchesApi.update(id, dto);
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, ...updated } : m)));
  }, []);

  const remove = useCallback(async (id: string) => {
    await matchesApi.delete(id);
    setMatches((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return { matches, loading, error, loadAll, loadOne, create, update, delete: remove, setMatches };
}
