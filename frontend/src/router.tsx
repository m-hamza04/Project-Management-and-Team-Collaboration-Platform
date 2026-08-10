import { createRootRoute, createRoute, createRouter, Navigate, Outlet } from '@tanstack/react-router';
import { useAppSelector } from '@/app/hooks';

import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ProjectsPage } from '@/pages/projects/ProjectsPage';
import { ProjectDetailPage } from '@/pages/projects/ProjectDetailPage';
import { TasksPage } from '@/pages/tasks/TasksPage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { UsersPage } from '@/pages/users/UsersPage';
import { AppLayout } from '@/components/layout/AppLayout';

// Root: just renders whatever child route matched
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Public routes — accessible without a token
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});

// Protected layout: gate every child route behind an auth check,
// then render the shared Sidebar/Topbar shell around them.
function ProtectedLayout() {
  const token = useAppSelector((state) => state.auth.token);
  if (!token) return <Navigate to="/login" />;
  return <AppLayout />;
}

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  component: ProtectedLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const projectsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/projects',
  component: ProjectsPage,
});

const projectDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/projects/$projectId',
  component: ProjectDetailPage,
});

const tasksRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/tasks',
  component: TasksPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/notifications',
  component: NotificationsPage,
});

const profileRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/profile',
  component: ProfilePage,
});

const usersRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/users',
  component: UsersPage,
});

// Root "/" just forwards to the dashboard (which itself redirects to
// /login if there's no token, via ProtectedLayout above it)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Navigate to="/dashboard" />,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  protectedRoute.addChildren([
    dashboardRoute,
    projectsRoute,
    projectDetailRoute,
    tasksRoute,
    notificationsRoute,
    profileRoute,
    usersRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
