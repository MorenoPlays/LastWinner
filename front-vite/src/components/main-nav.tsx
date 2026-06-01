import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Trophy, Video, Users, Settings, Home, Gamepad2 } from 'lucide-react'
import { UserAvatar } from '../social/user-avatar'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/tournaments', label: 'Torneios', icon: Trophy },
  { href: '/clips', label: 'Clipes', icon: Video },
  { href: '/players', label: 'Jogadores', icon: Users },
  { href: '/games', label: 'Jogos', icon: Gamepad2 },
]

export function MainNav() {
  const location = useLocation()
  const { user, loading } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg  from-primary to-accent flex items-center justify-center">
                {/* <Trophy className="h-5 w-5 text-white" /> */}
                <img src="/nav-logo1.png" alt="LastWinner Logo" className="h-5 w-5 object-contain" />
              </div>
              <span className="font-bold text-xl text-foreground">Last Winner</span>
            </Link>

            <nav className="flex items-center gap-1">
              {navItems.map(item => {
                const isActive = location.pathname === item.href ||
                  (item.href !== '/' && location.pathname.startsWith(item.href))
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/settings" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50">
              <Settings className="h-5 w-5" />
            </Link>
            {loading ? (
              <div className="h-8 w-8 rounded-full bg-muted/50 animate-pulse" />
            ) : ""}
            {!loading && user ? (
               <Link to={`/profile`} className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50">
                 <UserAvatar user={user} size="sm" />
                 <span className="hidden sm:inline">{user.display_name || user.username}</span>
               </Link>
             ) : ""}

             {!loading && !user ? (
               <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50">
                 Entrar
               </Link>
             ) : ""}
          </div>
        </div>
      </div>
    </header>
  )
}