import { useEffect, useState } from 'react';
import { X, Send, Heart } from 'lucide-react';
import { UserAvatar } from './user-avatar';
import { useAuth } from '@/hooks/useAuth';
import { Post } from '@/lib/types';
import { apiGet, apiPost } from '@/lib/api';

interface CommentsModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded?: (comment: any) => void;
}

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Agora mesmo';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m atrás`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d atrás`;
  return date.toLocaleDateString();
}

export function CommentsModal({ post, isOpen, onClose, onCommentAdded }: CommentsModalProps) {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { user } = useAuth();
  const isTournament = post.type === 'tournament_share' && post.tournament;

  useEffect(() => {
    if (!isOpen) return;

    const fetchComments = async () => {
      setIsLoadingComments(true);
      setLoadError(null);
      try {
        const endpoint = isTournament
          ? `/tournament-message/tournament/${post.tournament?.id}`
          : `/comment/post/${post.id}`;
        const rawComments = await apiGet<any>(endpoint);
        const commentsArray = Array.isArray(rawComments)
          ? rawComments
          : rawComments?.data ?? rawComments;

        if (!Array.isArray(commentsArray)) {
          throw new Error('Invalid comments response');
        }

        setComments(
          commentsArray.map((comment) => ({
            id: comment.id,
            content: comment.content ?? comment.message,
            createdAt: comment.createdAt ?? comment.created_at ?? new Date().toISOString(),
            author: {
              username: comment.user?.username || comment.user?.display_name || 'User',
            },
          })),
        );
      } catch (error: any) {
        console.error('Failed to load comments:', error);
        setLoadError(error?.message ?? 'Could not load comments.');
      } finally {
        setIsLoadingComments(false);
      }
    };

    fetchComments();
  }, [isOpen, isTournament, post.id, post.tournament]);

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const payload = isTournament
      ? { tournamentId: post.tournament!.id, userId: user.id, message: commentText }
      : { postId: post.id, userId: user.id, content: commentText };

    const endpoint = isTournament ? '/tournament-message' : '/comment';

    setIsSubmitting(true);
    try {
      await apiPost(endpoint, payload, token);

      const newComment = {
        id: Math.random().toString(),
        content: commentText,
        createdAt: new Date().toISOString(),
        author: { username: user.username || 'You' },
      };

      setComments((prev) => [newComment, ...prev]);
      setCommentText('');
      if (onCommentAdded) {
        onCommentAdded(newComment);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className=" inset-0 z-10 flex items-center justify-center b1/70 p-3 sm:p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-[980px] max-h-[calc(100vh-2rem)] rounded-[26px] overflow-hidden flex flex-col bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border/50 px-5 py-4 bg-gradient-to-r from-card to-card/50">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Comentários</h2>
            <p className="text-sm text-muted-foreground">{comments.length} comentário{comments.length === 1 ? '' : 's'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Fechar comentários"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          {/* <div className="hidden lg:flex lg:w-1/2 border-r border-border/50 flex-col items-center justify-center bg-muted/20 p-6">
            {post.media_urls?.length > 0 ? (
              <img
                src={post.media_urls[0]}
                alt="Post"
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center p-4">
                <p className="text-center text-sm font-medium text-foreground/70">{post.content}</p>
              </div>
            )}
          </div> */}

          <div className="w-full lg:w-1/2 flex flex-col min-h-0">
            <div className="block lg:hidden border-b border-border/50 bg-muted/10 p-4">
              {post.media_urls?.length > 0 ? (
                <img
                  src={post.media_urls[0]}
                  alt="Post preview"
                  className="w-full h-52 rounded-2xl object-cover mb-4"
                />
              ) : null}
              <div className="flex items-start gap-3">
                <UserAvatar user={post.author} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">{post.author.display_name}</span>
                    <span className="text-muted-foreground text-xs">@{post.author.username}</span>
                  </div>
                  <p className="text-foreground text-sm mt-3 line-clamp-4">{post.content}</p>
                  <span className="text-xs text-muted-foreground mt-3 block">
                    {formatTimeAgo(post.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              <div className="h-full overflow-y-auto p-5 space-y-4">
                {(isLoadingComments || loadError) && (
                  <div className="rounded-2xl border border-border/50 bg-muted/70 p-4 text-sm text-muted-foreground">
                    {isLoadingComments ? 'Carregando comentários...' : loadError}
                  </div>
                )}

                {!isLoadingComments && !loadError && comments.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                      <span className="text-2xl">💬</span>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium">Ainda não há comentários</p>
                    <p className="text-muted-foreground text-xs mt-1">Seja o primeiro a comentar.</p>
                  </div>
                )}

                {!isLoadingComments && comments.length > 0 && (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-3 rounded-3xl border border-border/30 bg-muted/30 p-4 transition-shadow hover:shadow-lg">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-semibold text-foreground text-sm truncate">{comment.author?.username || 'Usuário'}</p>
                            <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
                          </div>
                          <p className="text-foreground text-sm mt-2 break-words">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-border/50 bg-card/95 p-1">
              <div className="flex items-center gap-1">
                <div className=" h-10 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex-shrink-0" />
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitComment();
                  }}
                  className=" flex items-center gap-2 rounded-full bg-muted/50 border border-border/30 px-5 py-1.5 hover:border-border/50 transition-colors focus-within:border-primary/50"
                >
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Adicione um comentário..."
                    className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !commentText.trim()}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Post comment"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
