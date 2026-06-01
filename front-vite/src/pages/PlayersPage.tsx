import { useUsers } from '@/hooks/useApi'
import { MainNav } from '../components/main-nav'
import { UserAvatar } from '../social/user-avatar'
import { cn } from '@/lib/utils'
import { Search, Globe, Trophy, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export function PlayersPage() {
  const { users, loading, error } = useUsers()
  const [search, setSearch] = useState('')

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <main className="container mx-auto px-4 py-6">
          <p className="text-foreground">Carregando jogadores...</p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <main className="container mx-auto px-4 py-6">
          <p className="text-destructive">Erro: {error}</p>
          <p className="text-muted-foreground mt-2">Exibindo dados de exemplo.</p>
        </main>
      </div>
    )
  }

  const displayUsers = users.length > 0 
    ? users 
    : [
        { id: 'u1', username: 'shadowstrike', display_name: 'ShadowStrike', avatar_url: null, country_code: 'US' },
        { id: 'u2', username: 'neonblade', display_name: 'NeonBlade', avatar_url: null, country_code: 'KR' },
        { id: 'u3', username: 'frostbyte', display_name: 'FrostByte', avatar_url: null, country_code: 'DE' },
      ]

  const filteredUsers = displayUsers.filter(u => 
    u.display_name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Jogadores
            </h1>
            <p className="text-muted-foreground">Navegue pelos jogadores competitivos</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg bg-card/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUsers.map(user => (
<Link
               key={user.id}
               to={`/user/${user.id}`}
               className="p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-border transition-all"
             >
              <div className="flex items-center gap-3 mb-3">
                <UserAvatar user={user} size="lg" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{user.display_name}</h3>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
              {user.country_code && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Globe className="h-3 w-3" />
                  {user.country_code}
                </div>
              )}
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}