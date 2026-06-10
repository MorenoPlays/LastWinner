import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../ui/button'
import { useAuth } from '@/hooks/useAuth'
import { MainNav } from '@/components/main-nav'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await register(username, email, password)
      navigate('/')
    } catch (err) {
      console.error('Register error:', err)
      setError('Não foi possível criar sua conta. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-background">
              <MainNav />
    <div className="min-h-[100dvh] bg-slate-950/95 text-slate-100 flex items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl lg:grid-cols-[1.15fr_1fr]">
        <div className="hidden flex-col justify-between rounded-[1.75rem] bg-gradient-to-br from-emerald-500 to-cyan-600/95 p-10 text-white shadow-lg lg:flex">
          <div>
            <span className="text-xs uppercase tracking-[0.4em] text-white/80">Crie sua conta</span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight">Junte-se à comunidade de torneios.</h1>
            <p className="mt-4 max-w-xl text-sm text-white/80">
              Cadastre-se para criar torneios, convidar jogadores e acompanhar resultados em tempo real.
            </p>
          </div>

          <div className="mt-10">
            <p className="text-sm uppercase tracking-[0.35em] text-white/70">Recursos</p>
            <ul className="mt-5 space-y-3 text-sm text-white/80">
              <li>• Gerencie chaves e partidas facilmente</li>
              <li>• Publique resultados e mensagens em tempo real</li>
              <li>• Crie torneios para sua comunidade</li>
            </ul>
          </div>
        </div>

        <div className="rounded-[1.5rem] bg-slate-950/95 p-8 ring-1 ring-white/10 shadow-xl shadow-slate-950/20">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/80">Registre-se</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Crie sua conta agora</h2>
            <p className="mt-2 text-sm text-slate-400">Comece a gerenciar seus torneios e acompanhar cada partida.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
                {error}
              </div>
            ) : null}

            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-slate-200">
                Usuário
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                placeholder="seuusuario"
                required
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-200">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                placeholder="voce@exemplo.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-200">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
              <p className="text-xs text-slate-500">Use ao menos 8 caracteres para uma senha segura.</p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando...' : 'Criar conta'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            <p>
              Já possui conta?{' '}
              <Link to="/login" className="font-semibold text-white hover:text-emerald-300">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
