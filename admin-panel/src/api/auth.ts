import { apiClient } from './client';
import { ApiResponse, AdminUser } from '@/types';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient
      .post<ApiResponse<{ user: AdminUser; token: string }>>('/auth/login', { email, password })
      .then((res) => res.data.data),

  me: () => apiClient.get<ApiResponse<AdminUser>>('/auth/me').then((res) => res.data.data),
};
