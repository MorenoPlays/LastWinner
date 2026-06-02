import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { useAuth } from '@/hooks/useAuth'
import { MainNav } from '@/components/main-nav'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      console.error('Login error:', err)
      setError('Não foi possível entrar. Verifique suas credenciais e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
     <div className="min-h-[100dvh] bg-background">
          <MainNav />
    <div className="min-h-[100dvh] bg-slate-950/95 text-slate-100 flex items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl lg:grid-cols-[1.15fr_1fr]">
        <div className="hidden flex-col justify-between rounded-[1.75rem] bg-gradient-to-br from-primary to-violet-600/95 p-10 text-white shadow-lg lg:flex">
          <div>
            <span className="text-xs uppercase tracking-[0.4em] text-primary/80">Bem-vindo de volta</span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight">Faça login e gerencie seus torneios.</h1>
            <p className="mt-4 max-w-xl text-sm text-white/80">
              Acesse sua conta para acompanhar partidas, verificar resultados e manter suas chaves sempre atualizadas.
            </p>
          </div>

          <div className="mt-10">
            <p className="text-sm uppercase tracking-[0.35em] text-white/70">Vantagens</p>
            <ul className="mt-5 space-y-3 text-sm text-white/80">
              <li>• Organize torneios com poucos cliques</li>
              <li>• Veja o progresso das partidas em tempo real</li>
              <li>• Conecte jogadores e publique resultados</li>
            </ul>
          </div>
        </div>

        <div className="rounded-[1.5rem] bg-slate-950/95 p-8 ring-1 ring-white/10 shadow-xl shadow-slate-950/20">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-primary/80">Entrar</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Acesse sua conta</h2>
            <p className="mt-2 text-sm text-slate-400">Entre para continuar gerenciando seus jogos e torneios.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
                {error}
              </div>
            ) : null}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-200">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                className="w-full rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            <p>
              Ainda não tem conta?{' '}
              <Link to="/register" className="font-semibold text-white hover:text-primary">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
