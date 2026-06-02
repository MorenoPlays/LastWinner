'use client'

import { useAuth } from '@/hooks/useAuth'
import { uploadImageToCloudinary } from '@/lib/cloudinary'
import { apiGet, apiPatch, apiPut } from '@/lib/api'
import type { User } from '@/lib/types'
import { useState, useEffect } from 'react'
import { Shield, Trophy, LogOut, Settings, Mail, Globe, Award } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { MainNav } from '@/components/main-nav'

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

export default function ProfilePage() {
  const { id } = useParams<{ id?: string }>()
  const { user: authUser, logout, refresh } = useAuth()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'profile' | 'stats' | 'admin'>('profile')
  const [allUsers, setAllUsers] = useState<UserProfile[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [changingRole, setChangingRole] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({
    display_name: '',
    email: '',
    phoneNumber: '',
    country: '',
    bio: ''
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setAvatarPreview(user.avatar_url || '')
    }
  }, [user])

  useEffect(() => {
    setLoading(true)
    setProfileError(null)

    if (id) {
      apiGet<any>(`/users/${id}`)
        .then(userData => {
          setUser(mapUserProfile(userData))
        })
        .catch(() => {
          setUser(null)
          setProfileError('not-found')
        })
        .finally(() => setLoading(false))
      return
    }

    if (!authUser) {
      setUser(null)
      setLoading(false)
      return
    }

    setUser(authUser as UserProfile)
    setLoading(false)
  }, [id, authUser])

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

  const isOwner = !!authUser && !!user && user.id === authUser.id
  const isAdmin = authUser?.role === 'ADMIN'
  const initial = user?.username?.[0]?.toUpperCase() || '?'
  const winRate = user?.wins != null && user?.losses != null && (user.wins + user.losses) > 0
    ? ((user.wins / (user.wins + user.losses)) * 100).toFixed(1)
    : 0

  useEffect(() => {
    if (user) {
      setForm({
        display_name: user.display_name || user.username || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        country: user.country || '',
        bio: user.bio || '',
      })
    }
  }, [user])

  useEffect(() => {
    if (!isOwner) {
      setEditMode(false)
    }
  }, [isOwner])

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-background">
        <main className="container mx-auto px-4 py-8 lg:py-16">
          <div className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-background">
        <MainNav />
        <main className="container mx-auto px-4 py-8 lg:py-16">
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            {profileError === 'not-found' ? (
              <>
                <p className="mb-4 text-foreground">Utilizador não encontrado.</p>
                <Link to="/players" className="inline-block rounded-lg bg-primary px-6 py-2 font-semibold text-primary-foreground hover:bg-primary/90">
                  Voltar aos Jogadores
                </Link>
              </>
            ) : (
              <>
                <p className="mb-4 text-foreground">Você precisa estar logado para ver seu perfil.</p>
                <Link to="/login" className="inline-block rounded-lg bg-primary px-6 py-2 font-semibold text-primary-foreground hover:bg-primary/90">
                  Ir para Login
                </Link>
              </>
            )}
          </div>
        </main>
      </div>
    )
  }

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

  const handleSave = async () => {
    if (!user) return
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      alert('Email inválido')
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token de autenticação não encontrado')

      let avatarUrl: string | undefined
      if (avatarFile) {
        const uploadedImage = await uploadImageToCloudinary(avatarFile)
        avatarUrl = uploadedImage.secure_url
      }

      const payload = {
        username: form.display_name,
        email: form.email,
        phoneNumber: form.phoneNumber,
        country: form.country,
        bio: form.bio,
        ...(avatarUrl ? { avatarUrl } : {}),
      }

      await apiPatch(`/auth/me`, payload, token || undefined)
      setUser(prev => prev ? { ...prev, ...payload, avatar_url: avatarUrl ?? prev.avatar_url } : prev)
      refresh()
      setEditMode(false)
      setAvatarFile(null)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  const roleOptions = ['USER', 'ORGANIZER', 'ADMIN'] as const

  return (
    <div className="min-h-[100dvh] bg-background">
        <MainNav />
      <main className="container mx-auto px-4 py-8 lg:py-12">
        {/* Header Card */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="relative h-32 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 sm:h-40" />
          <div className="relative px-6 pb-6 sm:px-8">
            <div className="-mt-12 mb-4 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:-mt-16">
              <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="h-full w-full rounded-2xl object-cover ring-4 ring-background"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-4xl font-extrabold text-primary-foreground shadow-lg sm:text-5xl">
                    {initial}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{user.display_name || user.username}</h1>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
                {user.bio && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{user.bio}</p>}
              </div>
              <div className="flex flex-wrap gap-2 sm:ml-auto">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {user.role || 'USER'}
                </span>
                {user.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                    <Shield className="h-3 w-3" />
                    Verificado
                  </span>
                )}
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors"
                >
                  <LogOut className="h-3 w-3" />
                  Sair
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="mt-6 flex flex-wrap gap-4 border-t border-border pt-6">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                <div>
                  <p className="text-xs text-muted-foreground">ELO Rating</p>
                  <p className="font-bold text-foreground">{user.elo || 1000}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Vitórias</p>
                  <p className="font-bold text-foreground">{user.wins || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-red-500/30" />
                <div>
                  <p className="text-xs text-muted-foreground">Derrotas</p>
                  <p className="font-bold text-foreground">{user.losses || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-blue-500/30" />
                <div>
                  <p className="text-xs text-muted-foreground">Taxa de Vitória</p>
                  <p className="font-bold text-foreground">{winRate}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <div className="flex gap-6 md:gap-8">
            {(['profile', 'stats', ...(isAdmin ? ['admin' as const] : [])] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative pb-3 text-sm font-semibold transition-colors ${
                  tab === t
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'profile' ? 'Perfil' : t === 'stats' ? 'Estatísticas' : 'Administração'}
                {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {tab === 'profile' && (
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Informações Pessoais
                </h2>
                <div>
                  {isOwner ? (
                    !editMode ? (
                      <button
                        onClick={() => setEditMode(true)}
                        className="rounded-md px-3 py-1 bg-primary/10 text-primary text-sm font-semibold"
                      >
                        Editar
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="rounded-md px-3 py-1 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
                        >
                          {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button
                          onClick={() => {
                            setEditMode(false)
                            if (user) {
                              setForm({
                                display_name: user.display_name || user.username || '',
                                email: user.email || '',
                                phoneNumber: user.phoneNumber || '',
                                country: user.country || '',
                                bio: user.bio || '',
                              })
                              setAvatarFile(null)
                              setAvatarPreview(user.avatar_url || '')
                            }
                          }}
                          className="rounded-md px-3 py-1 bg-muted text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    )
                  ) : (
                    <p className="text-xs text-muted-foreground">Visualização de outro utilizador.</p>
                  )}
                </div>
              </div>

              {editMode ? (
                <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Nome</label>
                    <input value={form.display_name} onChange={(e) => setForm(s => ({ ...s, display_name: e.target.value }))} className="mt-1 w-full rounded-md border-border bg-background p-2 text-foreground" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Email</label>
                    <input value={form.email} onChange={(e) => setForm(s => ({ ...s, email: e.target.value }))} className="mt-1 w-full rounded-md border-border bg-background p-2 text-foreground" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Telefone</label>
                    <input value={form.phoneNumber} onChange={(e) => setForm(s => ({ ...s, phoneNumber: e.target.value }))} className="mt-1 w-full rounded-md border-border bg-background p-2 text-foreground" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">País</label>
                    <input value={form.country} onChange={(e) => setForm(s => ({ ...s, country: e.target.value }))} className="mt-1 w-full rounded-md border-border bg-background p-2 text-foreground" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-muted-foreground">Avatar</label>
                    <div className="mt-2 flex flex-col gap-3 rounded-md border border-border bg-background p-4">
                      <div className="flex flex-wrap items-center gap-4">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar preview" className="h-20 w-20 rounded-2xl object-cover" />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted text-xl font-bold text-muted-foreground">?
                          </div>
                        )}
                        <label className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50">
                          Selecionar imagem
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              setAvatarFile(file)
                              const reader = new FileReader()
                              reader.onload = () => setAvatarPreview(reader.result as string)
                              reader.readAsDataURL(file)
                            }}
                            disabled={saving}
                          />
                        </label>
                      </div>
                      {avatarFile && (
                        <p className="text-xs text-green-400">✓ Ficheiro selecionado: {avatarFile.name} (enviado ao submeter)</p>
                      )}
                      <p className="text-xs text-muted-foreground">A imagem será enviada ao Cloudinary quando clicar em Salvar.</p>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-muted-foreground">Bio</label>
                    <textarea value={form.bio} onChange={(e) => setForm(s => ({ ...s, bio: e.target.value }))} className="mt-1 w-full rounded-md border-border bg-background p-2 text-foreground" rows={3} />
                  </div>
                </form>
              ) : (
                <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Username</dt>
                    <dd className="mt-1 text-foreground">{user.username}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      Email
                    </dt>
                    <dd className="mt-1 text-foreground">{user.email || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Função</dt>
                    <dd className="mt-1 inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{user.role}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      País
                    </dt>
                    <dd className="mt-1 text-foreground">{user.country || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Telefone</dt>
                    <dd className="mt-1 text-foreground">{user.phoneNumber || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Membro desde</dt>
                    <dd className="mt-1 text-foreground">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-PT') : '—'}</dd>
                  </div>
                  {user.bio && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bio</dt>
                      <dd className="mt-1 text-foreground">{user.bio}</dd>
                    </div>
                  )}
                </dl>
              )}
            </div>
          </div>
        )}

        {tab === 'stats' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <Trophy className="mx-auto mb-2 h-6 w-6 text-amber-500" />
                <p className="text-3xl font-bold text-foreground">{user.elo || 1000}</p>
                <p className="text-xs text-muted-foreground">ELO Rating</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <Award className="mx-auto mb-2 h-6 w-6 text-green-500" />
                <p className="text-3xl font-bold text-foreground">{user.wins || 0}</p>
                <p className="text-xs text-muted-foreground">Vitórias</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <div className="mx-auto mb-2 h-6 w-6 rounded-full bg-red-500/30" />
                <p className="text-3xl font-bold text-foreground">{user.losses || 0}</p>
                <p className="text-xs text-muted-foreground">Derrotas</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <div className="mx-auto mb-2 h-6 w-6 rounded-full bg-blue-500/30" />
                <p className="text-3xl font-bold text-foreground">{winRate}%</p>
                <p className="text-xs text-muted-foreground">Taxa de Vitória</p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 md:p-8">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Resumo</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de Partidas</span>
                  <span className="font-semibold text-foreground">{(user.wins || 0) + (user.losses || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posição Estimada</span>
                  <span className="font-semibold text-foreground">
                    {user.elo ? (user.elo >= 1200 ? 'Elite' : user.elo >= 1000 ? 'Intermediário' : 'Iniciante') : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'admin' && isAdmin && (
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6 md:p-8">
              <h2 className="mb-2 text-lg font-semibold text-foreground">Gerir Utilizadores</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Altere a função de qualquer utilizador para <span className="font-semibold">USER</span>,{' '}
                <span className="font-semibold">ORGANIZER</span> ou <span className="font-semibold">ADMIN</span>.
              </p>

              {loadingUsers ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : allUsers.length > 0 ? (
                <div className="space-y-3">
                  {allUsers.map((u) => (
                    <div key={u.id} className="flex flex-col gap-4 rounded-lg border border-border bg-muted/30 p-4 sm:flex-row sm:items-center">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-sm font-bold text-primary">
                        {u.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{u.username}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          u.role === 'ADMIN' ? 'bg-destructive/10 text-destructive' :
                          u.role === 'ORGANIZER' ? 'bg-green-500/10 text-green-600' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {u.role}
                        </span>
                        <div className="flex gap-2">
                          {roleOptions.filter((r) => r !== u.role).map((r) => (
                            <button
                              key={r}
                              disabled={changingRole === u.id}
                              onClick={() => handleChangeRole(u.id, r)}
                              className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
                                r === 'ADMIN' ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' :
                                r === 'ORGANIZER' ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' :
                                'bg-muted text-muted-foreground hover:bg-muted/80'
                              }`}
                            >
                              {changingRole === u.id ? '…' : r}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum utilizador encontrado.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
