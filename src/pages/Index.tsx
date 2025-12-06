import React, { useState, useEffect } from "react";
import { ClientLayout } from "@/components/layouts/ClientLayout";
import { PostCard } from "@/components/PostCard";
import { postsApi, categoriesApi } from "@/lib/api";
import type { Post, Category } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus, ImagePlus, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Create Post Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPost, setNewPost] = useState<Partial<Post>>({
    title: "",
    content: "",
    published: true,
    categoryId: undefined,
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [postsData, categoriesData] = await Promise.all([
          postsApi.getAll({ published: true }),
          categoriesApi.getAll(),
        ]);
        setPosts(postsData.data);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const filters: {
        search?: string;
        published: boolean;
        categoryId?: number;
      } = {
        published: true,
      };
      if (search) filters.search = search;
      if (categoryFilter && categoryFilter !== "all")
        filters.categoryId = Number(categoryFilter);

      const data = await postsApi.getAll(filters);
      setPosts(data.data);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const resetCreateForm = () => {
    setNewPost({
      title: "",
      content: "",
      published: true,
      categoryId: undefined,
    });
    setCoverFile(null);
    setCoverPreview(null);
  };

  const handleCreatePost = async () => {
    if (!newPost.title?.trim()) {
      toast({
        title: "Erro",
        description: "O título é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      let coverImageUrl: string | undefined;

      // Upload cover image if selected
      if (coverFile) {
        coverImageUrl = await postsApi.uploadCover(coverFile);
      }

      const postData = {
        title: newPost.title || "",
        content: newPost.content || "",
        published: newPost.published ?? true,
        categoryId: newPost.categoryId,
        ...(coverImageUrl && { coverImage: coverImageUrl }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const createdPost = await postsApi.create(postData as any);

      // Add to posts list if published
      if (createdPost.published) {
        setPosts((prev) => [createdPost, ...prev]);
      }

      toast({
        title: "Sucesso!",
        description: "Post criado com sucesso",
      });

      setIsCreateModalOpen(false);
      resetCreateForm();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar o post. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ClientLayout>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6">
              Descubra histórias que
              <span className="text-gradient"> inspiram</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Explore artigos sobre tecnologia, design e desenvolvimento.
              Aprenda, cresça e se inspire.
            </p>
            {isAuthenticated && (
              <Dialog
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
              >
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2">
                    <Plus className="h-5 w-5" />
                    Criar Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Criar novo post</DialogTitle>
                    <DialogDescription>
                      Preencha os campos abaixo para criar um novo post.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {/* Title */}
                    <div className="grid gap-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        placeholder="Digite o título do post..."
                        value={newPost.title || ""}
                        onChange={(e) =>
                          setNewPost((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                      />
                    </div>

                    {/* Content */}
                    <div className="grid gap-2">
                      <Label htmlFor="content">Conteúdo</Label>
                      <Textarea
                        id="content"
                        placeholder="Escreva o conteúdo do seu post..."
                        rows={6}
                        value={newPost.content || ""}
                        onChange={(e) =>
                          setNewPost((prev) => ({
                            ...prev,
                            content: e.target.value,
                          }))
                        }
                      />
                    </div>

                    {/* Category */}
                    <div className="grid gap-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Select
                        value={newPost.categoryId?.toString() || ""}
                        onValueChange={(value) =>
                          setNewPost((prev) => ({
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
                          htmlFor="cover-upload"
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
                          id="cover-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCoverChange}
                        />
                        {coverFile && (
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground truncate">
                              {coverFile.name}
                            </p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="mt-1 text-destructive"
                              onClick={() => {
                                setCoverFile(null);
                                setCoverPreview(null);
                              }}
                            >
                              Remover
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Published Toggle */}
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="published">Publicar agora</Label>
                        <p className="text-sm text-muted-foreground">
                          Marque para publicar o post imediatamente
                        </p>
                      </div>
                      <Switch
                        id="published"
                        checked={newPost.published || false}
                        onCheckedChange={(checked) =>
                          setNewPost((prev) => ({
                            ...prev,
                            published: checked,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreateModalOpen(false);
                        resetCreateForm();
                      }}
                      disabled={isCreating}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleCreatePost} disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        "Criar Post"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="container mb-12">
        <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>Buscar</Button>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="container pb-16">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-card border rounded-lg p-6 animate-pulse"
              >
                <div className="h-4 bg-muted rounded w-20 mb-4" />
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-full mb-4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Nenhum post encontrado.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts?.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </ClientLayout>
  );
};

export default Index;
