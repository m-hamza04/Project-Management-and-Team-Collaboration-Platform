import { apiClient } from './client';
import { ApiResponse, TaskDiscussion, Attachment, AppNotification, User, Role } from '@/types';

export const discussionsApi = {
  getByTask: (taskId: string) =>
    apiClient
      .get<ApiResponse<TaskDiscussion[]>>(`/tasks/${taskId}/discussions`)
      .then((res) => res.data.data),

  addMessage: (taskId: string, message: string) =>
    apiClient
      .post<ApiResponse<TaskDiscussion>>(`/tasks/${taskId}/discussions`, { message })
      .then((res) => res.data.data),
};

export const attachmentsApi = {
  getByTask: (taskId: string) =>
    apiClient
      .get<ApiResponse<Attachment[]>>(`/tasks/${taskId}/attachments`)
      .then((res) => res.data.data),

  upload: (taskId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient
      .post<ApiResponse<Attachment>>(`/tasks/${taskId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data.data);
  },

  remove: (taskId: string, id: string) =>
    apiClient.delete(`/tasks/${taskId}/attachments/${id}`),
};

export const notificationsApi = {
  getMine: (unreadOnly?: boolean) =>
    apiClient
      .get<ApiResponse<AppNotification[]>>('/notifications', { params: { unreadOnly } })
      .then((res) => res.data.data),

  markAsRead: (id: string) =>
    apiClient.patch<ApiResponse<AppNotification>>(`/notifications/${id}/read`),

  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
};

export const usersApi = {
  getAll: (params?: { role?: Role; search?: string }) =>
    apiClient
      .get<ApiResponse<{ users: User[]; total: number }>>('/users', { params })
      .then((res) => res.data.data),

  create: (data: { name: string; email: string; password: string; role: Role }) =>
    apiClient.post<ApiResponse<User>>('/users', data).then((res) => res.data.data),

  update: (id: string, data: Partial<User>) =>
    apiClient.patch<ApiResponse<User>>(`/users/${id}`, data).then((res) => res.data.data),

  remove: (id: string) => apiClient.delete(`/users/${id}`),
};
