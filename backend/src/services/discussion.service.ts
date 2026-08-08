import prisma from '../config/db';
import { ApiError } from '../utils/apiError';
import { Role } from '@prisma/client';
import { createNotification } from './notification.service';
import { assertProjectAccess } from './project.service';

export const addDiscussionMessage = async (
  taskId: string,
  authorId: string,
  user: { id: string; role: Role },
  message: string
) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: { include: { members: true } } },
  });
  if (!task) throw ApiError.notFound('Task not found');

  assertProjectAccess(task.project, user);

  const discussion = await prisma.taskDiscussion.create({
    data: { taskId, authorId, message },
    include: { author: { select: { id: true, name: true, email: true, role: true } } },
  });

  // Notify the other party (PM <-> assignee) about the new message
  const notifyUserId =
    task.assigneeId && task.assigneeId !== authorId ? task.assigneeId : task.project.managerId;

  if (notifyUserId && notifyUserId !== authorId) {
    await createNotification({
      userId: notifyUserId,
      type: 'DISCUSSION_ADDED',
      message: `New discussion message on task "${task.title}"`,
    });
  }

  return discussion;
};

export const getDiscussionByTask = async (taskId: string, user: { id: string; role: Role }) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: { include: { members: true } } },
  });
  if (!task) throw ApiError.notFound('Task not found');

  assertProjectAccess(task.project, user);

  return prisma.taskDiscussion.findMany({
    where: { taskId },
    include: { author: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { createdAt: 'asc' },
  });
};
