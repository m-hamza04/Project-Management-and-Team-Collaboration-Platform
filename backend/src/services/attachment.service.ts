import prisma from '../config/db';
import supabaseAdmin from '../config/supabase';
import { ApiError } from '../utils/apiError';
import { Role } from '@prisma/client';
import { createNotification } from './notification.service';
import { assertProjectAccess } from './project.service';
import { randomUUID } from 'crypto';

const BUCKET = 'task-attachments';

export const uploadAttachment = async (
  taskId: string,
  file: Express.Multer.File,
  user: { id: string; role: Role }
) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: { include: { members: true } } },
  });
  if (!task) throw ApiError.notFound('Task not found');

  // Same access rule as everything else task-related: Admin, the project's
  // PM, or a member of that project.
  assertProjectAccess(task.project, user);

  // Unique storage path so two people uploading "report.pdf" don't collide
  const storagePath = `${taskId}/${randomUUID()}-${file.originalname}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    throw ApiError.badRequest(`File upload failed: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(storagePath);

  // If the DB write fails after a successful storage upload, roll back the
  // uploaded file so we don't leave orphaned files in the bucket.
  try {
    const attachment = await prisma.attachment.create({
      data: {
        taskId,
        uploadedById: user.id,
        fileName: file.originalname,
        fileUrl: publicUrlData.publicUrl,
        fileType: file.mimetype,
        fileSize: file.size,
      },
      include: { uploadedBy: { select: { id: true, name: true, email: true } } },
    });

    const notifyUserId =
      task.assigneeId && task.assigneeId !== user.id ? task.assigneeId : task.project.managerId;

    if (notifyUserId && notifyUserId !== user.id) {
      await createNotification({
        userId: notifyUserId,
        type: 'ATTACHMENT_ADDED',
        message: `A new file was attached to task "${task.title}"`,
      });
    }

    return attachment;
  } catch (dbError) {
    await supabaseAdmin.storage.from(BUCKET).remove([storagePath]);
    throw ApiError.badRequest('Failed to save attachment record');
  }
};

export const getAttachmentsByTask = async (taskId: string, user: { id: string; role: Role }) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: { include: { members: true } } },
  });
  if (!task) throw ApiError.notFound('Task not found');

  assertProjectAccess(task.project, user);

  return prisma.attachment.findMany({
    where: { taskId },
    include: { uploadedBy: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

export const deleteAttachment = async (id: string, user: { id: string; role: Role }) => {
  const attachment = await prisma.attachment.findUnique({
    where: { id },
    include: { task: { include: { project: true } } },
  });
  if (!attachment) throw ApiError.notFound('Attachment not found');

  const isUploader = attachment.uploadedById === user.id;
  const isManager = attachment.task.project.managerId === user.id;
  if (user.role !== Role.ADMIN && !isUploader && !isManager) {
    throw ApiError.forbidden('You cannot delete this attachment');
  }

  // Storage path was saved as part of the public URL; re-derive it for removal
  const storagePath = attachment.fileUrl.split(`${BUCKET}/`)[1];

  await supabaseAdmin.storage.from(BUCKET).remove([storagePath]);
  await prisma.attachment.delete({ where: { id } });
};
