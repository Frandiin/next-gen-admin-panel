import { useState, useEffect } from 'react';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { PostCard } from '@/components/PostCard';
import { postsApi, categoriesApi } from '@/lib/api';
import type { Post, Category } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Index = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [postsData, categoriesData] = await Promise.all([
          postsApi.getAll({ published: true }),
          categoriesApi.getAll(),
        ]);
        setPosts(Array.isArray(postsData) ? postsData : postsData.data);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const filters: { search?: string; published: boolean; categoryId?: number } = {
        published: true,
      };
      if (search) filters.search = search;
      if (categoryFilter && categoryFilter !== 'all') filters.categoryId = Number(categoryFilter);

      const data = await postsApi.getAll(filters);
      setPosts(Array.isArray(data) ? data : data.data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsLoading(false);
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
              Explore artigos sobre tecnologia, design e desenvolvimento. Aprenda, cresça e se inspire.
            </p>
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
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
              <div key={i} className="bg-card border rounded-lg p-6 animate-pulse">
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
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </ClientLayout>
  );
};

export default Index;
