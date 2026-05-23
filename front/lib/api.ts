const API_BASE = process.env.NEXT_PUBLIC_API || "http://localhost:3001";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const ctrl = new AbortController();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
    signal: ctrl.signal,
  });

  const bodyText = await res.text().catch((e) => {
    console.error("Failed to read response body:", e);
    return "";
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("accessToken");
    }
    let errMsg = `API error ${res.status}`;
    const ct = res.headers.get("content-type") || "";
    if (bodyText && ct.includes("json")) {
      try {
        const d = JSON.parse(bodyText);
        errMsg = (d as any)?.message ?? errMsg;
      } catch {}
    }
    throw new Error(errMsg);
  }

  if (!bodyText) return {} as T;

  try {
    return (JSON.parse(bodyText) as unknown) as T;
  } catch (e) {
    throw new Error(
      e instanceof SyntaxError
        ? "Resposta inválida do servidor"
        : `JSON parse error: ${(e as Error).message}`
    );
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────
export const authApi = {
  register: (dto: { username: string; email: string; password: string; role?: string }) =>
    api<{ id: string; username: string; email: string; role: string; accessToken: string }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify(dto) }
    ),
  login: (dto: { email: string; password: string }) =>
    api<{ id: string; username: string; email: string; role: string; accessToken: string }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify(dto) }
    ),
  getMe: () =>
    api<{
      id: string; username: string; email: string; role: string;
      avatarUrl?: string; bio?: string; country?: string;
      elo: number; wins: number; losses: number; isVerified: boolean;
      createdAt: string; updatedAt: string;
    }>("/auth/me"),
  updateProfile: (dto: {
    username?: string; email?: string; password?: string;
    bio?: string; country?: string; avatarUrl?: string;
  }) =>
    api<{
      id: string; username: string; email: string; role: string;
      avatarUrl?: string; bio?: string; country?: string;
      elo: number; wins: number; losses: number; isVerified: boolean;
      createdAt: string; updatedAt: string;
    }>("/auth/me", { method: "PATCH", body: JSON.stringify(dto) }),
};

// ─── Games ───────────────────────────────────────────────────────────────
export const gamesApi = {
  getAll: () => api<any[]>("/game"),
  getOne: (id: string) => api<any>(`/game/${id}`),
  create: (dto: { name: string; slug: string; coverUrl?: string }) =>
    api<any>("/game", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: string, dto: { name?: string; slug?: string; coverUrl?: string }) =>
    api<any>(`/game/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  delete: (id: string) => api<void>(`/game/${id}`, { method: "DELETE" }),
};

// ─── Tournaments ─────────────────────────────────────────────────────────
export const tournamentsApi = {
  getAll: () => api<any[]>("/tournament"),
  getByGame: (gameId: string) => api<any[]>(`/tournament/by-game/${gameId}`),
  getOne: (id: string) => api<any>(`/tournament/${id}`),
  create: (dto: {
    organizerId: string;
    title: string;
    description?: string;
    format: string;
    mode: string;
    maxPlayers: number;
    entryFee?: number;
    prizePool?: number;
    startDate?: string;
    endDate?: string;
    bannerUrl?: string;
    gameId: string;
  }) => api<any>("/tournament", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: string, dto: Record<string, any>) =>
    api<any>(`/tournament/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  delete: (id: string) => api<void>(`/tournament/${id}`, { method: "DELETE" }),
};

// ─── Matches ─────────────────────────────────────────────────────────────
export const matchesApi = {
  getAll: () => api<any[]>("/match"),
  getOne: (id: string) => api<any>(`/match/${id}`),
  create: (dto: {
    bracketId: string;
    roundNumber: number;
    matchNumber: number;
    player1Id: string;
    player2Id: string;
    winnerId?: string;
    loserId?: string;
    status?: string;
    scheduledAt?: string;
    finishedAt?: string;
  }) => api<any>("/match", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: string, dto: Record<string, any>) =>
    api<any>(`/match/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  delete: (id: string) => api<void>(`/match/${id}`, { method: "DELETE" }),
};

// ─── Brackets ────────────────────────────────────────────────────────────
export const bracketsApi = {
  getAll: () => api<any[]>("/bracket"),
  getOne: (id: string) => api<any>(`/bracket/${id}`),
  create: (dto: { tournamentId: string; type: string }) =>
    api<any>("/bracket", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: string, dto: { tournamentId?: string; type?: string }) =>
    api<any>(`/bracket/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  delete: (id: string) => api<void>(`/bracket/${id}`, { method: "DELETE" }),
};

// ─── Tournament Participants ──────────────────────────────────────────────
export const participantsApi = {
  getAll: () => api<any[]>("/tournament-participant"),
  getOne: (id: string) => api<any>(`/tournament-participant/${id}`),
  create: (dto: {
    tournamentId: string;
    userId: string;
    status?: string;
    paymentProof?: string;
    finalPosition?: number;
  }) => api<any>("/tournament-participant", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: string, dto: Record<string, any>) =>
    api<any>(`/tournament-participant/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  delete: (id: string) => api<void>(`/tournament-participant/${id}`, { method: "DELETE" }),
  getPendingByTournament: (tournamentId: string) =>
    api<any[]>(`/tournament-participant/pending/${tournamentId}`),
  approvePending: (participantId: string) =>
    api<any>(`/tournament-participant/${participantId}/approve`, { method: "PUT" }),
};

// ─── Tournament Messages ─────────────────────────────────────────────────
export const messagesApi = {
  getAll: () => api<any[]>("/tournament-message"),
  getOne: (id: string) => api<any>(`/tournament-message/${id}`),
  create: (dto: { tournamentId: string; userId: string; message: string }) =>
    api<any>("/tournament-message", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: string, dto: { message?: string }) =>
    api<any>(`/tournament-message/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  delete: (id: string) => api<void>(`/tournament-message/${id}`, { method: "DELETE" }),
};

// ─── Admin — Users ─────────────────────────────────────────────────────────
export const adminUsersApi = {
  getAll: () =>
    api<Array<{
      id: string; username: string; email: string; role: string;
      avatarUrl?: string; bio?: string; country?: string;
      elo: number; wins: number; losses: number;
      isVerified: boolean; createdAt: string; updatedAt: string;
    }>>("/auth/admin/users"),

  updateRole: (id: string, role: string) =>
    api<{
      id: string; username: string; email: string; role: string;
      avatarUrl?: string; bio?: string; country?: string;
      elo: number; wins: number; losses: number;
      isVerified: boolean; createdAt: string; updatedAt: string;
    }>(`/auth/admin/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) }),
};