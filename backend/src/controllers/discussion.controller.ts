import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import * as discussionService from '../services/discussion.service';

export const addMessage = asyncHandler(async (req: Request, res: Response) => {
  const discussion = await discussionService.addDiscussionMessage(
    req.params.taskId,
    req.user!.id,
    req.user!,
    req.body.message
  );
  sendSuccess(res, 201, 'Message added', discussion);
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const messages = await discussionService.getDiscussionByTask(req.params.taskId, req.user!);
  sendSuccess(res, 200, 'Messages fetched', messages);
});
