import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import * as userService from '../services/user.service';
import { Role } from '@prisma/client';

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  sendSuccess(res, 201, 'User created', user);
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { role, search, page, limit } = req.query;
  const result = await userService.getAllUsers({
    role: role as Role | undefined,
    search: search as string | undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  sendSuccess(res, 200, 'Users fetched', result);
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id);
  sendSuccess(res, 200, 'User fetched', user);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateUser(req.params.id, req.body);
  sendSuccess(res, 200, 'User updated', user);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteUser(req.params.id);
  sendSuccess(res, 200, 'User deleted');
});
