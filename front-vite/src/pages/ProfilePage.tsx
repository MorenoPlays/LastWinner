import { useParams, Link } from 'react-router-dom'
import { MainNav } from '../components/main-nav'
import { useAuth } from '@/hooks/useAuth'
import { apiGet, apiPut } from '@/lib/api'
import type { User } from '@/lib/types'
import { useState, useEffect } from 'react'
import { Shield, Trophy } from 'lucide-react'
import { LogOut } from 'lucide-react'

type UserProfile = User & {
  email?: string
  role?: string
  elo?: number
  wins?: number
  losses?: number
  isVerified?: boolean
  phoneNumber?: string | null
  country?: string | null
  bio?: string | null
  createdAt?: string
  updatedAt?: string
}

function mapUserProfile(apiUser: { 
  id: string
  username: string
  email?: string
  role?: string
  avatarUrl?: string | null
  country?: string | null
  elo?: number
  wins?: number
  losses?: number
  isVerified?: boolean
  phoneNumber?: string | null
  bio?: string | null
  createdAt?: string
  updatedAt?: string
}): UserProfile {
  return {
    id: apiUser.id,
    username: apiUser.username,
    display_name: apiUser.username,
    avatar_url: apiUser.avatarUrl || null,
    country_code: apiUser.country || null,
    email: apiUser.email,
    role: apiUser.role,
    elo: apiUser.elo,
    wins: apiUser.wins,
    losses: apiUser.losses,
    isVerified: apiUser.isVerified,
    phoneNumber: apiUser.phoneNumber,
    country: apiUser.country,
    bio: apiUser.bio,
    createdAt: apiUser.createdAt,
    updatedAt: apiUser.updatedAt,
  }
}

export function ProfilePage() {
  const { id } = useParams()
  const { user: authUser, logout } = useAuth()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'profile' | 'stats' | 'admin'>('profile')
  const [allUsers, setAllUsers] = useState<UserProfile[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [changingRole, setChangingRole] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    apiGet<any>(`/users/${id}`)
      .then(userData => {
        setUser(mapUserProfile(userData))
      })
      .catch(() => {
        setUser({
          id: id,
          username: 'unknown',
          email: '',
          role: 'USER',
          display_name: 'unknown',
          avatar_url: null,
          country_code: null,
        })
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (tab === 'admin' && authUser?.role === 'ADMIN') {
      setLoadingUsers(true)
      const token = localStorage.getItem('token')
      apiGet('/auth/admin/users', token || undefined)
        .then((users) => setAllUsers(users as UserProfile[]))
        .catch(console.error)
        .finally(() => setLoadingUsers(false))
    }
  }, [tab, authUser?.role])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <main className="container mx-auto px-4 py-8">
          <p className="text-foreground">A carregar...</p>
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <main className="container mx-auto px-4 py-8">
          <p className="text-foreground">Utilizador não encontrado</p>
        </main>
      </div>
    )
  }

  const displayUser = user
  const isAdmin = displayUser.role === 'ADMIN'

  const handleChangeRole = async (userId: string, newRole: string) => {
    setChangingRole(userId)
    try {
      const token = localStorage.getItem('token')
      await apiPut(`/auth/admin/users/${userId}/role`, { role: newRole }, token || undefined)
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao alterar função.')
    } finally {
      setChangingRole(null)
    }
  }

  const roleOptions = ['USER', 'ORGANIZER', 'ADMIN'] as const
  const initial = displayUser.username?.[0]?.toUpperCase() || '?'

  return (
    <div className="min-h-screen bg-background">

      <MainNav />

      {/* <Link to="/" className="mb-4 inline-block text-sm font-semibold text-violet-400 hover:text-violet-300 hover:underline">← Voltar</Link> */}

      <div className="glass-card card-hover mb-6 overflow-hidden rounded-2xl">
        <div className="relative h-28 bg-linear-to-r from-indigo-700/40 via-violet-700/40 to-indigo-700/40" />
        <div className="relative px-6 pb-6">
          <div className="-mt-10 mb-3 flex items-end gap-4">
<div className="relative h-20 w-20 shrink-0">
               {displayUser.avatar_url ? (
                 <img src={displayUser.avatar_url} alt={displayUser.username} className="rounded-2xl object-cover ring-4 ring-slate-900 h-20 w-20" />
               ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 text-3xl font-extrabold text-white shadow-lg shadow-indigo-500/40">
                  {initial}
                </div>
              )}
            </div>
            <div className="mb-1">
              <h1 className="text-xl font-extrabold tracking-tight text-zinc-100">{displayUser.username}</h1>
              <p className="text-sm text-zinc-400">{displayUser.email}</p>
            </div>
            <span className="ml-auto mb-2 rounded-full bg-violet-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-300">
              {displayUser.role}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span className="font-semibold text-zinc-200">{displayUser.elo || 1000}</span> <span>ELO</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-green-400">{displayUser.wins || 0}</span> Vitórias
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-red-400">{displayUser.losses || 0}</span> Derrotas
            </div>
            {displayUser.isVerified && (
              <span className="flex items-center gap-1 rounded-full bg-sky-500/20 px-2 py-0.5 text-xs font-semibold text-sky-300">
                <Shield className="h-3 w-3" />
                Verificado
              </span>
            )}
            {id === authUser?.id && (
              <button
                onClick={logout}
                className="ml-auto rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/30 transition-colors"
              >
                <LogOut className="h-3 w-3 inline mr-1" />
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4 border-b border-violet-500/20">
        <div className="flex gap-6">
          {(['profile', 'stats', ...(isAdmin ? ['admin' as const] : [])] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`relative pb-3 text-sm font-semibold transition-colors ${tab === t ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {t === 'profile' ? 'Perfil' : t === 'stats' ? 'Estatísticas' : 'Administração'}
              {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {tab === 'profile' && (
        <div className="glass-card card-hover space-y-4 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-indigo-300">Informações Pessoais</h2>
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">Username</dt>
              <dd className="font-semibold text-zinc-200">{displayUser.username}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Email</dt>
              <dd className="font-semibold text-zinc-200">{displayUser.email}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Função</dt>
              <dd className="font-semibold text-zinc-200">{displayUser.role}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Número de Telefone</dt>
              <dd className="font-semibold text-zinc-200">{displayUser.phoneNumber || '—'}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">País</dt>
              <dd className="font-semibold text-zinc-200">{displayUser.country || '—'}</dd>
            </div>
            {displayUser.bio && (
              <div className="sm:col-span-2">
                <dt className="text-zinc-500">Bio</dt>
                <dd className="font-semibold text-zinc-200">{displayUser.bio}</dd>
              </div>
            )}
            <div>
              <dt className="text-zinc-500">Criado em</dt>
              <dd className="font-semibold text-zinc-200">{new Date(displayUser.createdAt || '').toLocaleDateString('pt-PT')}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Atualizado em</dt>
              <dd className="font-semibold text-zinc-200">{new Date(displayUser.updatedAt || '').toLocaleDateString('pt-PT')}</dd>
            </div>
          </dl>
        </div>
      )}

      {tab === 'stats' && (
        <div className="glass-card card-hover space-y-4 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-indigo-300">Estatísticas</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-indigo-500/10 p-4 text-center ring-1 ring-indigo-500/20">
              <p className="text-2xl font-extrabold text-indigo-400">{displayUser.elo || 1000}</p>
              <p className="text-xs text-zinc-500">ELO Rating</p>
            </div>
            <div className="rounded-xl bg-green-500/10 p-4 text-center ring-1 ring-green-500/20">
              <p className="text-2xl font-extrabold text-green-400">{displayUser.wins || 0}</p>
              <p className="text-xs text-zinc-500">Vitórias</p>
            </div>
            <div className="rounded-xl bg-red-500/10 p-4 text-center ring-1 ring-red-500/20">
              <p className="text-2xl font-extrabold text-red-400">{displayUser.losses || 0}</p>
              <p className="text-xs text-zinc-500">Derrotas</p>
            </div>
            <div className="rounded-xl bg-amber-500/10 p-4 text-center ring-1 ring-amber-500/20">
              <p className="text-2xl font-extrabold text-amber-400">
                {displayUser.wins != null && displayUser.losses != null && (displayUser.wins + displayUser.losses) > 0
                  ? ((displayUser.wins / (displayUser.wins + displayUser.losses)) * 100).toFixed(0)
                  : 0}%
              </p>
              <p className="text-xs text-zinc-500">Win Rate</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'admin' && isAdmin && (
        <div className="glass-card card-hover space-y-4 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-indigo-300">Gerir Utilizadores</h2>
          <p className="text-sm text-zinc-400">
            Altere a função de qualquer utilizador para <span className="font-semibold text-violet-300">USER</span>,{' '}
            <span className="font-semibold text-green-300">ORGANIZER</span> ou{' '}
            <span className="font-semibold text-red-300">ADMIN</span>.
          </p>

          {loadingUsers ? (
            <p className="text-sm text-zinc-400">A carregar utilizadores...</p>
          ) : (
            <div className="space-y-3">
              {allUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-4 rounded-xl bg-slate-800/50 px-4 py-3 text-sm">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-base font-extrabold text-white">
                    {u.username?.[0]?.toUpperCase() || '?'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-100 truncate">{u.username}</p>
                    <p className="text-xs text-zinc-500 truncate">{u.email}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                    u.role === 'ADMIN' ? 'bg-red-500/30 text-red-300' : u.role === 'ORGANIZER' ? 'bg-green-500/30 text-green-300' : 'bg-zinc-500/30 text-zinc-300'
                  }`}>
                    {u.role}
                  </span>
                  <div className="flex shrink-0 gap-2">
                    {roleOptions.filter((r) => r !== u.role).map((r) => (
                      <button
                        key={r}
                        disabled={changingRole === u.id}
                        onClick={() => handleChangeRole(u.id, r)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 ${
                          r === 'ADMIN' ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' : r === 'ORGANIZER' ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' : 'bg-zinc-500/20 text-zinc-300 hover:bg-zinc-500/30'
                        }`}
                      >
                        {changingRole === u.id ? '…' : r}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}