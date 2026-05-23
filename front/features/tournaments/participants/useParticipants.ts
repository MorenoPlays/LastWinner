"use client";

import { useState, useCallback } from "react";
import { participantsApi } from "@/lib/api";
import type { TournamentParticipant } from "@/lib/types";

export interface UseParticipantsReturn {
  participants: TournamentParticipant[];
  loading: boolean;
  error: string;
  loadForTournament: (tournamentId: string, allParticipants?: TournamentParticipant[]) => void;
  create: (dto: { tournamentId: string; userId: string; status?: string; paymentProof?: string; finalPosition?: number }) => Promise<TournamentParticipant>;
  update: (id: string, dto: Record<string, any>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  remove: (id: string) => void;
  setParticipants: (p: TournamentParticipant[]) => void;
}

export function useParticipants(): UseParticipantsReturn {
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadForTournament = useCallback((tournamentId: string, all?: TournamentParticipant[]) => {
    const source = all ?? participants;
    setParticipants(source.filter((p) => p.tournamentId === tournamentId));
  }, [participants]);

  const create = useCallback(async (dto: { tournamentId: string; userId: string; status?: string; paymentProof?: string; finalPosition?: number }) => {
    const created = await participantsApi.create(dto);
    setParticipants((prev) => [...prev, created]);
    return created;
  }, []);

  const update = useCallback(async (id: string, dto: Record<string, any>) => {
    await participantsApi.update(id, dto);
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, ...dto } : p)));
  }, []);

  const remove = useCallback(async (id: string) => {
    await participantsApi.delete(id);
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { participants, loading, error, loadForTournament, create, update, delete: remove, remove, setParticipants };
}
