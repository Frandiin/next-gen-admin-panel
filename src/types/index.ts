export interface User {
  id: number;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}
export interface UsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  published: boolean;
  authorId: number;
  categoryId?: number;
  author?: User;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  refresh_token?: string;
  access_token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PostFilters {
  search?: string;
  published?: boolean;
  categoryId?: number;
  page?: number;
  limit?: number;
}
