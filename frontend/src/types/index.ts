export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'TEAM_MEMBER';
export type ProjectStatus = 'PLANNED' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_STATUS_UPDATED'
  | 'DISCUSSION_ADDED'
  | 'DEADLINE_APPROACHING'
  | 'PROJECT_ASSIGNED'
  | 'ATTACHMENT_ADDED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  priority: Priority;
  status: ProjectStatus;
  createdAt: string;
  manager: Pick<User, 'id' | 'name' | 'email'>;
  members: { user: Pick<User, 'id' | 'name' | 'email'> }[];
  _count?: { tasks: number };
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string | null;
  createdAt: string;
  project: { id: string; name: string; managerId: string };
  assignee?: Pick<User, 'id' | 'name' | 'email'> | null;
  creator: Pick<User, 'id' | 'name' | 'email'>;
  _count?: { discussions: number };
}

export interface TaskDiscussion {
  id: string;
  message: string;
  createdAt: string;
  author: Pick<User, 'id' | 'name' | 'email' | 'role'>;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  uploadedBy: Pick<User, 'id' | 'name' | 'email'>;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
