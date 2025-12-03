import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { postsApi } from '@/lib/api';
import type { Post } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;
      try {
        const data = await postsApi.getBySlug(slug);
        setPost(data);
      } catch (err) {
        setError('Post não encontrado');
      } finally {
        setIsLoading(false);
      }
    };
    loadPost();
  }, [slug]);

  if (isLoading) {
    return (
      <ClientLayout>
        <div className="container max-w-3xl py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-64 bg-muted rounded mt-8" />
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (error || !post) {
    return (
      <ClientLayout>
        <div className="container max-w-3xl py-16 text-center">
          <h1 className="text-2xl font-serif font-bold mb-4">Post não encontrado</h1>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Home
            </Link>
          </Button>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <article className="container max-w-3xl py-12 animate-fade-in">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Link>

        <header className="mb-8">
          {post.category && (
            <Badge variant="secondary" className="mb-4">
              {post.category.name}
            </Badge>
          )}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {post.author && (
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {post.author.name}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {format(new Date(post.createdAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
        </header>

        <div className="prose prose-lg max-w-none">
          <div className="whitespace-pre-wrap text-foreground leading-relaxed">
            {post.content}
          </div>
        </div>
      </article>
    </ClientLayout>
  );
}
