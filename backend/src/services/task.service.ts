import prisma from '../config/db';
import { ApiError } from '../utils/apiError';
import { Priority, Role, TaskStatus } from '@prisma/client';
import { createNotification } from './notification.service';
import { assertProjectAccess } from './project.service';

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true } },
  creator: { select: { id: true, name: true, email: true } },
  project: { select: { id: true, name: true, managerId: true } },
  _count: { select: { discussions: true } },
};

interface CreateTaskInput {
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  priority?: Priority;
  dueDate?: Date;
}

// Only the Project Manager who owns the project (or Admin) can create tasks
export const createTask = async (
  input: CreateTaskInput,
  creator: { id: string; role: Role }
) => {
  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
    include: { members: true },
  });
  if (!project) throw ApiError.notFound('Project not found');

  if (creator.role !== Role.ADMIN && project.managerId !== creator.id) {
    throw ApiError.forbidden('Only the assigned Project Manager can create tasks for this project');
  }

  if (input.assigneeId) {
    const isMember = project.members.some((m) => m.userId === input.assigneeId);
    if (!isMember) {
      throw ApiError.badRequest('Assignee must be a member of this project');
    }
  }

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      projectId: input.projectId,
      assigneeId: input.assigneeId,
      priority: input.priority ?? Priority.MEDIUM,
      dueDate: input.dueDate,
      creatorId: creator.id,
    },
    include: taskInclude,
  });

  if (input.assigneeId) {
    await createNotification({
      userId: input.assigneeId,
      type: 'TASK_ASSIGNED',
      message: `You have been assigned a new task: "${task.title}"`,
    });
  }

  return task;
};

export const getTasks = async (
  user: { id: string; role: Role },
  query: { projectId?: string; status?: TaskStatus; assigneeId?: string }
) => {
  const where: any = {
    ...(query.projectId ? { projectId: query.projectId } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.assigneeId ? { assigneeId: query.assigneeId } : {}),
  };

  if (user.role === Role.ADMIN) {
    // no extra restriction
  } else if (user.role === Role.PROJECT_MANAGER) {
    where.project = { managerId: user.id };
  } else {
    where.assigneeId = user.id;
  }

  return prisma.task.findMany({
    where,
    include: taskInclude,
    orderBy: { createdAt: 'desc' },
  });
};

export const getTaskById = async (id: string, user: { id: string; role: Role }) => {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      ...taskInclude,
      project: { include: { members: true } },
    },
  });
  if (!task) throw ApiError.notFound('Task not found');

  assertProjectAccess(task.project, user);
  return task;
};

export const updateTask = async (
  id: string,
  user: { id: string; role: Role },
  data: Partial<{
    title: string;
    description: string;
    assigneeId: string;
    priority: Priority;
    dueDate: Date;
  }>
) => {
  const task = await prisma.task.findUnique({ where: { id }, include: { project: true } });
  if (!task) throw ApiError.notFound('Task not found');

  if (user.role !== Role.ADMIN && task.project.managerId !== user.id) {
    throw ApiError.forbidden('Only the Project Manager can edit this task');
  }

  const updated = await prisma.task.update({ where: { id }, data, include: taskInclude });

  if (data.assigneeId && data.assigneeId !== task.assigneeId) {
    await createNotification({
      userId: data.assigneeId,
      type: 'TASK_ASSIGNED',
      message: `You have been assigned to task: "${updated.title}"`,
    });
  }

  return updated;
};

// Team Members move their assigned task through TODO -> IN_PROGRESS -> REVIEW -> COMPLETED
export const updateTaskStatus = async (
  id: string,
  user: { id: string; role: Role },
  status: TaskStatus
) => {
  const task = await prisma.task.findUnique({ where: { id }, include: { project: true } });
  if (!task) throw ApiError.notFound('Task not found');

  const isOwner = task.assigneeId === user.id;
  const isManager = task.project.managerId === user.id;
  if (user.role !== Role.ADMIN && !isOwner && !isManager) {
    throw ApiError.forbidden('You cannot update this task');
  }

  const updated = await prisma.task.update({ where: { id }, data: { status }, include: taskInclude });

  // Notify the project manager whenever status changes
  await createNotification({
    userId: task.project.managerId,
    type: 'TASK_STATUS_UPDATED',
    message: `Task "${updated.title}" status changed to ${status}`,
  });

  return updated;
};

export const deleteTask = async (id: string, user: { id: string; role: Role }) => {
  const task = await prisma.task.findUnique({ where: { id }, include: { project: true } });
  if (!task) throw ApiError.notFound('Task not found');

  if (user.role !== Role.ADMIN && task.project.managerId !== user.id) {
    throw ApiError.forbidden('Only the Project Manager can delete this task');
  }

  await prisma.task.delete({ where: { id } });
};
