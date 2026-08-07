import { z } from 'zod';
import { Priority, ProjectStatus } from '@prisma/client';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name is required'),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  priority: z.nativeEnum(Priority).optional(),
  managerId: z.string().uuid('Invalid manager id'),
  memberIds: z.array(z.string().uuid()).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  priority: z.nativeEnum(Priority).optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
});

export const addMemberSchema = z.object({
  userId: z.string().uuid('Invalid user id'),
});
