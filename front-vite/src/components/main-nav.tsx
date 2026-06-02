import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Trophy,
  Video,
  Users,
  Settings,
  Home,
  Gamepad2,
} from 'lucide-react'
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
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg">
                <img
                  src="/nav-logo1.png"
                  alt="LastWinner Logo"
                  className="h-5 w-5 object-contain"
                />
              </div>

              <span className="hidden sm:block font-bold text-xl text-foreground">
                Last Winner
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => {
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== '/' &&
                    location.pathname.startsWith(item.href))

                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Link
                to="/settings"
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              >
                <Settings className="h-5 w-5" />
              </Link>

              {loading && (
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted/50" />
              )}

              {!loading && user && (
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted/50"
                >
                  <UserAvatar user={user} size="sm" />

                  <span className="hidden lg:inline text-sm">
                    {user.display_name || user.username}
                  </span>
                </Link>
              )}

              {!loading && !user && (
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                >
                  Entrar
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <div className="flex h-16 items-center justify-around">
          {navItems.map(item => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== '/' &&
                location.pathname.startsWith(item.href))

            const Icon = item.icon

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-2',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="h-5 w-5" />

                <span className="text-[10px] font-medium">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}