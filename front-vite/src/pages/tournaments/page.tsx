import { useTournaments } from '@/hooks/useApi'
import { MainNav } from '../../components/main-nav'
import { TournamentCard } from '../../components/tournament-card'
import { Trophy, Search, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'



export function TournamentsPage() {
  const { tournaments, loading, error } = useTournaments()
  const [search, setSearch] = useState('')
  const {user, loading: authLoading} = useAuth()


  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-background">
        <MainNav />
        <main className="container mx-auto px-4 py-6">
          <p className="text-foreground">Carregando torneios...</p>
        </main>
      </div>
    )
  }
  //console.log("tournaments: ", tournaments)
  return (
    <div className="min-h-[100dvh] bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              Torneios
            </h1>
            <p className="text-muted-foreground">Navegue por todos os torneios competitivos</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {user?.role === 'ADMIN' || user?.role === 'organizer' ? (
              <Link
                to="/tournament/create"
                className="
                  flex items-center justify-center gap-2
                  px-4 py-2
    rounded-lg
    bg-primary
    text-primary-foreground
    text-sm font-medium
    hover:bg-primary/90
    transition-colors
    sm:w-auto
    w-full
  "
>
  <Plus className="h-4 w-4" />
  Criar Torneio
</Link>
) : null}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
  type="search"
  placeholder="Buscar torneios..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="
    w-full
    pl-10
    pr-4
    py-2
    rounded-lg
    bg-card/50
    border
    border-border/50
    text-foreground
    placeholder:text-muted-foreground
    focus:outline-none
    focus:ring-2
    focus:ring-primary/50
  "
/>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-destructive mb-4">Erro de API: {error}. Exibindo dados de exemplo.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map(t => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      </main>
    </div>
  )
}