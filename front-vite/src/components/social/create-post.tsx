import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Image, Video, Trophy, Send, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface CreatePostProps {
  className?: string
  onPost?: (content: string, attachments: string[]) => void
}

type AttachmentItem = {
  id: string
  type: 'image' | 'video'
  name: string
}

export function CreatePost({ className, onPost }: CreatePostProps) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [attachments, setAttachments] = useState<AttachmentItem[]>([])
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const videoInputRef = useRef<HTMLInputElement | null>(null)

  const handleSubmit = () => {
    if (content.trim() || attachments.length > 0) {
      onPost?.(content, attachments.map((item) => item.name))
      setContent('')
      setAttachments([])
      setIsExpanded(false)
    }
  }

  const handleSelectFiles = (type: AttachmentItem['type']) => {
    const input = type === 'image' ? imageInputRef.current : videoInputRef.current
    input?.click()
  }

  const handleFilesChange = (type: AttachmentItem['type'], files: FileList | null) => {
    if (!files?.length) return
    const newAttachments = Array.from(files).map((file) => ({
      id: `${type}-${file.name}-${file.size}`,
      type,
      name: file.name,
    }))
    setAttachments((prev) => [...prev, ...newAttachments])
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id))
  }

  return (
    <div
      className={cn(
        'rounded-3xl border border-border/50 bg-card/80 p-4 shadow-sm shadow-black/5 transition-all',
        isExpanded && 'ring-2 ring-primary/50 border-primary',
        className
      )}
    >
      <div className="flex gap-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold flex-shrink-0 overflow-hidden">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.display_name || user.username}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{(user?.display_name || user?.username || 'U')[0].toUpperCase()}</span>
          )}
        </div>

        <div className="flex-1">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Criar publicação</h3>
              <p className="text-sm text-muted-foreground">Compartilhe momentos, novidades ou atualizações de torneio.</p>
            </div>
            <span className="rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Público
            </span>
          </div>

          <textarea
            placeholder="O que você quer compartilhar hoje?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            rows={isExpanded ? 4 : 1}
            className="w-full rounded-3xl border border-border/50 bg-transparent px-4 py-3 text-foreground placeholder:text-muted-foreground resize-none outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
          />

          {attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center gap-2 rounded-full bg-slate-950/70 px-3 py-2 text-sm text-foreground">
                  <span className="truncate max-w-[10rem]">{attachment.name}</span>
                  <button onClick={() => removeAttachment(attachment.id)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {isExpanded && (
            <div className="mt-4 rounded-3xl border border-border/50 bg-slate-950/60 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectFiles('image')}
                    className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/80 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/100 transition-all"
                  >
                    <Image className="h-4 w-4" />
                    Foto
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectFiles('video')}
                    className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/80 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/100 transition-all"
                  >
                    <Video className="h-4 w-4" />
                    Vídeo
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/80 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/100 transition-all"
                  >
                    <Trophy className="h-4 w-4" />
                    Torneio
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsExpanded(false)
                      setContent('')
                      setAttachments([])
                    }}
                    className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    Limpar
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!content.trim() && attachments.length === 0}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all',
                      content.trim() || attachments.length > 0
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    )}
                  >
                    <Send className="h-4 w-4" />
                    Publicar
                  </button>
                </div>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Dica: adicione uma foto ou vídeo para aumentar o engajamento.
              </p>
            </div>
          )}
        </div>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        multiple
        onChange={(e) => handleFilesChange('image', e.target.files)}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        multiple
        onChange={(e) => handleFilesChange('video', e.target.files)}
      />
    </div>
  )
}
