import { createRootRoute, createRoute, createRouter, Navigate, Outlet } from '@tanstack/react-router';
import { useAuth } from '@/auth/AuthContext';
import { LoginPage } from '@/pages/login/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { UsersPage } from '@/pages/users/UsersPage';
import { ProjectsPage } from '@/pages/projects/ProjectsPage';
import { AdminLayout } from '@/components/layout/AdminLayout';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

function ProtectedLayout() {
  const { token, user } = useAuth();
  if (!token || user?.role !== 'ADMIN') return <Navigate to="/login" />;
  return <AdminLayout />;
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

const usersRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/users',
  component: UsersPage,
});

const projectsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/projects',
  component: ProjectsPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Navigate to="/dashboard" />,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  protectedRoute.addChildren([dashboardRoute, usersRoute, projectsRoute]),
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
