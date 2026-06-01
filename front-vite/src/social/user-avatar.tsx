import { User } from '@/lib/types'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  user: User
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showName?: boolean
  showUsername?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

const colorStyles = [
  { from: '#06b6d4', to: '#2563eb' },
  { from: '#a855f7', to: '#db2777' },
  { from: '#22c55e', to: '#059669' },
  { from: '#f97316', to: '#dc2626' },
  { from: '#eab308', to: '#d97706' },
]

export function UserAvatar({ 
  user, 
  size = 'md', 
  showName = false, 
  showUsername = false,
  className 
}: UserAvatarProps) {
  const initials = (user.display_name || user.username || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const safeId = user.id || 'default'
  const colorIndex = safeId.charCodeAt(1) % colorStyles.length
  const colorStyle = colorStyles[colorIndex]

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-semibold text-white',
          sizeClasses[size]
        )}
        style={{ background: `linear-gradient(135deg, ${colorStyle.from}, ${colorStyle.to})` }}
      >
        {user.avatar_url ? (
          <img 
            src={user.avatar_url} 
            alt={user.display_name || user.username}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      
      {(showName || showUsername) && (
        <div className="flex flex-col">
          {showName && (
            <span className="font-semibold text-foreground">
              {user.display_name}
            </span>
          )}
          {showUsername && (
            <span className="text-sm text-muted-foreground">
              @{user.username}
            </span>
          )}
        </div>
      )}
    </div>
  )
}