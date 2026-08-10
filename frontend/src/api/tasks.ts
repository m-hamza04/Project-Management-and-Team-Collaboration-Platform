import { apiClient } from './client';
import { ApiResponse, Task, TaskStatus, Priority } from '@/types';

export const tasksApi = {
  getAll: (params?: { projectId?: string; status?: TaskStatus; assigneeId?: string }) =>
    apiClient.get<ApiResponse<Task[]>>('/tasks', { params }).then((res) => res.data.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Task>>(`/tasks/${id}`).then((res) => res.data.data),

  create: (data: {
    title: string;
    description?: string;
    projectId: string;
    assigneeId?: string;
    priority?: Priority;
    dueDate?: string;
  }) => apiClient.post<ApiResponse<Task>>('/tasks', data).then((res) => res.data.data),

  update: (id: string, data: Partial<Task>) =>
    apiClient.patch<ApiResponse<Task>>(`/tasks/${id}`, data).then((res) => res.data.data),

  updateStatus: (id: string, status: TaskStatus) =>
    apiClient
      .patch<ApiResponse<Task>>(`/tasks/${id}/status`, { status })
      .then((res) => res.data.data),

  remove: (id: string) => apiClient.delete(`/tasks/${id}`),
};
