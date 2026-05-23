import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../pages/auth/AuthLayout';
import { ErrorPage } from '../pages/ErrorPage';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../layouts/AppLayout';
import { LazyPage } from './LazyPage';

const LoginPage = lazy(() => import('../pages/auth/LoginPage').then((module) => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import('../pages/auth/SignupPage').then((module) => ({ default: module.SignupPage })));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const ProjectsListPage = lazy(() => import('../pages/projects/ProjectsListPage').then((module) => ({ default: module.ProjectsListPage })));
const ProjectDetailsPage = lazy(() => import('../pages/projects/ProjectDetailsPage').then((module) => ({ default: module.ProjectDetailsPage })));
const MyTasksPage = lazy(() => import('../pages/tasks/MyTasksPage').then((module) => ({ default: module.MyTasksPage })));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const AuditPage = lazy(() => import('../pages/audit/AuditPage').then((module) => ({ default: module.AuditPage })));
const AnalyticsPage = lazy(() => import('../features/analytics/AnalyticsPage').then((module) => ({ default: module.AnalyticsPage })));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
    errorElement: <ErrorPage />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LazyPage><LoginPage /></LazyPage> },
      { path: '/signup', element: <LazyPage><SignupPage /></LazyPage> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <LazyPage><DashboardPage /></LazyPage> },
          { path: '/projects', element: <LazyPage><ProjectsListPage /></LazyPage> },
          { path: '/projects/:projectId', element: <LazyPage><ProjectDetailsPage /></LazyPage> },
          { path: '/my-tasks', element: <LazyPage><MyTasksPage /></LazyPage> },
          { path: '/analytics', element: <LazyPage><AnalyticsPage /></LazyPage> },
          { path: '/audit', element: <LazyPage><AuditPage /></LazyPage> },
          { path: '/profile', element: <LazyPage><ProfilePage /></LazyPage> },
        ],
      },
    ],
  },
  { path: '*', element: <ErrorPage /> },
]);
