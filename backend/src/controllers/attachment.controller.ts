import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import * as attachmentService from '../services/attachment.service';

export const uploadAttachment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('No file provided');

  const attachment = await attachmentService.uploadAttachment(
    req.params.taskId as string,
    req.file,
    req.user!
  );
  sendSuccess(res, 201, 'File uploaded', attachment);
});

export const getAttachments = asyncHandler(async (req: Request, res: Response) => {
  const attachments = await attachmentService.getAttachmentsByTask(req.params.taskId as string, req.user!);
  sendSuccess(res, 200, 'Attachments fetched', attachments);
});

export const deleteAttachment = asyncHandler(async (req: Request, res: Response) => {
  await attachmentService.deleteAttachment(req.params.id as string, req.user!);
  sendSuccess(res, 200, 'Attachment deleted');
});
