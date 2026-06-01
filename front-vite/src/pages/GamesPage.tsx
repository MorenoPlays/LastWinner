import { useGames } from '@/hooks/useApi'
import { MainNav } from '../components/main-nav'
import { GameCard } from '../components/game-card'
import { Gamepad2, Search, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Game } from '@/lib/types'

export function GamesPage() {
  const { games, loading, error } = useGames()
  const [search, setSearch] = useState('')

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <main className="container mx-auto px-4 py-6">
          <p className="text-foreground">Carregando jogos...</p>
        </main>
      </div>
    )
  }

  const displayGames = games.length > 0 
    ? games 
    : [
        { id: 'g1', name: 'VALORANT', slug: 'valorant', icon_url: null, banner_url: null },
        { id: 'g2', name: 'CS2', slug: 'cs2', icon_url: null, banner_url: null },
        { id: 'g3', name: 'League of Legends', slug: 'lol', icon_url: null, banner_url: null },
      ]

  const filteredGames = displayGames.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-primary" />
              Jogos
            </h1>
            <p className="text-muted-foreground">Navegue pelos jogos disponíveis</p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/games/create" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4" />
              Adicionar jogo
            </Link>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="search"
                placeholder="Buscar jogos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg bg-card/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredGames.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </main>
    </div>
  )
}