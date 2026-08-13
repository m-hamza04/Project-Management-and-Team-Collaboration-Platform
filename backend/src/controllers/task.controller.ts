import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import * as taskService from '../services/task.service';
import { TaskStatus } from '@prisma/client';

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.createTask(req.body, req.user!);
  sendSuccess(res, 201, 'Task created', task);
});

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, status, assigneeId } = req.query;
  const tasks = await taskService.getTasks(req.user!, {
    projectId: projectId as string | undefined,
    status: status as TaskStatus | undefined,
    assigneeId: assigneeId as string | undefined,
  });
  sendSuccess(res, 200, 'Tasks fetched', tasks);
});

export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.getTaskById(req.params.id as string, req.user!);
  sendSuccess(res, 200, 'Task fetched', task);
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.updateTask(req.params.id as string, req.user!, req.body);
  sendSuccess(res, 200, 'Task updated', task);
});

export const updateTaskStatus = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.updateTaskStatus(req.params.id as string, req.user!, req.body.status);
  sendSuccess(res, 200, 'Task status updated', task);
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  await taskService.deleteTask(req.params.id as string, req.user!);
  sendSuccess(res, 200, 'Task deleted');
});
