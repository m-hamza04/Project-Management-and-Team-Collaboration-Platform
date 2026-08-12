import { apiClient } from './client';
import { ApiResponse } from '@/types';
import { ChatMessage } from '@/types/chat';

export const messagesApi = {
  getByProject: (projectId: string) =>
    apiClient
      .get<ApiResponse<ChatMessage[]>>(`/projects/${projectId}/messages`)
      .then((res) => res.data.data),
};
