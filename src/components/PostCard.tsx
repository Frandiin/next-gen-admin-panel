import { Link } from "react-router-dom";
import type { Post } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { PostMedia } from "./PostMedia";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();

  return (
    <article className="group relative bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 animate-slide-up">
      <Link to={`/posts/${post.slug}`} className="block">
        <PostMedia
          variant="full"
          url={post.coverImage ? `${post.coverImage}` : undefined}
          alt={post.title}
        />

        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            {post.category && (
              <Badge variant="secondary" className="text-xs">
                {post.category.name}
              </Badge>
            )}
            {!post.published && (
              <Badge
                variant="outline"
                className="text-xs text-muted-foreground"
              >
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
                {post.author.avatar ? (
                  <img
                    src={`${post.author.avatar}`}
                    alt={post.author.name}
                    className="w-3.5 h-3.5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full bg-gray-300 flex items-center justify-center text-[8px] font-bold text-gray-700">
                    {post.author.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {post.authorId === user?.id ? "Eu" : post.author?.name}
              </span>
            )}

            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(post.createdAt), "d 'de' MMM, yyyy", {
                locale: ptBR,
              })}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
