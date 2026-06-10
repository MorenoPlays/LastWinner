import { useState } from 'react'
import { MainNav } from '../../components/main-nav'
import { Button } from '../../ui/button'
import { Gamepad2 } from 'lucide-react'
import { apiPost } from '@/lib/api'

export function CreateGamePage() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  // const [iconUrl, setIconUrl] = useState('')
  // const [bannerUrl, setBannerUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const token = localStorage.getItem('token')

    try {
      await apiPost('/game', { name, slug, coverUrl: coverUrl}, token || undefined)
      window.location.href = '/games'
    } catch (error) {
      console.error('Create game error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <MainNav />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Gamepad2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Adicionar jogo</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Nome do jogo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Mortal Kombat 11"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="mortal-kombat-11"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">URL da capa</label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-foreground mb-2">Icon URL</label>
            {/* <input
              type="url"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="https://example.com/icon.png"
            /> }
          </div> */}

          {/* <div>
            <label className="block text-sm font-medium text-foreground mb-2">Banner URL</label>
            <input
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="https://example.com/banner.jpg"
            />
          </div> */}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Adicionando...' : 'Adicionar jogo'}
          </Button>
        </form>
      </main>
    </div>
  )
}