"use client";

import { useState, useEffect, useCallback } from "react";
import { authApi } from "../api";
import type { User } from "../types";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await authApi.getMe();
      setUser(data as User);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { user, loading, error, refetch: fetch };
}

export function useUser(userId: string | undefined) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      try {
        setLoading(true);
        // Nota: Você pode precisar criar um endpoint getOne no backend se não existir
        const data = await authApi.getMe();
        setUser(data as User);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [userId]);

  return { user, loading, error };
}
