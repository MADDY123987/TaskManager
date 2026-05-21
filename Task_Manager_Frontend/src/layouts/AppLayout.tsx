import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppTopBar } from '../components/layout/AppTopBar';
import { Sidebar } from '../components/layout/Sidebar';
import { useMeQuery } from '../api/authApi';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { clearCredentials, setUser } from '../features/auth/authSlice';

const drawerWidth = 264;

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const token = useAppSelector((state) => state.auth.token);
  const dispatch = useAppDispatch();
  const { data: user } = useMeQuery(undefined, { skip: !token });

  useEffect(() => {
    if (user) dispatch(setUser(user));
  }, [dispatch, user]);

  useEffect(() => {
    const handler = () => dispatch(clearCredentials());
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [dispatch]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppTopBar drawerWidth={drawerWidth} onMenuClick={() => setMobileOpen(true)} />
      <Sidebar width={drawerWidth} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, bgcolor: 'background.default' }}>
        <Toolbar />
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1500, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
