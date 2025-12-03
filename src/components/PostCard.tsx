import { Link } from 'react-router-dom';
import type { Post } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group relative bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 animate-slide-up">
      <Link to={`/posts/${post.slug}`} className="block p-6">
        <div className="flex items-center gap-2 mb-3">
          {post.category && (
            <Badge variant="secondary" className="text-xs">
              {post.category.name}
            </Badge>
          )}
          {!post.published && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Rascunho
            </Badge>
          )}
        </div>

        <h2 className="text-xl font-serif font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {post.author && (
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {post.author.name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(post.createdAt), "d 'de' MMM, yyyy", { locale: ptBR })}
          </span>
        </div>
      </Link>
    </article>
  );
}
