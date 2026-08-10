import { apiClient } from './client';
import { ApiResponse, User } from '@/types';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient
      .post<ApiResponse<{ user: User; token: string }>>('/auth/login', { email, password })
      .then((res) => res.data.data),

  register: (name: string, email: string, password: string) =>
    apiClient
      .post<ApiResponse<{ user: User; token: string }>>('/auth/register', {
        name,
        email,
        password,
      })
      .then((res) => res.data.data),

  me: () => apiClient.get<ApiResponse<User>>('/auth/me').then((res) => res.data.data),
};
