import prisma from '../config/db';
import { ApiError } from '../utils/apiError';
import { Role } from '@prisma/client';
import { assertProjectAccess } from './project.service';

const messageInclude = {
  author: { select: { id: true, name: true, email: true, role: true } },
};

export const createMessage = async (
  projectId: string,
  authorId: string,
  user: { id: string; role: Role },
  content: string
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true },
  });
  if (!project) throw ApiError.notFound('Project not found');

  assertProjectAccess(project, user);

  return prisma.message.create({
    data: { projectId, authorId, content },
    include: messageInclude,
  });
};

export const getMessagesByProject = async (
  projectId: string,
  user: { id: string; role: Role }
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true },
  });
  if (!project) throw ApiError.notFound('Project not found');

  assertProjectAccess(project, user);

  return prisma.message.findMany({
    where: { projectId },
    include: messageInclude,
    orderBy: { createdAt: 'asc' },
    take: 100, // most recent 100 — older history can be paginated later if needed
  });
};
