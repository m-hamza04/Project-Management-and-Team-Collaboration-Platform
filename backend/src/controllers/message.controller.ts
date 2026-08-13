import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import * as messageService from '../services/message.service';

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await messageService.createMessage(
    req.params.projectId as string,
    req.user!.id,
    req.user!,
    req.body.content
  );
  sendSuccess(res, 201, 'Message sent', message);
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const messages = await messageService.getMessagesByProject(req.params.projectId as string, req.user!);
  sendSuccess(res, 200, 'Messages fetched', messages);
});
