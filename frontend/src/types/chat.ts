import { User } from '@/types';

export interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  author: Pick<User, 'id' | 'name' | 'email' | 'role'>;
}
