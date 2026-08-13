export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'TEAM_MEMBER';
export type ProjectStatus = 'PLANNED' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';

export interface AdminUser {
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
  manager: Pick<AdminUser, 'id' | 'name' | 'email'>;
  members: { user: Pick<AdminUser, 'id' | 'name' | 'email'> }[];
  _count?: { tasks: number };
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string | null;
  project: { id: string; name: string; managerId: string };
  assignee?: Pick<AdminUser, 'id' | 'name' | 'email'> | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
