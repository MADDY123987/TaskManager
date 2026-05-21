import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingPage } from '../components/common/LoadingPage';
import { setUser } from '../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { useMeQuery } from '../api/authApi';
import { useEffect } from 'react';

export function ProtectedRoute() {
  const token = useAppSelector((state) => state.auth.token);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { data: user, isLoading } = useMeQuery(undefined, { skip: !token });

  useEffect(() => {
    if (user) dispatch(setUser(user));
  }, [dispatch, user]);

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (isLoading) return <LoadingPage />;
  return <Outlet />;
}
