// "id": "51f5e4ef-bed8-46a6-b44c-1dec805f7816",
//     "name": "Mortal Kombat 11",
//     "slug": "MK 11",
//     "coverUrl": "https://fanatical.imgix.net/product/original/68310a3e-4b93-45dc-b195-643a7ff53d51.jpeg",
//     "tournaments": [
//         {
//             "id": "b71a3b26-ed0b-4508-9b51-1608aa2ebe2d",
//             "organizerId": "3c8f6823-ff44-4465-8be8-fe1f626e48e0",
//             "gameId": "51f5e4ef-bed8-46a6-b44c-1dec805f7816",
//             "title": "Torre do Zango",
//             "description": "TESTE",
//             "format": "DOUBLE_ELIMINATION",
//             "mode": "PRESENTIAL",
//             "status": "OPEN",
//             "maxPlayers": 8,
//             "entryFee": 5000,
//             "currency": "KZ",
//             "prizePool": 25000,
//             "startDate": null,
//             "endDate": null,
//             "bannerUrl": "https://fanatical.imgix.net/product/original/68310a3e-4b93-45dc-b195-643a7ff53d51.jpeg",
//             "createdAt": "2026-05-27T22:10:52.127Z",
//             "updatedAt": "2026-05-31T15:18:45.567Z",
//             "participants": [
//                 {
//                     "id": "2477b6f4-303b-4eba-ba30-1585f60b16be",
//                     "tournamentId": "b71a3b26-ed0b-4508-9b51-1608aa2ebe2d",
//                     "userId": "7bc7f4a7-06e4-42ae-979a-71e1b159837b",
//                     "status": "CHECKED_IN",
//                     "paymentProof": null,
//                     "finalPosition": null,
//                     "joinedAt": "2026-05-30T23:35:14.820Z"
//                 },
//                 {
//                     "id": "6f7d967f-4f42-43db-92ca-b44728afc401",
//                     "tournamentId": "b71a3b26-ed0b-4508-9b51-1608aa2ebe2d",
//                     "userId": "aa77a046-81e1-45b1-8789-1e65041fd1d0",
//                     "status": "CHECKED_IN",
//                     "paymentProof": null,
//                     "finalPosition": null,
//                     "joinedAt": "2026-05-30T23:42:26.237Z"
//                 },

import { useParams } from 'react-router-dom'
import { MainNav } from '../components/main-nav'
import { TournamentCard } from '../components/tournament-card'
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