import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';

export function PublicRoute() {
  const token = useAppSelector((state) => state.auth.token);
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
