import { MainNav } from '../components/main-nav'
import { PostCard } from '../social/post-card'
import { CreatePost } from '../social/create-post'
import { mockPosts } from '@/lib/mock-data'
import { MessageSquare } from 'lucide-react'

export function PostsPage() {
  const posts = mockPosts

  return (
    <div className="min-h-[100dvh] bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Publicações</h1>
        </div>

        <CreatePost className="mb-6" />

        <div className="space-y-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </main>
    </div>
  )
}