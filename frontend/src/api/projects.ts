import { apiClient } from './client';
import { ApiResponse, Project, ProjectStatus, Priority } from '@/types';

export const projectsApi = {
  getAll: (params?: { status?: ProjectStatus; search?: string }) =>
    apiClient
      .get<ApiResponse<Project[]>>('/projects', { params })
      .then((res) => res.data.data),

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

  addMember: (id: string, userId: string) =>
    apiClient
      .post<ApiResponse<Project>>(`/projects/${id}/members`, { userId })
      .then((res) => res.data.data),

  removeMember: (id: string, userId: string) =>
    apiClient
      .delete<ApiResponse<Project>>(`/projects/${id}/members/${userId}`)
      .then((res) => res.data.data),
};
