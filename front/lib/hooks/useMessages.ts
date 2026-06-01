"use client";

import { useState, useEffect, useCallback } from "react";
import { messagesApi } from "../api";

export interface TournamentMessage {
  id: string;
  tournamentId: string;
  userId: string;
  message: string;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

export function useTournamentMessages(tournamentId: string | undefined) {
  const [messages, setMessages] = useState<TournamentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!tournamentId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await messagesApi.getAll();
      // Filtrar por tournamentId se necessário
      const filtered = data.filter((m: any) => m.tournamentId === tournamentId);
      setMessages(filtered);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const addMessage = useCallback(
    async (userId: string, message: string) => {
      if (!tournamentId) return;
      try {
        const newMessage = await messagesApi.create({
          tournamentId,
          userId,
          message,
        });
        setMessages((prev) => [newMessage, ...prev]);
      } catch (err) {
        console.error("Failed to send message", err);
        throw err;
      }
    },
    [tournamentId]
  );

  return { messages, loading, error, refetch: fetch, addMessage };
}
