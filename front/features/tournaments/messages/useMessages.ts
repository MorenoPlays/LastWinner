"use client";

import { useState, useCallback } from "react";
import { messagesApi } from "@/lib/api";
import type { TournamentMessage, User } from "@/lib/types";

export interface UseMessagesReturn {
  messages: TournamentMessage[];
  loading: boolean;
  error: string;
  loadForTournament: (tournamentId: string, allMessages?: TournamentMessage[]) => void;
  send: (tournamentId: string, user: User, text: string) => Promise<TournamentMessage>;
  update: (id: string, dto: { message?: string }) => Promise<void>;
  delete: (id: string) => Promise<void>;
  setMessages: (m: TournamentMessage[]) => void;
}

export function useMessages(): UseMessagesReturn {
  const [messages, setMessages] = useState<TournamentMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadForTournament = useCallback((tournamentId: string, all?: TournamentMessage[]) => {
    const source = all ?? messages;
    setMessages(source.filter((m) => m.tournamentId === tournamentId));
  }, [messages]);

  const send = useCallback(async (tournamentId: string, user: User, text: string) => {
    const newMsg = await messagesApi.create({ tournamentId, userId: user.id, message: text });
    setMessages((prev) => [...prev, { ...newMsg, user }]);
    return newMsg;
  }, []);

  const update = useCallback(async (id: string, dto: { message?: string }) => {
    await messagesApi.update(id, dto);
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...dto } : m)));
  }, []);

  const remove = useCallback(async (id: string) => {
    await messagesApi.delete(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return { messages, loading, error, loadForTournament, send, update, delete: remove, setMessages };
}
