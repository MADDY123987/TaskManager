import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../pages/auth/AuthLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ErrorPage } from '../pages/ErrorPage';
import { ProjectDetailsPage } from '../pages/projects/ProjectDetailsPage';
import { ProjectsListPage } from '../pages/projects/ProjectsListPage';
import { MyTasksPage } from '../pages/tasks/MyTasksPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../layouts/AppLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
    errorElement: <ErrorPage />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/projects', element: <ProjectsListPage /> },
          { path: '/projects/:projectId', element: <ProjectDetailsPage /> },
          { path: '/my-tasks', element: <MyTasksPage /> },
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <ErrorPage /> },
]);
