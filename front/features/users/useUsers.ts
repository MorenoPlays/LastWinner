"use client"

import { useState, useEffect, useCallback } from "react";
import { searchApi } from "@/lib/api";
import type { User } from "@/lib/types";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async (query: string = "") => {
    setLoading(true);
    try {
      const data = await searchApi.users(query);
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRandomUsers = useCallback(async (count: number = 5) => {
    setLoading(true);
    try {
      // For now, we'll get all users and take a random subset
      // In a real implementation, you'd have an endpoint for random/recent users
      const data = await searchApi.users("");
      // Shuffle and take first 'count' users
      const shuffled = data.sort(() => 0.5 - Math.random());
      setUsers(shuffled.slice(0, count));
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to load random users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRandomUsers();
  }, [loadRandomUsers]);

  return {
    users,
    loading,
    error,
    loadUsers,
    loadRandomUsers,
  };
}