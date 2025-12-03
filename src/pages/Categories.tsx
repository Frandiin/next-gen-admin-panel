import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { categoriesApi } from '@/lib/api';
import type { Category } from '@/types';
import { FolderOpen } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesApi.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCategories();
  }, []);

  return (
    <ClientLayout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 animate-slide-up">
            Categorias
          </h1>
          <p className="text-muted-foreground mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Explore posts por categoria
          </p>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card border rounded-lg p-6 animate-pulse">
                  <div className="h-5 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma categoria encontrada.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/?category=${category.id}`}
                  className="group bg-card border rounded-lg p-6 hover:shadow-md hover:border-primary/20 transition-all animate-slide-up"
                  style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                >
                  <h2 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
