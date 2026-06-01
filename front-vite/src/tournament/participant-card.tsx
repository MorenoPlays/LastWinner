import { Participant } from '@/lib/types'
import { UserAvatar } from '../social/user-avatar'
import { cn } from '@/lib/utils'
import { Check, UserPlus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { apiPut } from '@/lib/api'

interface ParticipantCardProps {
  participants: Participant[]
  className?: string
}

export function ParticipantList({ participants, className }: ParticipantCardProps) {
  const { user: authUser } = useAuth()

  const handleApprove = async (participantId: string) => {
    try {
      const token = localStorage.getItem('token')
      await apiPut(`/tournament-participant/${participantId}/approve`, {}, token || undefined)
      // Refresh the participant list by triggering a re-fetch in the parent component
      window.location.reload()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao aprovar participação.')
    }
  }

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {participants.map(participant => (
        <div 
          key={participant.id}
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50',
            participant.status === 'winner' && 'bg-success/10 border-success/30',
            participant.status === 'pending' && 'bg-warning/10 border-warning/30'
          )}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {participant.is_team ? (
                <>
                  <span className="font-semibold text-foreground">
                    {participant.team?.name || 'Unknown Team'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {participant.team?.tag}
                  </span>
                </>
              ) : (
                <>
                  <UserAvatar user={participant.user!} size="sm" />
                  <span className="ml-2">
                    <span className="font-semibold text-foreground">
                      {participant.user?.display_name || participant.user?.username || 'Unknown User'}
                    </span>
                  </span>
                </>
              )}
              {authUser && (authUser.role === 'ADMIN' || authUser.id === participant.tournament_id) && participant.status === 'pending' && (
                <button
                  onClick={() => handleApprove(participant.id)}
                  className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded bg-green-500 text-white text-xs font-medium hover:bg-green-600"
                >
                  <Check className="h-3 w-3" />
                  Aprovar
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>W: {participant.wins}</span>
              <span>L: {participant.losses}</span>
              {participant.status === 'pending' && (
                <span className="text-warning">Pendente</span>
              )}
              {participant.status === 'checked_in' && (
                <span className="text-success">Confirmado</span>
              )}
              {participant.status === 'eliminated' && (
                <span className="text-destructive">Eliminado</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}