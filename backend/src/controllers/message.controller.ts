import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import * as messageService from '../services/message.service';

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const messages = await messageService.getMessagesByProject(req.params.projectId, req.user!);
  sendSuccess(res, 200, 'Messages fetched', messages);
});
