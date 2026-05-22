"use client";

import { useState, useCallback } from "react";
import { bracketsApi } from "@/lib/api";

export interface UseBracketsReturn {
  brackets: any[];
  loading: boolean;
  error: string;
  loadAll: () => Promise<void>;
  loadOne: (id: string) => Promise<void>;
  create: (dto: { tournamentId: string; type: string }) => Promise<any>;
  update: (id: string, dto: { tournamentId?: string; type?: string }) => Promise<void>;
  delete: (id: string) => Promise<void>;
  setBrackets: (b: any[]) => void;
}

export function useBrackets(): UseBracketsReturn {
  const [brackets, setBrackets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await bracketsApi.getAll();
      setBrackets(data);
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
      const data = await bracketsApi.getOne(id);
      setBrackets([data]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (dto: { tournamentId: string; type: string }) => {
    const created = await bracketsApi.create(dto);
    setBrackets((prev) => [...prev, created]);
    return created;
  }, []);

  const update = useCallback(async (id: string, dto: { tournamentId?: string; type?: string }) => {
    const updated = await bracketsApi.update(id, dto);
    setBrackets((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
  }, []);

  const remove = useCallback(async (id: string) => {
    await bracketsApi.delete(id);
    setBrackets((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return { brackets, loading, error, loadAll, loadOne, create, update, delete: remove, setBrackets };
}
