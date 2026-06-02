import { useEffect, useState } from 'react'
import { MainNav } from '../components/main-nav'
import { Button } from '../ui/button'
import { Trophy } from 'lucide-react'
import { apiPost } from '@/lib/api'
import { useGames } from '@/hooks/useApi'

export function CreateTournamentPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [gameId, setGameId] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(16)
  const [format, setFormat] = useState('SINGLE_ELIMINATION')
  const [mode, setMode] = useState('ONLINE')
  const [status, setStatus] = useState('OPEN')
  const [entryFee, setEntryFee] = useState(0)
  const [currency, setCurrency] = useState('USD')
  const [prizePool, setPrizePool] = useState(0)
  const [bannerUrl, setBannerUrl] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)

  const { games, loading: gamesLoading } = useGames()

  useEffect(() => {
    if (!gameId && games.length > 0) {
      setGameId(games[0].id)
    }
  }, [games, gameId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const token = localStorage.getItem('token')

    const tournamentData: Record<string, unknown> = {
      title,
      description: description || undefined,
      gameId,
      maxPlayers,
      format,
      mode,
      status,
      entryFee: entryFee || undefined,
      currency,
      prizePool: prizePool || undefined,
      bannerUrl: bannerUrl || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }

    try {
      await apiPost('/tournament', tournamentData, token || undefined)
      window.location.href = '/tournaments'
    } catch (error) {
      console.error('Create tournament error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <MainNav />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Criar torneio</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Nome do torneio</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="VALORANT Champions Cup"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Um torneio competitivo para equipes de alto nível."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Jogo</label>
            <select
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              disabled={gamesLoading || games.length === 0}
              className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            >
              {gamesLoading ? (
                <option>Carregando jogos...</option>
              ) : games.length === 0 ? (
                <option>Nenhum jogo disponível</option>
              ) : (
                games.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Jogadores máximos</label>
              <input
                type="number"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value, 10) || 0)}
                className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                min="2"
                max="128"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="DRAFT">Rascunho</option>
                <option value="OPEN">Aberto</option>
                <option value="ONGOING">Em andamento</option>
                <option value="FINISHED">Finalizado</option>
                <option value="CANCELED">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Formato</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="SINGLE_ELIMINATION">Eliminação simples</option>
                <option value="DOUBLE_ELIMINATION">Eliminação dupla</option>
                <option value="ROUND_ROBIN">Todos contra todos</option>
                <option value="SWISS">Suíço</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Modo</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="ONLINE">Online</option>
                <option value="PRESENTIAL">Presencial</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Taxa de inscrição</label>
              <input
                type="number"
                value={entryFee}
                onChange={(e) => setEntryFee(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Moeda</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="BRL">BRL</option>
                <option value="KZ">KZ</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Prêmio</label>
              <input
                type="number"
                value={prizePool}
                onChange={(e) => setPrizePool(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">URL do banner</label>
              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Data de início</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Data de término</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || games.length === 0}>
            {loading ? 'Criando...' : 'Criar torneio'}
          </Button>
        </form>
      </main>
    </div>
  )
}