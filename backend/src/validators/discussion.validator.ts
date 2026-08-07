import { z } from 'zod';

export const addMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
});
