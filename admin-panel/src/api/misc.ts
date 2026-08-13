import { apiClient } from './client';
import { ApiResponse, AdminUser, Project, Task, Role, ProjectStatus, Priority } from '@/types';

export const usersApi = {
  getAll: (params?: { role?: Role; search?: string }) =>
    apiClient
      .get<ApiResponse<{ users: AdminUser[]; total: number }>>('/users', { params })
      .then((res) => res.data.data),

  create: (data: { name: string; email: string; password: string; role: Role }) =>
    apiClient.post<ApiResponse<AdminUser>>('/users', data).then((res) => res.data.data),

  update: (id: string, data: Partial<AdminUser>) =>
    apiClient.patch<ApiResponse<AdminUser>>(`/users/${id}`, data).then((res) => res.data.data),

  remove: (id: string) => apiClient.delete(`/users/${id}`),
};

export const projectsApi = {
  getAll: (params?: { status?: ProjectStatus; search?: string }) =>
    apiClient.get<ApiResponse<Project[]>>('/projects', { params }).then((res) => res.data.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Project>>(`/projects/${id}`).then((res) => res.data.data),

  create: (data: {
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    priority?: Priority;
    managerId: string;
    memberIds?: string[];
  }) => apiClient.post<ApiResponse<Project>>('/projects', data).then((res) => res.data.data),

  update: (id: string, data: Partial<Project>) =>
    apiClient.patch<ApiResponse<Project>>(`/projects/${id}`, data).then((res) => res.data.data),

  remove: (id: string) => apiClient.delete(`/projects/${id}`),
};

export const tasksApi = {
  getAll: (params?: { projectId?: string }) =>
    apiClient.get<ApiResponse<Task[]>>('/tasks', { params }).then((res) => res.data.data),
};
