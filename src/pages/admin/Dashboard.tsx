import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { postsApi, categoriesApi, usersApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FolderTree, Users, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    posts: 0,
    categories: 0,
    users: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [posts, categories, users] = await Promise.all([
          postsApi.getAll(),
          categoriesApi.getAll(),
          usersApi.getAll(),
        ]);
        setStats({
          posts: Array.isArray(posts) ? posts.length : posts.data.length,
          categories: categories.length,
          users: Array.isArray(users) ? users.length : users.data.length,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  const statCards = [
    {
      title: "Total de Posts",
      value: stats.posts,
      icon: FileText,
      color: "text-primary",
    },
    {
      title: "Categorias",
      value: stats.categories,
      icon: FolderTree,
      color: "text-accent",
    },
    {
      title: "Usuários",
      value: stats.users,
      icon: Users,
      color: "text-success",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat, index) => (
            <Card
              key={stat.title}
              className="animate-slide-up"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-8 bg-muted rounded w-16 animate-pulse" />
                ) : (
                  <div className="text-3xl font-bold">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Conecte-se à API para visualizar atividades recentes.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
