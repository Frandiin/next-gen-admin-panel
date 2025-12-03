import axios from 'axios';
import type { User, Post, Category, AuthResponse, PaginatedResponse, PostFilters } from '@/types';

const API_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: async (data: { email: string; password: string; name: string }) => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
  login: async (data: { email: string; password: string }) => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  },
};

// Posts
export const postsApi = {
  getAll: async (filters?: PostFilters) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.published !== undefined) params.append('published', String(filters.published));
    if (filters?.categoryId) params.append('categoryId', String(filters.categoryId));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    
    const response = await api.get<Post[] | PaginatedResponse<Post>>(`/posts?${params}`);
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get<Post>(`/posts/${id}`);
    return response.data;
  },
  getBySlug: async (slug: string) => {
    const response = await api.get<Post>(`/posts/slug/${slug}`);
    return response.data;
  },
  create: async (data: Partial<Post>) => {
    const response = await api.post<Post>('/posts', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Post>) => {
    const response = await api.put<Post>(`/posts/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/posts/${id}`);
  },
};

// Categories
export const categoriesApi = {
  getAll: async () => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },
  create: async (data: Partial<Category>) => {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Category>) => {
    const response = await api.put<Category>(`/categories/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/categories/${id}`);
  },
};

// Users
export const usersApi = {
  getAll: async () => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },
  create: async (data: Partial<User> & { password: string }) => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },
  update: async (id: number, data: Partial<User>) => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/users/${id}`);
  },
};
