import { useParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs'
import { MainNav } from '../../../components/main-nav'
import { TournamentHeader } from '../../../components/tournament/tournament-header'
import { TournamentOverview } from '../../../components/tournament/tournament-overview'
import { ParticipantList } from '../../../components/tournament/participant-card'
import { TournamentRules } from '../../../components/tournament/tournament-rules'
import { BracketView } from '../../../components/tournament/bracket-view'
import { MatchScoreModal } from '../../../components/tournament/MatchScoreModal'
import { Button } from '../../../ui/button'
import { LayoutGrid, Users, ScrollText, Play, UserPlus, Trophy, Tornado, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPatch, apiSetMatchWinner } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { Link } from 'react-router-dom'
import type { Tournament, Participant, BracketData, User, Match } from '@/lib/types'

interface ApiUser {
  id: string
  username: string
  email: string
  role: string
  avatarUrl?: string | null
  country?: string | null
}

interface ApiTournament {
  id: string
  title: string
  description?: string
  entryFee?: number
  gameId: string
  format?: string
  status?: string
  maxPlayers?: number
  teamSize?: number
  prizePool?: number
  currency?: string
  startDate?: string
  endDate?: string
  bannerUrl?: string | null
  organizer?: ApiUser
  streamUrl?: string | null
  isFeatured?: boolean
  participants?: any[]
  brackets?: {
    id: string
    type: string
    matches: any[]
  }[]
}

function mapUser(apiUser: ApiUser | undefined) {
  if (!apiUser) return { id: '', username: 'Unknown', display_name: 'Unknown', avatar_url: null, country_code: null }
  return {
    id: apiUser.id,
    username: apiUser.username || 'unknown',
    display_name: apiUser.username || 'Unknown',
    avatar_url: apiUser.avatarUrl || null,
    country_code: apiUser.country || null,
  }
}

function mapTournamentFormat(format?: string): Tournament['format'] {
  const formatMap: Record<string, Tournament['format']> = {
    'SINGLE_ELIMINATION': 'single_elimination',
    'DOUBLE_ELIMINATION': 'double_elimination',
    'ROUND_ROBIN': 'round_robin',
    'SWISS': 'swiss',
    'single_elimination': 'single_elimination',
    'double_elimination': 'double_elimination',
    'round_robin': 'round_robin',
    'swiss': 'swiss',
  }
  return formatMap[format?.toUpperCase() || ''] || 'single_elimination'
}

function mapTournamentStatus(status?: string): Tournament['status'] {
  const statusMap: Record<string, Tournament['status']> = {
    'draft': 'draft',
    'open': 'registration',
    'ongoing': 'in_progress',
    'finished': 'completed',
    'canceled': 'cancelled',
  }
  return statusMap[status?.toLowerCase() || ''] || 'draft'
}

export function TournamentPage() {
  const { id } = useParams()
  const { user: authUser } = useAuth()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [bracketData, setBracketData] = useState<BracketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [starting, setStarting] = useState(false)
  const [openingRegistration, setOpeningRegistration] = useState(false)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [users, setUsers] = useState<{ id: string; username: string; display_name: string }[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [addingUserId, setAddingUserId] = useState<string | null>(null)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [showWinnerModal, setShowWinnerModal] = useState(false)

  useEffect(() => {
    if (!id) return

    apiGet<ApiTournament>(`/tournament/${id}`)
      .then(apiTournament => {
        console.log('API Tournament data:', apiTournament)
        const mapped: Tournament = {
          id: apiTournament.id,
          title: apiTournament.title || 'Tournament',
          slug: apiTournament.title?.toLowerCase().replace(/\s+/g, '-') || 'tournament',
          description: apiTournament.description || '',
          entryFee: apiTournament.entryFee || null,
          game: {
            id: apiTournament.gameId || 'g1',
            name: 'Game',
            slug: 'game',
            icon_url: null,
            banner_url: null,
          },
          format: mapTournamentFormat(apiTournament.format),
          status: mapTournamentStatus(apiTournament.status),
          maxPlayers: apiTournament.maxPlayers || 16,
          //participants: apiTournament.participants?.length || 0,
          team_size: apiTournament.teamSize || 5,
          prizePool: apiTournament.prizePool || null,
          currency: apiTournament.currency || 'USD',
          registration_start: '',
          registration_end: '',
          startDate: apiTournament.startDate || new Date().toISOString(),
          endDate: apiTournament.endDate || null,
          rules: '',
          bannerUrl: apiTournament.bannerUrl || null,
          organizer: mapUser(apiTournament.organizer),
          stream_url: apiTournament.streamUrl || null,
          is_featured: apiTournament.isFeatured || false,
          participants: (apiTournament.participants || []).map((p: any, i: number) => {
            const statusMap: Record<string, Participant['status']> = {
              'REGISTERED': 'checked_in',
              'PENDING': 'pending',
              'CHECKED_IN': 'checked_in',
              'ELIMINATED': 'eliminated',
              'WINNER': 'winner',
            }
            return {
              id: p.id,
              tournament_id: apiTournament.id,
              user: p.userId ? {
                id: p.userId,
                username: p.user?.username || 'unknown',
                display_name: p.user?.username || 'Unknown',
                avatar_url: p.user?.avatarUrl || null,
                country_code: p.user?.country || null,
                email: p.user?.email,
                role: p.user?.role,
                elo: p.user?.elo,
                wins: p.user?.wins || 0,
                losses: p.user?.losses || 0,
                isVerified: p.user?.isVerified,
                phoneNumber: p.user?.phoneNumber,
                country: p.user?.country,
                bio: p.user?.bio,
                createdAt: p.user?.createdAt,
                updatedAt: p.user?.updatedAt,
                avatarUrl: p.user?.avatarUrl
              } : null,
              team: p.teamId ? {
                id: p.teamId,
                name: p.team?.name || 'Unknown Team',
                tag: p.team?.tag || '',
                logo_url: p.team?.logoUrl || null,
                captain: p.team?.captain ? {
                  id: p.team?.captain?.id || '',
                  username: p.team?.captain?.username || 'unknown',
                  display_name: p.team?.captain?.username || 'Unknown',
                  avatar_url: p.team?.captain?.avatarUrl || null,
                  country_code: p.team?.captain?.countryCode || null,
                  email: p.team?.captain?.email,
                  role: p.team?.captain?.role,
                  elo: p.team?.captain?.elo,
                  wins: p.team?.captain?.wins || 0,
                  losses: p.team?.captain?.losses || 0,
                  isVerified: p.team?.captain?.isVerified,
                  phoneNumber: p.team?.captain?.phoneNumber,
                  country: p.team?.captain?.country,
                  bio: p.team?.captain?.bio,
                  createdAt: p.team?.captain?.createdAt,
                  updatedAt: p.team?.captain?.updatedAt,
                  avatarUrl: p.team?.captain?.avatarUrl
                } : {
                  id: 'unknown-captain',
                  username: 'unknown',
                  display_name: 'Unknown',
                  avatar_url: null,
                  country_code: null
                } as User,
                members: p.team?.members?.map((m: any) => ({
                  id: m.id,
                  username: m.username || 'unknown',
                  display_name: m.username || 'Unknown',
                  avatar_url: m.avatarUrl || null,
                  country_code: m.countryCode || null,
                })) || [],
              } : null,
              seed: p.seed || i + 1,
              status: statusMap[p.status?.toUpperCase() || 'CHECKED_IN'] || 'checked_in',
              checked_in_at: p.joinedAt || null,
              wins: p.wins || 0,
              losses: p.losses || 0,
              is_team: !!p.teamId,
            }
          })
        }
        setTournament(mapped)

        // Map bracket data
        if (apiTournament.brackets && apiTournament.brackets.length > 0) {
          // Take the first bracket (assuming single bracket per tournament)
          const bracket = apiTournament.brackets[0];
          
          // Group matches by round number
          const matchesByRound: Record<number, Match[]> = {};
          
          bracket.matches.forEach((match: any) => {
            const roundNum = match.roundNumber || 1;
            if (!matchesByRound[roundNum]) {
              matchesByRound[roundNum] = [];
            }
            matchesByRound[roundNum].push({
              id: match.id,
              tournament_id: apiTournament.id,
              round: match.roundNumber,
              match_number: match.matchNumber,
              bracket_position: '',
              participant1: match.player1 ? {
                id: match.player1.id,
                user: {
                  ...mapUser(match.player1),
                  wins: 0,
                  losses: 0,
                },
              } as any : null,
              participant2: match.player2 ? {
                id: match.player2.id,
                user: {
                  ...mapUser(match.player2),
                  wins: 0,
                  losses: 0,
                },
              } as any : null,
              winner: match.winnerId ? {
                id: match.winnerId,
                user: { id: match.winnerId, username: 'Winner', display_name: 'W', avatar_url: null, country_code: null },
              } as any : null,
              score1: match.score1,
              score2: match.score2,
              status: match.status?.toLowerCase() || 'pending',
              scheduled_time: null,
              started_at: null,
              completed_at: null,
              stream_url: null,
              vod_url: null,
              next_match_id: match.nextMatchId,
              is_losers_bracket: false,
            });
          });
          
          // Convert to rounds array format expected by BracketView
          const rounds = Object.keys(matchesByRound)
            .map(Number)
            .sort((a, b) => a - b)
            .map(roundNum => ({
              round: roundNum,
              name: `Round ${roundNum}`,
              matches: matchesByRound[roundNum]
            }));
          
          setBracketData({ format: mapped.format, rounds });
        } else {
          setBracketData(null);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch tournament:', error)
        // Show more detailed error in development
        if (import.meta.env?.DEV) {
          alert(`Failed to load tournament: ${error.message || 'Unknown error'}`)
        }
        setTournament(null)
        // setParticipants([])
        // setBracketMatches([])
        // setWbRounds(0)
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleRegister = async () => {
    if (!id) return
    setRegistering(true)
    try {
      const token = localStorage.getItem('token')
      const userid = authUser?.id   
      if (!userid) throw new Error('User not authenticated')
      await apiPost('/tournament-participant', { tournamentId: id, userId: userid } , token || undefined )
      window.location.reload()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao registar no torneio.')
    } finally {
      setRegistering(false)
    }
  }

  const handleStart = async () => {
    if (!id) return
    setStarting(true)
    try {
      const token = localStorage.getItem('token')
      await apiPost(`/tournament/${id}/start`, {}, token || undefined)
      window.location.reload()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao iniciar torneio.')
    } finally {
      setStarting(false)
    }
  }

  const handleOpenRegistration = async () => {
    if (!id) return
    setOpeningRegistration(true)
    try {
      const token = localStorage.getItem('token')
      await apiPatch(`/tournament/${id}`, { status: 'OPEN' }, token || undefined)
      window.location.reload()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao abrir inscrições.')
    } finally {
      setOpeningRegistration(false)
    }
  }

  const handleOpenAddUserModal = async () => {
    setShowAddUserModal(true)
    setLoadingUsers(true)
    try {
      const token = localStorage.getItem('token')
      const data = await apiGet<any>('/users', token || undefined)
      setUsers(Array.isArray(data) ? data : [])
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao carregar usuários.')
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleAddUserToTournament = async (userId: string) => {
    if (!id) return
    setAddingUserId(userId)
    try {
      const token = localStorage.getItem('token')
      await apiPost('/tournament-participant', { tournamentId: id, userId }, token || undefined)
      setTournament(prev => {
        if (!prev) return prev
        return {
          ...prev,
          participants: [
            ...prev.participants,
            {
              id: `p-${Date.now()}`,
              tournament_id: id,
              user: { id: userId, username: '', display_name: '', avatar_url: null, country_code: null } as any,
              seed: prev.participants.length + 1,
              status: 'checked_in',
              checked_in_at: new Date().toISOString(),
              wins: 0,
              losses: 0,
              is_team: false,
            } as Participant,
          ],
        }
      })
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao adicionar usuário.')
    } finally {
      setAddingUserId(null)
    }
  }

  const handleOpenMatchWinnerModal = (match: Match) => {
    setSelectedMatch(match)
    setShowWinnerModal(true)
  }

  // const handleSetMatchWinner = async (winnerId: string) => {
  //   if (!selectedMatch) return
  //   try {
  //     const token = localStorage.getItem('token')
  //     await apiSetMatchWinner(selectedMatch.id, winnerId, token || undefined)
  //     setTournament(prevTournament => {
  //       if (!prevTournament || !prevTournament.brackets || prevTournament.brackets.length === 0) return prevTournament
  //       const updatedBrackets = prevTournament.brackets.map(bracket => ({
  //         ...bracket,
  //         matches: bracket.matches.map(match => {
  //           if (match.id !== selectedMatch.id) return match
  //           const nextWinner =
  //             match.participant1?.id === winnerId
  //               ? { ...match.participant1 }
  //               : match.participant2?.id === winnerId
  //                 ? { ...match.participant2 }
  //                 : match.winner
  //           const updatedMatch = {
  //             ...match,
  //             winner: nextWinner || match.winner,
  //             status: 'completed' as const,
  //           }
  //           return updatedMatch
  //         }),
  //       }))
  //       return {
  //         ...prevTournament,
  //         brackets: updatedBrackets,
  //       }
  //     })
  //     recalculateBracket()
  //     setShowWinnerModal(false)
  //   } catch (err: unknown) {
  //     alert(err instanceof Error ? err.message : 'Erro ao definir vencedor.')
  //   }
  // }

  const recalculateBracket = () => {
    if (!tournament?.id) return
    apiGet<ApiTournament>(`/tournament/${tournament.id}`)
      .then(apiTournament => {
        if (!apiTournament.brackets || apiTournament.brackets.length === 0) {
          setBracketData(null)
          return
        }
        const bracket = apiTournament.brackets[0]
        const matchesByRound: Record<number, Match[]> = {}
        bracket.matches.forEach((match: any) => {
          const roundNum = match.roundNumber || 1
          if (!matchesByRound[roundNum]) matchesByRound[roundNum] = []
          const winnerParticipant =
            match.winnerId === match.player1?.id
              ? {
                  id: match.player1.id,
                  user: {
                    ...mapUser(match.player1),
                    wins: 0,
                    losses: 0,
                  },
                } as any
              : match.winnerId === match.player2?.id
                ? {
                    id: match.player2.id,
                    user: {
                      ...mapUser(match.player2),
                      wins: 0,
                      losses: 0,
                    },
                  } as any
                : null
          matchesByRound[roundNum].push({
            id: match.id,
            tournament_id: apiTournament.id,
            round: match.roundNumber,
            match_number: match.matchNumber,
            bracket_position: '',
            participant1: match.player1
              ? {
                  id: match.player1.id,
                  user: {
                    ...mapUser(match.player1),
                    wins: 0,
                    losses: 0,
                  },
                } as any
              : null,
            participant2: match.player2
              ? {
                  id: match.player2.id,
                  user: {
                    ...mapUser(match.player2),
                    wins: 0,
                    losses: 0,
                  },
                } as any
              : null,
            winner: winnerParticipant,
            score1: match.score1,
            score2: match.score2,
            status: match.status?.toLowerCase() || 'pending',
            scheduled_time: null,
            started_at: null,
            completed_at: null,
            stream_url: null,
            vod_url: null,
            next_match_id: match.nextMatchId,
            is_losers_bracket: false,
          })
        })
        const rounds = Object.keys(matchesByRound)
          .map(Number)
          .sort((a, b) => a - b)
          .map(roundNum => ({
            round: roundNum,
            name: `Round ${roundNum}`,
            matches: matchesByRound[roundNum],
          }))
        setBracketData({ format: mapTournamentFormat(apiTournament.format), rounds })
      })
      .catch(() => {})
  }

  const isRegistered = tournament?.participants.some(p => p.user?.id === authUser?.id)
  const isOrganizer = tournament?.organizer?.id === authUser?.id || authUser?.role === 'ADMIN'

  const handleParticipantApproved = (participantId: string) => {
    setTournament(prev => {
      if (!prev) return prev
      return {
        ...prev,
        participants: prev.participants.map(p =>
          p.id === participantId ? { ...p, status: 'checked_in' as const } : p
        ),
      }
    })
  }

  const finishedTornament = async () => {
    if (!id) return
    try {      const token = localStorage.getItem('token')
      await apiPost(`/tournament/${id}/finish`, {}, token || undefined) 
      window.location.reload()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao finalizar torneio.')
    }
  }


  const handleMatchClick = (match: Match) => {
    if(authUser?.role !== 'ADMIN' && !isOrganizer) return ;
    setSelectedMatch(match)
    setShowWinnerModal(true)
  }

  const handleWinnerSuccess = () => {
    recalculateBracket()
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col">
  <MainNav />

  <div className="pb-24 md:pb-0">
          <p className="text-foreground">Carregando torneio...</p>
        </div>
      </div>
    )
  }
  
  if (!tournament) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col">
  <MainNav />

  <div className="pb-24 md:pb-0">
          <p className="text-foreground">Torneio não encontrado com ID: {id || 'nenhum'}</p>
          {id && (
            <p className="text-xs text-muted-foreground mt-2">
              IDs de torneios disponíveis: verifique a API em /tournament
            </p>
          )}
          <div className="mt-4">
            <Link to="/tournaments" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">
              Ver torneios
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <MainNav />
      <TournamentHeader tournament={tournament} />

     <div className="flex-1 pb-24">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList
  className="
    flex
    w-full
    overflow-x-auto
    whitespace-nowrap
    bg-card
    border
    border-border
    p-1
    gap-1
    scrollbar-hide
  "
>
            <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LayoutGrid className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Visão geral</span>
            </TabsTrigger>
            <TabsTrigger value="bracket" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Trophy className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Chave</span>
            </TabsTrigger>
            <TabsTrigger value="participants" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Participantes</span>
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{tournament?.participants.length}</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ScrollText className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Regras</span>
            </TabsTrigger>
          </TabsList>

           <TabsContent value="overview" className="mt-0">
             <TournamentOverview tournament={tournament} />
             <div className="mt-4 text-xs text-muted-foreground">
               Status: {tournament?.status} | Logged in: {authUser ? 'yes' : 'no'} | ID: {authUser?.id?.substring(0, 8) || 'none'}
             </div>
             
             {/* Status change button for admins/organizers to open registration */}
             {isOrganizer && tournament?.status === 'draft' && (
               <div className="mt-6">
                 <button onClick={handleOpenRegistration}
  className="
  w-full sm:w-auto
  flex items-center justify-center
  gap-2
  px-6 py-3
  rounded-lg
  bg-primary
  text-primary-foreground
  "
>
                   {openingRegistration ? 'Abrindo inscrições...' : 'Abrir inscrições'}
                 </button>
               </div>
             )}
             {isOrganizer && tournament?.status === 'in_progress' && (
               <div className="mt-6">
                 <button  className="
                  w-full sm:w-auto
                  flex items-center justify-center
                  gap-2
                  px-6 py-3
                  rounded-lg
                  bg-primary
                  text-primary-foreground
                  " onClick={finishedTornament}>
                    Finalizar torneio
                  </button>
               </div>
             )}

             {/* Register button for users (non-organizers) */}
             {authUser && !isOrganizer && tournament?.status !== 'completed' && tournament?.status !== 'cancelled' && (
               <div className="mt-6">
                 <button
                   onClick={handleRegister}
                   disabled={registering}
                   className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                 >
                   <UserPlus className="h-5 w-5" />
                   {registering ? 'Registrando...' : isRegistered ? 'Inscrito' : 'Registrar no torneio'}
                 </button>
               </div>
             )}
             
             {/* Start button for organizers/admins when registration is open */}
             {isOrganizer && tournament?.status === 'registration' && (
               <div className="mt-6">
                 <button
                   onClick={handleStart}
                   disabled={starting}
                   className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                 >
                   <Play className="h-5 w-5" />
                   {starting ? 'Iniciando...' : 'Iniciar torneio'}
                 </button>
               </div>
             )}
           </TabsContent>

           <TabsContent value="bracket" className="mt-0">
             <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
               {bracketData && bracketData.rounds.length > 0 ? (
                 <BracketView data={bracketData} onMatchClick={handleMatchClick} />
               ) : (
                 <p className="text-muted-foreground">Chave ainda não gerada. Registre-se e inicie o torneio para ver a chave.</p>
               )}
             </div>
            </TabsContent>

           <TabsContent value="participants" className="mt-0">
            {/* adicionar participantes  */}
            <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Participantes</h2>
                  <p className="text-sm text-muted-foreground">
                    {tournament?.participants.length} participantes inscritos
                  </p>
                </div>
                {isOrganizer && tournament.status === "registration" || tournament.status === "draft" && (
                  <Button onClick={handleOpenAddUserModal} className="w-full sm:w-auto">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar usuário
                  </Button>
                )}
              </div>
              {tournament?.participants.length > 0 ? (
                <ParticipantList participants={tournament?.participants} onApprove={handleParticipantApproved} />
              ) : (
                <p className="text-muted-foreground">Ainda não há participantes</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rules" className="mt-0">
            <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-foreground">Regras do torneio</h2>
                <p className="text-sm text-muted-foreground">
                  Leia todas as regras antes de participar
                </p>
              </div>
              <TournamentRules rules={tournament.rules} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Adicionar usuário ao torneio</h3>
              <button onClick={() => setShowAddUserModal(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            {loadingUsers ? (
              <p className="text-sm text-muted-foreground">Carregando usuários...</p>
            ) : (
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {users.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
                )}
                {users
                  .filter(u => !tournament?.participants.some(p => p.user?.id === u.id))
                  .map(u => (
                    <div key={u.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-3">
                      <span className="text-sm font-medium text-foreground">{u.display_name || u.username}</span>
                      <Button
                        size="sm"
                        onClick={() => handleAddUserToTournament(u.id)}
                        disabled={addingUserId === u.id}
                      >
                        {addingUserId === u.id ? 'Adicionando...' : 'Adicionar'}
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
      {showWinnerModal  && (
        <MatchScoreModal
          match={selectedMatch!}
          isOpen={showWinnerModal}
          onClose={() => setShowWinnerModal(false)}
          onSuccess={handleWinnerSuccess}
        />
      )}
    </div>
  )
}