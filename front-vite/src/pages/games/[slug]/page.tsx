
import { useParams } from 'react-router-dom'
import { MainNav } from '../../../components/main-nav'
import { TournamentCard } from '../../../components/tournament-card'
import { Gamepad2, Trophy, Users, Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'

interface GameDetailPageProps {
  id: string
  name: string
  slug: string
  coverUrl: string
  tournaments: Tournament[]
}

interface Tournament {
  id: string
  organizerId: string
  gameId: string
  title: string
  description: string
  format: string
  mode: string
  status: string
  maxPlayers: number
  entryFee: number
  currency: string
  prizePool: number
  startDate: string | null
  endDate: string | null
  bannerUrl: string
  createdAt: string
  updatedAt: string
  participants: Participant[]
}

interface Participant {
  id: string
  tournamentId: string
  userId: string
  status: string
  paymentProof: string | null
  finalPosition: number | null
  joinedAt: string
}

interface GameDetailPageParams {
  slug: string
}


export function GameDetailPage() {
  const { slug } = useParams()
  const [game, setGame] = useState<GameDetailPageProps[]>([]);
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    // Fetch game details
    apiGet(`/game/by-slug/${slug}`)
      .then((games: unknown) => {
          setGame(games as GameDetailPageProps[])
      })
      .then((tournamentsData: unknown) => {
        console.log("tournamentsData: ", tournamentsData)
        if (Array.isArray(tournamentsData)) {
          setTournaments(tournamentsData)
        } else {
          setTournaments([])
        }
       })
       .catch(() => {
        setGame([])
        setTournaments([])
      })
      .catch(() => {
        setGame([])
        setTournaments([])
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-background">
        <MainNav />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Gamepad2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Loading...</h1>
              <p className="text-muted-foreground">Loading game details...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }
  console.log("game: ", game)
  if (!game) {
    
    return (
      <div className="min-h-[100dvh] bg-background">
        <MainNav />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Gamepad2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Game Not Found</h1>
              <p className="text-muted-foreground">The requested game does not exist.</p>
            </div>
          </div>
        </main>
      </div>
    )
  }
  return (
    <div className="min-h-[100dvh] bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Gamepad2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{game.name?.toUpperCase() || 'Game'}</h1>
            <p className="text-muted-foreground">Game tournaments and competitions</p>
          </div>
        </div>

        {game.tournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {game.tournaments.map(tournament => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tournaments available for this game yet.</p>
          </div>
        )}
      </main>
    </div>
  )
}