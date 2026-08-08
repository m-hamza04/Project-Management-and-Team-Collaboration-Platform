import prisma from '../config/db';
import { ApiError } from '../utils/apiError';
import { Priority, ProjectStatus, Role } from '@prisma/client';
import { createNotification } from './notification.service';

interface CreateProjectInput {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  priority?: Priority;
  managerId: string;
  memberIds?: string[];
}

const projectInclude = {
  manager: { select: { id: true, name: true, email: true } },
  members: { include: { user: { select: { id: true, name: true, email: true } } } },
  _count: { select: { tasks: true } },
};

// Admin creates a project and assigns a Project Manager
export const createProject = async (input: CreateProjectInput) => {
  const manager = await prisma.user.findUnique({ where: { id: input.managerId } });
  if (!manager || manager.role !== Role.PROJECT_MANAGER) {
    throw ApiError.badRequest('Assigned manager must be a valid Project Manager');
  }

  const project = await prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      startDate: input.startDate,
      endDate: input.endDate,
      priority: input.priority ?? Priority.MEDIUM,
      managerId: input.managerId,
      members: input.memberIds
        ? { create: input.memberIds.map((userId) => ({ userId })) }
        : undefined,
    },
    include: projectInclude,
  });

  await createNotification({
    userId: manager.id,
    type: 'PROJECT_ASSIGNED',
    message: `You have been assigned as manager for project "${project.name}"`,
  });

  return project;
};

// Returns projects scoped to the requesting user's role
export const getProjects = async (user: { id: string; role: Role }, query: { status?: ProjectStatus; search?: string }) => {
  const baseWhere: any = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.search ? { name: { contains: query.search, mode: 'insensitive' as const } } : {}),
  };

  if (user.role === Role.ADMIN) {
    // Admin sees everything
  } else if (user.role === Role.PROJECT_MANAGER) {
    baseWhere.managerId = user.id;
  } else {
    // Team Member: only projects they are a member of
    baseWhere.members = { some: { userId: user.id } };
  }

  return prisma.project.findMany({
    where: baseWhere,
    include: projectInclude,
    orderBy: { createdAt: 'desc' },
  });
};

export const getProjectById = async (id: string, user: { id: string; role: Role }) => {
  const project = await prisma.project.findUnique({ where: { id }, include: projectInclude });
  if (!project) throw ApiError.notFound('Project not found');

  assertProjectAccess(project, user);
  return project;
};

export const updateProject = async (
  id: string,
  user: { id: string; role: Role },
  data: Partial<{
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    priority: Priority;
    status: ProjectStatus;
  }>
) => {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw ApiError.notFound('Project not found');

  // Only Admin or the assigned Project Manager may update
  if (user.role !== Role.ADMIN && project.managerId !== user.id) {
    throw ApiError.forbidden('You do not manage this project');
  }

  return prisma.project.update({ where: { id }, data, include: projectInclude });
};

export const deleteProject = async (id: string) => {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw ApiError.notFound('Project not found');
  await prisma.project.delete({ where: { id } });
};

// Project Manager adds/removes team members from their assigned project
export const addMember = async (projectId: string, userId: string, manager: { id: string; role: Role }) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw ApiError.notFound('Project not found');
  if (manager.role !== Role.ADMIN && project.managerId !== manager.id) {
    throw ApiError.forbidden('You do not manage this project');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');

  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (existing) throw ApiError.conflict('User is already a member of this project');

  await prisma.projectMember.create({ data: { projectId, userId } });

  await createNotification({
    userId,
    type: 'PROJECT_ASSIGNED',
    message: `You have been added to project "${project.name}"`,
  });

  return getProjectById(projectId, manager);
};

export const removeMember = async (projectId: string, userId: string, manager: { id: string; role: Role }) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw ApiError.notFound('Project not found');
  if (manager.role !== Role.ADMIN && project.managerId !== manager.id) {
    throw ApiError.forbidden('You do not manage this project');
  }

  await prisma.projectMember.deleteMany({ where: { projectId, userId } });
  return getProjectById(projectId, manager);
};

// Shared access guard used across services
export const assertProjectAccess = (
  project: { managerId: string; members?: { userId: string }[] },
  user: { id: string; role: Role }
) => {
  if (user.role === Role.ADMIN) return;
  if (user.role === Role.PROJECT_MANAGER && project.managerId === user.id) return;
  if (
    user.role === Role.TEAM_MEMBER &&
    project.members?.some((m) => m.userId === user.id)
  )
    return;

  throw ApiError.forbidden('You do not have access to this project');
};
