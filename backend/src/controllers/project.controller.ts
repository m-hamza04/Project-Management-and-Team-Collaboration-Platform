import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import * as projectService from '../services/project.service';
import { ProjectStatus } from '@prisma/client';

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.createProject(req.body);
  sendSuccess(res, 201, 'Project created', project);
});

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const { status, search } = req.query;
  const projects = await projectService.getProjects(req.user!, {
    status: status as ProjectStatus | undefined,
    search: search as string | undefined,
  });
  sendSuccess(res, 200, 'Projects fetched', projects);
});

export const getProjectById = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.getProjectById(req.params.id, req.user!);
  sendSuccess(res, 200, 'Project fetched', project);
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.updateProject(req.params.id, req.user!, req.body);
  sendSuccess(res, 200, 'Project updated', project);
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  await projectService.deleteProject(req.params.id);
  sendSuccess(res, 200, 'Project deleted');
});

export const addMember = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.addMember(req.params.id, req.body.userId, req.user!);
  sendSuccess(res, 200, 'Member added', project);
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.removeMember(req.params.id, req.params.userId, req.user!);
  sendSuccess(res, 200, 'Member removed', project);
});
