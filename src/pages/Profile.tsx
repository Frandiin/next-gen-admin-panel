import { ClientLayout } from "@/components/layouts/ClientLayout";
import { User, Post, Comment, Category } from "@/types";
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { postsApi, categoriesApi, authApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Trash2, Loader2, ImagePlus, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PostMedia } from "@/components/PostMedia";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comment, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const limit = 6;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    published: false,
    coverImage: "",
    categoryId: undefined as number | undefined,
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [removeCover, setRemoveCover] = useState(false);

  // Delete Dialog State
  const [deletingPost, setDeletingPost] = useState<Post | null>(null);

  // Filter State
  const [showPublished, setShowPublished] = useState(true);
  const [showDrafts, setShowDrafts] = useState(true);

  const isOwnProfile = currentUser?.id === Number(id);

  const loadProfile = async () => {
    if (!id) return;
    try {
      const [userData, categoriesData, postData, commentData] =
        await Promise.all([
          authApi.getProfileById(Number(id)),
          categoriesApi.getAll(),
          postsApi.getPostUserId(currentUser.id),
          postsApi.getComments(Number(id)),
        ]);
      setUser(userData);
      setCategories(categoriesData);
      setPosts(postData.data);
      setComments(commentData);
    } catch (err) {
      setError("Usuário não encontrado");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [id, page]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditModal = (post: Post) => {
    setEditingPost(post);
    setEditForm({
      title: post.title,
      content: post.content || "",
      published: post.published,
      coverImage: post.coverImage || "",
      categoryId: post.categoryId,
    });
    setCoverFile(null);
    setCoverPreview(post.coverImage || null);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingPost(null);
    setCoverFile(null);
    setCoverPreview(null);
  };

  const handleUpdatePost = async () => {
    if (!editingPost || !editForm.title.trim()) {
      toast({
        title: "Erro",
        description: "O título é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let coverImageUrl: string | undefined;

      if (coverFile) {
        coverImageUrl = await postsApi.uploadCover(coverFile);
      }

      const postData = {
        title: editForm.title,
        content: editForm.content,
        published: editForm.published,
        categoryId: editForm.categoryId,
        ...(coverImageUrl && { coverImage: coverImageUrl }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await postsApi.update(editingPost.id!, postData as any);

      toast({
        title: "Sucesso!",
        description: "Post atualizado com sucesso",
      });

      closeEditModal();
      loadProfile();
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar o post. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!deletingPost) return;
    try {
      await postsApi.delete(deletingPost.id!);
      toast({ title: "Post deletado com sucesso!" });
      setDeletingPost(null);
      loadProfile();
    } catch (error) {
      toast({
        title: "Erro ao deletar post",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (p.published && showPublished) return true;
    if (!p.published && showDrafts && isOwnProfile) return true;
    if (p.published && !showPublished) return false;
    return false;
  });

  if (loading)
    return (
      <div className="text-center py-16 text-gray-500">
        Carregando perfil...
      </div>
    );
  if (error)
    return <div className="text-center py-16 text-red-500">{error}</div>;
  if (!user)
    return (
      <div className="text-center py-16 text-gray-500">
        Usuário não encontrado
      </div>
    );

  return (
    <ClientLayout>
      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* LADO ESQUERDO - CARD DO PERFIL */}
        <div className="bg-white dark:bg-card p-6 rounded-2xl shadow space-y-4 h-fit sticky top-6">
          <div className="flex flex-col items-center text-center">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-28 h-28 rounded-full object-cover shadow"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-300 flex items-center justify-center text-4xl font-bold text-gray-700 shadow">
                {user.name.charAt(0)}
              </div>
            )}

            <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground mt-3">
              {user.name}
            </h1>
            <p className="text-gray-500 dark:text-muted-foreground">
              {user.email}
            </p>
            <span className="text-xs bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground px-3 py-1 rounded-full font-medium">
              {user.role}
            </span>
          </div>

          <div className="border-t pt-4">
            <p className="text-gray-700 dark:text-foreground text-sm">
              <strong>Posts:</strong> {user.posts?.length || 0}
            </p>
            <p className="text-gray-700 dark:text-foreground text-sm">
              <strong>Comentários:</strong> {user.comments?.length || 0}
            </p>
          </div>

          {/* Filtros (apenas para o próprio perfil) */}
          {isOwnProfile && (
            <div className="border-t pt-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-foreground">
                Filtrar posts:
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant={showPublished ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowPublished(!showPublished)}
                  className="gap-1"
                >
                  <Eye className="h-3 w-3" />
                  Publicados
                </Button>
                <Button
                  variant={showDrafts ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowDrafts(!showDrafts)}
                  className="gap-1"
                >
                  <EyeOff className="h-3 w-3" />
                  Rascunhos
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="md:col-span-2 space-y-10">
          {/* POSTS */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-foreground">
              Posts
            </h2>

            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredPosts.map((post: Post) => (
                  <div
                    key={post.id}
                    className="bg-white dark:bg-card rounded-xl shadow hover:shadow-md transition-all overflow-hidden"
                  >
                    <div className="p-5">
                      {/* Tags */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge
                          variant={post.published ? "default" : "secondary"}
                        >
                          {post.published ? "Publicado" : "Rascunho"}
                        </Badge>
                        {post.category && (
                          <Badge variant="outline">{post.category.name}</Badge>
                        )}
                      </div>
                      {post.coverImage && (
                        <PostMedia
                          url={
                            post.coverImage ? `${post.coverImage}` : undefined
                          }
                          alt={post.title}
                          variant="card"
                        />
                      )}

                      {/* Title & Content */}
                      <Link to={`/posts/${post.slug}`}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-foreground hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                      </Link>

                      {post.content && (
                        <p className="text-gray-500 dark:text-muted-foreground mt-2 line-clamp-2">
                          {post.content.substring(0, 150)}...
                        </p>
                      )}

                      {/* Date */}
                      {post.createdAt && (
                        <p className="text-xs text-muted-foreground mt-3">
                          {format(
                            new Date(post.createdAt),
                            "d 'de' MMMM, yyyy",
                            { locale: ptBR }
                          )}
                        </p>
                      )}

                      {/* Actions (only for own posts) */}
                      {isOwnProfile && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(post)}
                            className="gap-1"
                          >
                            <Pencil className="h-3 w-3" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingPost(post)}
                            className="gap-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                            Excluir
                          </Button>
                        </div>
                      )}

                      {/* Comentários */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="mt-4 border-t pt-4">
                          <h4 className="font-semibold text-gray-700 dark:text-foreground mb-2">
                            Comentários ({post.comments.length}):
                          </h4>
                          <div className="space-y-2">
                            {post.comments
                              .slice(0, 3)
                              .map((comment: Comment) => (
                                <div
                                  key={comment.id}
                                  className="text-gray-700 dark:text-muted-foreground text-sm"
                                >
                                  <Link
                                    to={`/profile/${comment.author?.id}`}
                                    className="font-semibold text-primary hover:underline"
                                  >
                                    {comment.author?.name}:
                                  </Link>{" "}
                                  {comment.content}
                                </div>
                              ))}
                            {post.comments.length > 3 && (
                              <Link
                                to={`/posts/${post.slug}`}
                                className="text-sm text-primary hover:underline"
                              >
                                Ver todos os {post.comments.length}{" "}
                                comentários...
                              </Link>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Nenhum post encontrado.</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Post Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Post</DialogTitle>
            <DialogDescription>
              Atualize as informações do seu post.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Título *</Label>
              <Input
                id="edit-title"
                placeholder="Digite o título do post..."
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            {/* Content */}
            <div className="grid gap-2">
              <Label htmlFor="edit-content">Conteúdo</Label>
              <Textarea
                id="edit-content"
                placeholder="Escreva o conteúdo do seu post..."
                rows={6}
                value={editForm.content}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, content: e.target.value }))
                }
              />
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Categoria</Label>
              <Select
                value={editForm.categoryId?.toString() || ""}
                onValueChange={(value) =>
                  setEditForm((prev) => ({
                    ...prev,
                    categoryId: value ? Number(value) : undefined,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cover Image */}
            <div className="grid gap-2">
              <Label>Imagem de capa</Label>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="edit-cover-upload"
                  className="flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors overflow-hidden"
                >
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImagePlus className="h-8 w-8" />
                      <span className="text-xs">Adicionar</span>
                    </div>
                  )}
                </label>
                <input
                  id="edit-cover-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />
                {!coverFile && coverPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={async () => {
                      try {
                        await postsApi.deleteCover(editingPost.id);
                        setCoverPreview(null);
                        setCoverFile(null);
                        toast({
                          title: "Capa removida com sucesso!",
                        });
                      } catch (err) {
                        toast({
                          title: "Error ao remover!",
                        });
                      }
                    }}
                  >
                    Remover capa atual
                  </Button>
                )}
              </div>
            </div>

            {/* Published Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="edit-published">Publicar</Label>
                <p className="text-sm text-muted-foreground">
                  Marque para publicar o post
                </p>
              </div>
              <Switch
                id="edit-published"
                checked={editForm.published}
                onCheckedChange={(checked) =>
                  setEditForm((prev) => ({ ...prev, published: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeEditModal}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdatePost} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingPost}
        onOpenChange={() => setDeletingPost(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o post "{deletingPost?.title}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ClientLayout>
  );
}
